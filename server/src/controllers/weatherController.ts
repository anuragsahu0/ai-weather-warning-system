import { Request, Response, NextFunction } from 'express';
import { weatherService } from '../services/weatherService.js';
import { successResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { config } from '../config/index.js';

export class WeatherController {
  async getCurrentWeather(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      const locationId = req.query.locationId as string | undefined;

      if (isNaN(lat) || isNaN(lon)) {
        throw ApiError.badRequest('Query parameters "lat" and "lon" must be valid floating point coordinates');
      }

      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw ApiError.badRequest('Coordinates out of physical bounds: lat [-90, 90], lon [-180, 180]');
      }

      const weather = await weatherService.getCurrentWeather(lat, lon, locationId);
      res.status(200).json(successResponse(weather, 'Current weather observation retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async getStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await weatherService.getIngestionStatus();
      res.status(200).json(successResponse(status, 'Weather ingestion telemetry'));
    } catch (error) {
      next(error);
    }
  }

  async manualIngest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminSecret = req.headers['x-admin-secret'];
      if (config.NODE_ENV === 'production' && adminSecret !== config.ADMIN_INGEST_SECRET) {
        throw ApiError.unauthorized('Invalid or missing admin ingestion authorization token');
      }

      const { latitude, longitude, locationId, force } = req.body || {};
      const result = await weatherService.manualIngest(latitude, longitude, locationId, force ?? true);
      res.status(200).json(successResponse(result, 'Manual weather ingestion triggered'));
    } catch (error) {
      next(error);
    }
  }

  async searchLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = req.query.q as string | undefined;
      const locations = weatherService.searchPresetLocations(q);
      res.status(200).json(successResponse(locations, 'Preset meteorological sectors'));
    } catch (error) {
      next(error);
    }
  }
}

export const weatherController = new WeatherController();
