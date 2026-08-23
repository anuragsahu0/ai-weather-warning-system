import { Router } from 'express';
import { sourcesController } from '../controllers/sourcesController.js';

const router = Router();

// GET /api/sources/status
router.get('/status', (req, res, next) => sourcesController.getSourcesStatus(req, res, next));

export const sourcesRoutes = router;
