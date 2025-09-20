import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '@/config/swagger';
import routes from '@/routes';
import { notFoundHandler, errorHandler } from '@/http/middleware';

export const setupRoutes = (app: express.Application): void => {
    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            message: 'MasterFerri Backend API',
            version: '1.0.0',
            documentation: '/api-docs',
            health: '/api/v1/health',
            timestamp: new Date().toISOString(),
        });
    });

    // API Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: 'MasterFerri API Documentation',
        customfavIcon: '/favicon.ico',
        customCss: '.swagger-ui .topbar { display: none }',
    }));

    // API routes
    app.use('/', routes);

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);
};