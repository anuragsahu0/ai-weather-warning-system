import { Request, Response, NextFunction } from 'express';
import { sourceRegistry } from '../services/providers/sourceRegistry.js';
import { successResponse } from '../utils/apiResponse.js';

export class SourcesController {
  async getSourcesStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sources = sourceRegistry.getAllSourcesMetadata();
      res.status(200).json(
        successResponse(
          {
            totalSources: sources.length,
            activeCount: sources.filter((s) => s.status === 'ACTIVE').length,
            sources,
          },
          'Multi-source weather registry health status resolved'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

export const sourcesController = new SourcesController();
