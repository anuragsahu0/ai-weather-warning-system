import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/notifications/subscriptionService.js';
import { successResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import {
  CreateSubscriptionSchema,
  UpdateSubscriptionSchema,
} from '../../../shared/schemas/index.js';

export class SubscriptionController {
  async createSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = CreateSubscriptionSchema.safeParse(req.body);
      if (!parsed.success) {
        throw ApiError.badRequest(
          `Invalid subscription payload: ${parsed.error.issues.map((i) => i.message).join('; ')}`
        );
      }

      const sub = await subscriptionService.createSubscription(parsed.data);

      res.status(201).json(
        successResponse(sub, 'Early-warning location subscription registered successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async getSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.query.userId as string) || 'ANONYMOUS';
      const subscriptions = await subscriptionService.getSubscriptionsByUser(userId);

      res.status(200).json(
        successResponse(
          {
            total: subscriptions.length,
            subscriptions,
          },
          'User subscriptions resolved'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async updateSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const parsed = UpdateSubscriptionSchema.safeParse(req.body);
      if (!parsed.success) {
        throw ApiError.badRequest(
          `Invalid update payload: ${parsed.error.issues.map((i) => i.message).join('; ')}`
        );
      }

      const userId = (req.body.userId as string) || 'ANONYMOUS';
      const updated = await subscriptionService.updateSubscription(id, userId, parsed.data);

      if (!updated) {
        throw ApiError.notFound(`Subscription ${id} not found or unauthorized`);
      }

      res.status(200).json(
        successResponse(updated, 'Subscription updated successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const userId = (req.query.userId as string) || (req.body.userId as string) || 'ANONYMOUS';

      const success = await subscriptionService.deleteSubscription(id, userId);
      if (!success) {
        throw ApiError.notFound(`Subscription ${id} not found or unauthorized`);
      }

      res.status(200).json(
        successResponse({ subscriptionId: id, deleted: true }, 'Subscription removed successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();
