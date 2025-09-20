import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from '@/config';
import { httpLogger, metricsMiddleware } from '@/http/middleware';
import { corsMiddleware } from '@/http/middleware/cors';

export const setupMiddlewares = (app: express.Application): void => {
    // Security
    app.use(helmet());
    app.use(corsMiddleware);

    // Performance
    app.use(compression());

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    app.use(rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
        message: {
            error: 'Too Many Requests',
            message: 'Too many requests from this IP, please try again later.',
        },
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => req.path.includes('/health'),
    }));

    // Observability
    app.use(httpLogger);
    app.use(metricsMiddleware);

    // Trust proxy
    app.set('trust proxy', 1);
};