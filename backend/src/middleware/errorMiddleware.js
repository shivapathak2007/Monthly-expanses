import { env } from '../config/env.js';

export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
    error: 'Endpoint does not exist'
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`❌ [Error ${statusCode}] ${req.method} ${req.originalUrl}:`, err.message);

  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    error: err.error || err.message || 'An unexpected error occurred'
  };

  // Only attach stack trace in non-production development
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
