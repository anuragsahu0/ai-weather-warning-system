import { Request, Response, NextFunction } from 'express';
import { notificationQueue } from '../services/notifications/notificationQueue.js';
import { subscriptionService } from '../services/notifications/subscriptionService.js';
import { successResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { NotificationQuerySchema } from '../../../shared/schemas/index.js';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = NotificationQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw ApiError.badRequest(
          `Invalid notification query parameters: ${parsed.error.issues.map((i) => i.message).join('; ')}`
        );
      }

      const userId = parsed.data.userId || 'ANONYMOUS';
      const limit = parsed.data.limit || 20;

      const notifications = notificationQueue.getNotificationsByUser(userId, limit);

      res.status(200).json(
        successResponse(
          {
            total: notifications.length,
            notifications,
          },
          'User early-warning notification feed resolved'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const success = notificationQueue.markNotificationAsRead(id);
      if (!success) {
        throw ApiError.notFound(`Notification record ${id} not found`);
      }

      res.status(200).json(
        successResponse({ notificationId: id, status: 'READ' }, 'Notification marked as read')
      );
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.body.userId as string) || 'ANONYMOUS';
      const updatedCount = notificationQueue.markAllAsRead(userId);

      res.status(200).json(
        successResponse(
          { updatedCount },
          `Marked ${updatedCount} notifications as read for user ${userId}`
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeSubs = await subscriptionService.getAllActiveSubscriptions();
      const metrics = notificationQueue.getMetrics(activeSubs.length);

      res.status(200).json(
        successResponse(metrics, 'Early-warning notification delivery metrics resolved')
      );
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
