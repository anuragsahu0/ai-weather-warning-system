import { Request, Response, NextFunction } from 'express';
import { gridService } from '../services/gridService.js';
import { successResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import {
  GridCoordinateQuerySchema,
  GridNearbyQuerySchema,
  GridBoundsQuerySchema,
  GridHistoryQuerySchema,
} from '../../../shared/schemas/index.js';

export class GridController {
  async getCurrentGrid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = GridCoordinateQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw ApiError.badRequest(`Invalid coordinate query: ${parsed.error.issues.map((i) => i.message).join('; ')}`);
      }

      const { lat, lon, resolution, includeWeather } = parsed.data;
      const cell = await gridService.getCurrentGrid(lat, lon, resolution, includeWeather);
      res.status(200).json(successResponse(cell, 'Hyper-local grid cell resolved'));
    } catch (error) {
      next(error);
    }
  }

  async getNearbyGrids(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = GridNearbyQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw ApiError.badRequest(`Invalid nearby query: ${parsed.error.issues.map((i) => i.message).join('; ')}`);
      }

      const { lat, lon, radius, resolution, includeWeather } = parsed.data;
      const result = await gridService.getNearbyGrids(lat, lon, radius, resolution, includeWeather);
      res.status(200).json(successResponse(result, `Radial grid cells within ${radius}km`));
    } catch (error) {
      next(error);
    }
  }

  async getBoundsGrids(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = GridBoundsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw ApiError.badRequest(`Invalid bounding box query: ${parsed.error.issues.map((i) => i.message).join('; ')}`);
      }

      const { north, south, east, west, resolution, includeWeather, limit } = parsed.data;
      const result = await gridService.getBoundsGrids(north, south, east, west, resolution, includeWeather, limit);
      res.status(200).json(successResponse(result, 'Bounding box grid cells resolved'));
    } catch (error) {
      next(error);
    }
  }

  async getGridWeather(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const gridId = req.query.gridId as string;
      if (!gridId) {
        throw ApiError.badRequest('Query parameter "gridId" is required');
      }

      const state = await gridService.getGridWeather(gridId);
      res.status(200).json(successResponse(state, 'Grid cell current weather state'));
    } catch (error) {
      next(error);
    }
  }

  async getGridHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = GridHistoryQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw ApiError.badRequest(`Invalid history query: ${parsed.error.issues.map((i) => i.message).join('; ')}`);
      }

      const { gridId, start, end, limit } = parsed.data;
      const history = await gridService.getGridHistory(gridId, start, end, limit);
      res.status(200).json(successResponse(history, 'Grid cell historical weather states'));
    } catch (error) {
      next(error);
    }
  }

  async getRegions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const regions = await gridService.getAllRegions();
      res.status(200).json(successResponse(regions, 'Operational meteorological regions'));
    } catch (error) {
      next(error);
    }
  }
}

export const gridController = new GridController();
