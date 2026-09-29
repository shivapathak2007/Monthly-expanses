import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SpendWise Backend REST API running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🛡️  Environment: ${env.NODE_ENV}`);
  console.log(`🗄️  Database: ${env.isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'Local SQLite'}`);
  console.log(`======================================================\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
