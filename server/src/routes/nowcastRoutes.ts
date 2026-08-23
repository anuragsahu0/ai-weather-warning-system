import { Router } from 'express';
import { nowcastController } from '../controllers/nowcastController.js';

const router = Router();

// GET /api/nowcast (Primary Spatio-Temporal Nowcast)
router.get('/', (req, res, next) => nowcastController.getNowcast(req, res, next));

// GET /api/nowcast/baseline (Phase 5 Baseline Model)
router.get('/baseline', (req, res, next) =>
  nowcastController.getBaselinePrediction(req, res, next)
);

// GET /api/nowcast/comparison (Baseline vs Spatio-Temporal Benchmark)
router.get('/comparison', (req, res, next) =>
  nowcastController.getBenchmarkComparison(req, res, next)
);

export const nowcastRoutes = router;
