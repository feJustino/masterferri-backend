import { Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import { config } from '@/config';
import { MetricsService } from '@/utils';

const metrics = new MetricsService();

// Middleware de logging HTTP
export const httpLogger = pinoHttp({
  level: config.server.env === 'development' ? 'debug' : 'info',
  transport: config.server.env === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname,req,res',
    }
  } : undefined,
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

// Middleware de métricas
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  metrics.incrementRequestCount();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    metrics.recordResponseTime(responseTime);

    if (res.statusCode >= 400) {
      metrics.incrementErrorCount();
    }
  });

  next();
};
