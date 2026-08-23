import { Request, Response, NextFunction } from 'express';
import { datasetService } from '../services/datasetService.js';
import { successResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import {
  FeatureQuerySchema,
  DatasetImportRequestSchema,
} from '../../../shared/schemas/index.js';
import { config } from '../config/index.js';

export class DatasetController {
  async listDatasets(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datasets = await datasetService.listDatasets();
      res.status(200).json(successResponse(datasets, 'Historical meteorological datasets'));
    } catch (error) {
      next(error);
    }
  }

  async getDatasetVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datasetId = String(req.params.datasetId || '');
      const versionTag = String(req.params.versionTag || '');
      if (!datasetId || !versionTag) {
        throw ApiError.badRequest('Parameters datasetId and versionTag are required');
      }

      const version = await datasetService.getDatasetVersion(datasetId, versionTag);
      res.status(200).json(successResponse(version, 'Dataset version metadata & split statistics'));
    } catch (error) {
      next(error);
    }
  }

  async getFeatures(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = FeatureQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw ApiError.badRequest(`Invalid feature query: ${parsed.error.issues.map((i) => i.message).join('; ')}`);
      }

      const { gridId, datasetVersion, split, limit } = parsed.data;
      const result = await datasetService.getFeatures(gridId, datasetVersion, split, limit);
      res.status(200).json(successResponse(result, 'Model-ready feature vectors'));
    } catch (error) {
      next(error);
    }
  }

  async getQualityReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const versionId = req.query.versionId as string | undefined;
      const report = await datasetService.getQualityReport(versionId);
      res.status(200).json(successResponse(report, 'Dataset quality audit report'));
    } catch (error) {
      next(error);
    }
  }

  async importHistoricalDataset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminSecret = req.headers['x-admin-secret'];
      if (config.NODE_ENV === 'production' && adminSecret !== config.ADMIN_INGEST_SECRET) {
        throw ApiError.unauthorized('Invalid or missing admin dataset import token');
      }

      const parsed = DatasetImportRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw ApiError.badRequest(`Invalid import options: ${parsed.error.issues.map((i) => i.message).join('; ')}`);
      }

      const version = await datasetService.importHistoricalDataset(parsed.data);
      res.status(201).json(successResponse(version, 'Historical dataset pipeline executed successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const datasetController = new DatasetController();
