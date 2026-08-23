import { Router } from 'express';
import { alertEventsController } from '../controllers/alertEventsController.js';

const router = Router();

// GET /api/alerts
router.get('/', (req, res, next) => alertEventsController.getAlerts(req, res, next));

// POST /api/alerts/evaluate
router.post('/evaluate', (req, res, next) =>
  alertEventsController.evaluateAndTrigger(req, res, next)
);

// GET /api/alerts/:id
router.get('/:id', (req, res, next) => alertEventsController.getAlertById(req, res, next));

export const alertEventsRoutes = router;
