import { Request, Response, NextFunction } from 'express';
import { healthService } from '../services/healthService.js';
import { successResponse } from '../utils/apiResponse.js';

export class HealthController {
  async getHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await healthService.getHealth();
      res.status(200).json(successResponse(health, 'ERROR 404 Backend Operational'));
    } catch (error) {
      next(error);
    }
  }
}

export const healthController = new HealthController();
