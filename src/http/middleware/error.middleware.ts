import { Request, Response, NextFunction } from 'express';
import { Logger, sanitizeError } from '@/utils';

const logger = new Logger();

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log do erro
  logger.error('Unhandled error', error, {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Sanitizar erro para resposta
  const sanitized = sanitizeError(error);

  // Resposta de erro
  res.status(sanitized.status).json({
    error: 'Internal Server Error',
    message: sanitized.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error,
    }),
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  });
};
