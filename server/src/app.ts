import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { ApiError } from './utils/apiError.js';
import { systemHealthService } from './services/monitoring/systemHealthService.js';

export function createApp(): Express {
  const app = express();

  // Security Headers & CORS
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Request parsing & logging
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(requestLogger);

  // Liveness & Readiness Probes (Kubernetes / Production Gateway Compatible)
  app.get(['/health/live', '/liveness'], async (_req, res) => {
    const isLive = await systemHealthService.isLive();
    res.status(isLive ? 200 : 503).json({
      status: isLive ? 'ALIVE' : 'UNAVAILABLE',
      timestamp: new Date().toISOString(),
    });
  });

  app.get(['/health/ready', '/readiness'], async (_req, res) => {
    const isReady = await systemHealthService.isReady();
    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'READY' : 'NOT_READY',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Router
  app.use('/api', apiRoutes);

  // Handle Unknown Routes
  app.use((req, _res, next) => {
    next(ApiError.notFound(`Endpoint not found: ${req.method} ${req.originalUrl}`));
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
