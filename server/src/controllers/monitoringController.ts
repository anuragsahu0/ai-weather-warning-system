import { Request, Response, NextFunction } from 'express';
import { systemHealthService } from '../services/monitoring/systemHealthService.js';
import { dataQualityService } from '../services/monitoring/dataQualityService.js';
import { modelMonitoringService } from '../services/monitoring/modelMonitoringService.js';
import { successResponse } from '../utils/apiResponse.js';

export class MonitoringController {
  async getHealthReport(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await systemHealthService.getHealthReport();
      res.status(200).json(
        successResponse(report, 'System production health verification resolved')
      );
    } catch (error) {
      next(error);
    }
  }

  async getLiveness(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isLive = await systemHealthService.isLive();
      res.status(isLive ? 200 : 503).json({
        status: isLive ? 'ALIVE' : 'UNAVAILABLE',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getReadiness(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isReady = await systemHealthService.isReady();
      res.status(isReady ? 200 : 503).json({
        status: isReady ? 'READY' : 'NOT_READY',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getDataQuality(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = dataQualityService.getDataQualityReport();
      res.status(200).json(
        successResponse(report, 'Data quality & telemetry freshness metrics resolved')
      );
    } catch (error) {
      next(error);
    }
  }

  async getModelMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const specs = modelMonitoringService.getModelSpecs();
      const comparison = modelMonitoringService.getMetricsComparison();
      const horizonPerf = modelMonitoringService.getHorizonPerformance();
      const sourceAblation = modelMonitoringService.getSourceAblation();
      const drift = modelMonitoringService.getDriftMonitoring();

      res.status(200).json(
        successResponse(
          {
            specs,
            comparison,
            horizonPerf,
            sourceAblation,
            drift,
          },
          'Model monitoring and comparative test metrics resolved'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

export const monitoringController = new MonitoringController();
