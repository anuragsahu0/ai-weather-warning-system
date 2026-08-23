import { Router } from 'express';
import { subscriptionController } from '../controllers/subscriptionController.js';

const router = Router();

// POST /api/subscriptions
router.post('/', (req, res, next) => subscriptionController.createSubscription(req, res, next));

// GET /api/subscriptions
router.get('/', (req, res, next) => subscriptionController.getSubscriptions(req, res, next));

// PATCH /api/subscriptions/:id
router.patch('/:id', (req, res, next) => subscriptionController.updateSubscription(req, res, next));

// DELETE /api/subscriptions/:id
router.delete('/:id', (req, res, next) =>
  subscriptionController.deleteSubscription(req, res, next)
);

export const subscriptionRoutes = router;
