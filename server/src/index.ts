import { createApp } from './app.js';
import { config } from './config/index.js';
import { ingestionScheduler } from './services/weather/scheduler.js';

const app = createApp();

const server = app.listen(config.PORT, () => {
  console.log(`
  =============================================================
  🌩️  ERROR 404 — SEVERE WEATHER NOWCASTING PLATFORM
  📡  Backend API Server: http://localhost:${config.PORT}
  🏥  Health Check:       http://localhost:${config.PORT}/api/health
  📊  System Status:      http://localhost:${config.PORT}/api/system/status
  🌤️  Live Weather API:   http://localhost:${config.PORT}/api/weather/current
  🛡️  Environment:        ${config.NODE_ENV}
  =============================================================
  `);

  // Start background ingestion worker
  ingestionScheduler.start();
});

// Graceful Shutdown
function shutdown(signal: string) {
  console.log(`Received ${signal}. Gracefully terminating ERROR 404 server...`);
  ingestionScheduler.stop();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
