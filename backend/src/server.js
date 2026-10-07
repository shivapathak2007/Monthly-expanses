import app from './app.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`======================================================`);
  logger.info(`🚀 Kharcha Backend REST API running on port ${PORT}`);
  logger.info(`📡 URL: http://localhost:${PORT}`);
  logger.info(`🛡️  Environment: ${env.NODE_ENV}`);
  logger.info(
    `🗄️  Database: ${env.isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'Local SQLite'}`
  );
  logger.info(`======================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
