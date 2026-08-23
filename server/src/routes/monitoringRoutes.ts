import { Router } from 'express';
import { monitoringController } from '../controllers/monitoringController.js';

const router = Router();

// GET /api/system/health
router.get('/health', (req, res, next) => monitoringController.getHealthReport(req, res, next));

// GET /api/system/data-quality
router.get('/data-quality', (req, res, next) =>
  monitoringController.getDataQuality(req, res, next)
);

// GET /api/system/model-metrics
router.get('/model-metrics', (req, res, next) =>
  monitoringController.getModelMetrics(req, res, next)
);

export const monitoringRoutes = router;
