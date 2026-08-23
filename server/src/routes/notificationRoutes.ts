import { Router } from 'express';
import { notificationController } from '../controllers/notificationController.js';

const router = Router();

// GET /api/notifications
router.get('/', (req, res, next) => notificationController.getNotifications(req, res, next));

// PATCH /api/notifications/:id/read
router.patch('/:id/read', (req, res, next) => notificationController.markAsRead(req, res, next));

// PATCH /api/notifications/read-all
router.patch('/read-all', (req, res, next) => notificationController.markAllAsRead(req, res, next));

// GET /api/notifications/metrics
router.get('/metrics', (req, res, next) => notificationController.getMetrics(req, res, next));

export const notificationRoutes = router;
