import { Request, Response, NextFunction } from 'express';
import { weatherFusionService } from '../services/fusion/weatherFusionService.js';
import { radarProvider } from '../services/providers/radarProvider.js';
import { lightningProvider } from '../services/providers/lightningProvider.js';
import { successResponse } from '../utils/apiResponse.js';
import { FusedWeatherQuerySchema } from '../../../shared/schemas/index.js';
import { ApiError } from '../utils/apiError.js';

export class FusedWeatherController {
  async getFusedWeather(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = FusedWeatherQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw ApiError.badRequest(
          `Invalid query parameters: ${parsed.error.issues.map((i) => i.message).join('; ')}`
        );
      }

      const { lat, lon, gridId } = parsed.data;
      const targetLat = lat ?? 28.6139;
      const targetLon = lon ?? 77.209;
      const targetGrid = gridId ?? 'GRID_R01_N2861_E07720';

      const result = await weatherFusionService.fuseWeatherForGrid(targetLat, targetLon, targetGrid);

      res.status(200).json(
        successResponse(
          result,
          'Deterministic multi-source fused grid weather state resolved with complete data lineage'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getRadarTiles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tiles = await radarProvider.getRadarTileMetadata();
      res.status(200).json(
        successResponse(
          tiles,
          'Real-time RainViewer Doppler radar tile metadata resolved'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getLightningActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lat = req.query.lat ? Number(req.query.lat) : 28.6139;
      const lon = req.query.lon ? Number(req.query.lon) : 77.209;
      const ltg = await lightningProvider.fetchData(lat, lon);

      res.status(200).json(
        successResponse(
          ltg.data,
          'Localized convective lightning stroke density resolved'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

export const fusedWeatherController = new FusedWeatherController();
