import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { IHealthService } from '@/interfaces';
import { Logger } from '@/utils';

@injectable()
export class HealthController {
  private logger = new Logger();

  constructor(
    @inject('HealthService') private healthService: IHealthService,
  ) { }

  /**
   * @swagger
   * /api/v1/health:
   *   get:
   *     summary: Health check endpoint
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Service is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [healthy, unhealthy]
   *                 timestamp:
   *                   type: string
   *                 services:
   *                   type: object
   *                   properties:
   *                     bling:
   *                       type: string
   *                       enum: [connected, disconnected]
   *                     cache:
   *                       type: string
   *                       enum: [active, inactive]
   *                 uptime:
   *                   type: number
   *       503:
   *         description: Service is unhealthy
   */
  checkHealth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.logger.debug('Health check requested');

      const health = await this.healthService.checkHealth();

      const statusCode = health.status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        ...health,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      });
    } catch (error) {
      this.logger.error('Error in health check', error as Error);

      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          bling: 'disconnected',
          cache: 'inactive',
        },
        uptime: 0,
        error: 'Health check failed',
      });
    }
  };

  /**
   * @swagger
   * /api/v1/health/detailed:
   *   get:
   *     summary: Detailed health check with metrics
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Detailed health information
   */
  detailedHealth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.logger.debug('Detailed health check requested');

      const health = await this.healthService.checkHealth();

      // Informações adicionais do sistema
      const memoryUsage = process.memoryUsage();

      res.json({
        ...health,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB',
        },
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      });
    } catch (error) {
      this.logger.error('Error in detailed health check', error as Error);
      next(error);
    }
  };
}
