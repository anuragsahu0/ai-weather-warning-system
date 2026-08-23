import { Request, Response, NextFunction } from 'express';
import { systemService } from '../services/systemService.js';
import { successResponse } from '../utils/apiResponse.js';

export class SystemController {
  async getStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await systemService.getSystemStatus();
      res.status(200).json(successResponse(status, 'ERROR 404 System Status Telemetry'));
    } catch (error) {
      next(error);
    }
  }
}

export const systemController = new SystemController();
