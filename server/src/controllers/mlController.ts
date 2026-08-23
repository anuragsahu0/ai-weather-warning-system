import { Request, Response, NextFunction } from 'express';
import { mlInferenceService } from '../services/mlInferenceService.js';
import { successResponse } from '../utils/apiResponse.js';

export class MLController {
  async getStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await mlInferenceService.getStatus();
      res.status(200).json(successResponse(status, 'ML microservice health & loaded model registry'));
    } catch (error) {
      next(error);
    }
  }

  async getEvaluation(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const evaluation = await mlInferenceService.getModelEvaluation();
      res.status(200).json(successResponse(evaluation, 'Model comparison and test split evaluation metrics'));
    } catch (error) {
      next(error);
    }
  }
}

export const mlController = new MLController();
