import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS configuration (allow Vercel, localhost, and custom domains with credentials)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// Request logging in development
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Kharcha API is healthy and operational',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    storage: env.isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'Local SQLite'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/suggestions', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/account', userRoutes);
app.use('/api/data/export', exportRoutes);
app.use('/api/export', exportRoutes);

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

export default app;
