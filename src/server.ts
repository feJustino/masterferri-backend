import 'reflect-metadata';
import './config/container';

import express from 'express';
import { config } from '@/config';
import { Logger } from '@/utils';
import { setupMiddlewares } from '@/config/middlewares';
import { setupRoutes } from '@/config/routes';
import { GracefulShutdown } from '@/utils/graceful-shutdown';

const logger = new Logger();

class Server {
  private app: express.Application;
  private port: number;
  private gracefulShutdown: GracefulShutdown;

  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.gracefulShutdown = new GracefulShutdown(logger);

    this.initialize();
  }

  private initialize(): void {
    setupMiddlewares(this.app);
    setupRoutes(this.app);
  }

  public async start(): Promise<void> {
    try {
      this.validateEnvironment();

      const server = this.app.listen(this.port, () => {
        logger.info(`🚀 Server running on port ${this.port}`, {
          port: this.port,
          environment: config.server.env,
          docs: `http://localhost:${this.port}/api-docs`,
          health: `http://localhost:${this.port}/api/v1/health`,
        });
      });

      // Configurar shutdown graceful
      this.gracefulShutdown.setup(server);

    } catch (error) {
      logger.error('Failed to start server', error as Error);
      process.exit(1);
    }
  }

  private validateEnvironment(): void {
    const requiredVars = ['BLING_CLIENT_ID', 'BLING_CLIENT_SECRET', 'BLING_API_URL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    logger.info('Environment validated successfully');
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Start server
if (process.env.NODE_ENV !== 'test') {
  const server = new Server();
  server.start().catch(console.error);
}

export default Server;