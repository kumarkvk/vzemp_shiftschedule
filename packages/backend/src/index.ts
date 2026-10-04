import { createApp } from './app';
import { config } from './config/env';
import { logger } from './config/logger';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info('Backend API started', {
    environment: config.nodeEnv,
    port: config.port,
  });
});

const shutdown = (signal: NodeJS.Signals): void => {
  logger.info('Shutting down backend API', { signal });

  server.close(() => {
    logger.info('HTTP server stopped');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
