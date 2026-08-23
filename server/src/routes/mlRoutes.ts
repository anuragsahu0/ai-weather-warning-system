import { Router } from 'express';
import { mlController } from '../controllers/mlController.js';

const router = Router();

// GET /api/ml/status
router.get('/status', (req, res, next) => mlController.getStatus(req, res, next));

// GET /api/ml/evaluation
router.get('/evaluation', (req, res, next) => mlController.getEvaluation(req, res, next));

export const mlRoutes = router;
