import fs from 'fs/promises';
import path from 'path';
import {
  HistoricalImportOptions,
  HistoricalPipelineResult,
  NormalizedHistoricalObservation,
} from './types.js';
import { FeatureRecord, Dataset, DatasetVersion } from '../../../../shared/types/index.js';
import { historicalProvider } from './historicalProvider.js';
import { temporalAligner } from './temporalAligner.js';
import { featureEngineer } from './featureEngineer.js';
import { targetGenerator } from './targetGenerator.js';
import { datasetSplitter } from './datasetSplitter.js';
import { qualityAuditor } from './qualityAuditor.js';
import { regionService } from '../geospatial/regionService.js';
import { gridEngine } from '../geospatial/gridEngine.js';
import { prisma } from '../../config/db.js';

export class HistoricalPipeline {
  private dataDir: string;

  constructor() {
    this.dataDir = path.resolve(process.cwd(), 'data');
  }

  async runPipeline(options: HistoricalImportOptions): Promise<HistoricalPipelineResult> {
    const {
      datasetName,
      regionCode,
      startDate,
      endDate,
      temporalResolutionMinutes = 60,
      spatialResolutionDegrees = 0.01,
      trainRatio = 0.7,
      valRatio = 0.15,
    } = options;

    const region = regionService.getRegionById(regionCode) || regionService.getRegionById('region-delhi-ncr')!;
    const { latitude, longitude } = region.centerCoordinates;

    console.log(`[HistoricalPipeline] Initiating historical import for ${region.name} (${startDate} to ${endDate})...`);

    // 1. Ingest Raw Historical Archive Data
    const rawData = await historicalProvider.fetchHistoricalRange(latitude, longitude, startDate, endDate);

    // Save Raw Payload to Data Lake
    await this.saveDataLakeFile('raw', `${datasetName}-${regionCode}-raw.json`, rawData);

    // 2. Align & Normalize Time Series
    const observations = temporalAligner.alignAndNormalize(rawData, spatialResolutionDegrees);
    await this.saveDataLakeFile('normalized', `${datasetName}-${regionCode}-normalized.json`, observations);

    // 3. Construct Features & Targets
    const featureRecords: FeatureRecord[] = [];
    const totalObs = observations.length;
    const versionTag = `v1.0-${startDate.replace(/-/g, '')}_${endDate.replace(/-/g, '')}`;

    for (let i = 0; i < totalObs; i++) {
      const obs = observations[i];
      const features = featureEngineer.constructFeatureVector(observations, i);
      const targets = targetGenerator.generateTargets(observations, i);
      const splitType = datasetSplitter.getSplitTypeForIndex(i, totalObs, trainRatio, valRatio);

      const record: FeatureRecord = {
        id: `feat-${obs.gridCode}-${new Date(obs.observedAt).getTime()}`,
        datasetVersionId: `ver-${datasetName}-${versionTag}`,
        gridId: obs.gridId,
        gridCode: obs.gridCode,
        timestamp: obs.observedAt,
        splitType,
        features,
        targets,
        createdAt: new Date().toISOString(),
      };

      featureRecords.push(record);
    }

    // 4. Chronological Splitting & Audit Report
    const splitResult = datasetSplitter.splitChronological(observations, trainRatio, valRatio);
    const qualityReport = qualityAuditor.generateQualityReport(datasetName, versionTag, observations, featureRecords);

    // Save Features & Validation Audit Report to Data Lake
    await this.saveDataLakeFile('features', `${datasetName}-${versionTag}-features.json`, featureRecords);
    await this.saveDataLakeFile('validation', `${datasetName}-${versionTag}-quality-report.json`, qualityReport);

    const datasetId = `ds-${datasetName}`;
    const datasetObj: Dataset = {
      id: datasetId,
      name: datasetName,
      description: `Historical meteorological reanalysis dataset for ${region.name} (${startDate} to ${endDate})`,
      source: 'Open-Meteo Historical Archive / ECMWF ERA5',
      temporalResolutionMinutes,
      spatialResolutionDegrees,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const versionObj: DatasetVersion = {
      id: `ver-${datasetName}-${versionTag}`,
      datasetId,
      versionTag,
      recordCount: totalObs,
      splitStats: splitResult.stats,
      qualityReport,
      createdAt: new Date().toISOString(),
    };

    // 5. Database Persistence (Safe with Standby Catch)
    await this.persistDatasetToDb(datasetObj, versionObj, observations, featureRecords);

    console.log(`[HistoricalPipeline] Pipeline complete. Processed ${totalObs} records (Quality Score: ${qualityReport.overallQualityScore}/100)`);

    return {
      dataset: datasetObj,
      version: versionObj,
      totalRecords: totalObs,
      splitStats: splitResult.stats,
      qualityReport,
      featureRecords,
    };
  }

  private async persistDatasetToDb(
    dataset: Dataset,
    version: DatasetVersion,
    observations: NormalizedHistoricalObservation[],
    features: FeatureRecord[]
  ): Promise<void> {
    try {
      // Upsert Dataset
      await prisma.dataset.upsert({
        where: { name: dataset.name },
        update: { updatedAt: new Date() },
        create: {
          id: dataset.id,
          name: dataset.name,
          description: dataset.description,
          source: dataset.source,
          temporalResolutionMinutes: dataset.temporalResolutionMinutes,
          spatialResolutionDegrees: dataset.spatialResolutionDegrees,
        },
      });

      // Upsert Version
      await prisma.datasetVersion.upsert({
        where: {
          datasetId_versionTag: {
            datasetId: dataset.id,
            versionTag: version.versionTag,
          },
        },
        update: {
          recordCount: version.recordCount,
          trainCount: version.splitStats.trainCount,
          valCount: version.splitStats.valCount,
          testCount: version.splitStats.testCount,
        },
        create: {
          id: version.id,
          datasetId: dataset.id,
          versionTag: version.versionTag,
          recordCount: version.recordCount,
          trainCount: version.splitStats.trainCount,
          valCount: version.splitStats.valCount,
          testCount: version.splitStats.testCount,
          startDate: new Date(version.splitStats.trainStartDate || new Date()),
          endDate: new Date(version.splitStats.testEndDate || new Date()),
          qualitySummaryJson: version.qualityReport as object,
          metadataJson: version.splitStats as object,
        },
      });

      // Ensure grid exists
      if (observations.length > 0) {
        const gridCell = gridEngine.getGridCell(observations[0].latitude, observations[0].longitude, 0.01);
        await prisma.weatherGrid.upsert({
          where: { gridCode: gridCell.gridCode },
          update: {},
          create: {
            id: gridCell.id,
            gridCode: gridCell.gridCode,
            resolutionDegrees: gridCell.resolutionDegrees,
            resolutionKm: gridCell.resolutionKm,
            northLat: gridCell.bounds.north,
            southLat: gridCell.bounds.south,
            eastLng: gridCell.bounds.east,
            westLng: gridCell.bounds.west,
            centerLat: gridCell.center.latitude,
            centerLng: gridCell.center.longitude,
          },
        });
      }
    } catch {
      // Database in standby mode
    }
  }

  private async saveDataLakeFile(folder: string, filename: string, data: unknown): Promise<void> {
    try {
      const dir = path.join(this.dataDir, folder);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn(`[HistoricalPipeline] Could not write file to data/${folder}/${filename}:`, (err as Error).message);
    }
  }
}

export const historicalPipeline = new HistoricalPipeline();
