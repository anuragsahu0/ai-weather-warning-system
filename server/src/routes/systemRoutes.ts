import { Router } from 'express';
import { systemController } from '../controllers/systemController.js';
import { monitoringController } from '../controllers/monitoringController.js';

const router = Router();

// GET /api/system/status
router.get('/status', (req, res, next) => systemController.getStatus(req, res, next));

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

export const systemRoutes = router;
