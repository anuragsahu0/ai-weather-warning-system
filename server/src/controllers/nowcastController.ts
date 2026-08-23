import { Request, Response, NextFunction } from 'express';
import { nowcastService } from '../services/nowcastService.js';
import { successResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import {
  BaselineNowcastQuerySchema,
  SpatioTemporalNowcastQuerySchema,
} from '../../../shared/schemas/index.js';

export class NowcastController {
  async getNowcast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = SpatioTemporalNowcastQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw ApiError.badRequest(
          `Invalid nowcast query parameters: ${parsed.error.issues.map((i) => i.message).join('; ')}`
        );
      }

      const { gridId, lat, lon, horizon } = parsed.data;
      const prediction = await nowcastService.getSpatioTemporalNowcast(gridId, lat, lon, horizon);

      res.status(200).json(successResponse(prediction, 'Spatio-Temporal ConvLSTM nowcast prediction resolved'));
    } catch (error) {
      next(error);
    }
  }

  async getBaselinePrediction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = BaselineNowcastQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw ApiError.badRequest(
          `Invalid query parameters: ${parsed.error.issues.map((i) => i.message).join('; ')}`
        );
      }

      const { gridId, lat, lon, task, horizon } = parsed.data;
      const prediction = await nowcastService.getBaselinePrediction(gridId, lat, lon, task, horizon);

      res.status(200).json(successResponse(prediction, 'AI/ML baseline nowcast prediction resolved'));
    } catch (error) {
      next(error);
    }
  }

  async getBenchmarkComparison(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comparison = await nowcastService.getBenchmarkComparison();
      res.status(200).json(
        successResponse(
          comparison,
          'Phase 5 Baseline vs Phase 6 Spatio-Temporal Model benchmark evaluation'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

export const nowcastController = new NowcastController();
