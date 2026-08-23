import { Router } from 'express';
import { riskController } from '../controllers/riskController.js';

const router = Router();

// GET /api/risk (Active Localized Risk Assessment)
router.get('/', (req, res, next) => riskController.getRiskAssessment(req, res, next));

// GET /api/risk/hotspots (Spatial Risk Hotspots)
router.get('/hotspots', (req, res, next) => riskController.getRiskHotspots(req, res, next));

// GET /api/risk/overview (City-Wide Risk Overview)
router.get('/overview', (req, res, next) => riskController.getRiskOverview(req, res, next));

// GET /api/risk/history (Historical Assessments Query)
router.get('/history', (req, res, next) => riskController.getRiskHistory(req, res, next));

// GET /api/risk/verification (Prediction vs Actual Ground-Truth Metrics)
router.get('/verification', (req, res, next) =>
  riskController.getVerificationMetrics(req, res, next)
);

export const riskRoutes = router;
