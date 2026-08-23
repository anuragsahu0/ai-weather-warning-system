import { Request, Response, NextFunction } from 'express';
import { alertDecisionService } from '../services/notifications/alertDecisionService.js';
import { alertProcessor } from '../services/notifications/alertProcessor.js';
import { riskAssessmentService } from '../services/risk/riskAssessmentService.js';
import { HazardType } from '../services/risk/riskTypes.js';
import { successResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { AlertEventQuerySchema } from '../../../shared/schemas/index.js';

export class AlertEventsController {
  async getAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = AlertEventQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw ApiError.badRequest(
          `Invalid alert query parameters: ${parsed.error.issues.map((i) => i.message).join('; ')}`
        );
      }

      const activeAlerts = alertDecisionService.getActiveAlerts();

      res.status(200).json(
        successResponse(
          {
            total: activeAlerts.length,
            alerts: activeAlerts,
          },
          'Active emergency alert events resolved'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getAlertById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const alert = alertDecisionService.getAlertById(id);
      if (!alert) {
        throw ApiError.notFound(`Alert event ${id} not found or expired`);
      }

      res.status(200).json(
        successResponse(alert, 'Alert event detail resolved')
      );
    } catch (error) {
      next(error);
    }
  }

  async evaluateAndTrigger(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lat = req.body.lat !== undefined ? Number(req.body.lat) : 28.6139;
      const lon = req.body.lon !== undefined ? Number(req.body.lon) : 77.209;
      const hazard = (req.body.hazard as HazardType) || 'HEAVY_RAIN';
      const horizon = req.body.horizon ? Number(req.body.horizon) : 30;

      // 1. Get Phase 8 Risk Assessment
      const assessment = await riskAssessmentService.assessRisk(undefined, lat, lon, hazard, horizon);

      // 2. Process Alert and Dispatches
      const result = await alertProcessor.processRiskAssessment(assessment);

      res.status(200).json(
        successResponse(
          {
            assessmentSummary: {
              gridId: assessment.gridId,
              hazardType: assessment.hazardType,
              riskLevel: assessment.riskLevel,
              riskScore: assessment.riskScore,
            },
            alertProcessing: result,
          },
          'Risk assessment evaluated against notification threshold policies'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

export const alertEventsController = new AlertEventsController();
