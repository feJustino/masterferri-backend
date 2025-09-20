import pino from 'pino';
import { config } from '@/config';
import { ILogger } from '@/interfaces';

export class Logger implements ILogger {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: config.server.env === 'development' ? 'debug' : 'info',
      transport: config.server.env === 'development' ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname'
        }
      } : undefined,
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(meta, message);
  }

  error(message: string, error?: Error, meta?: any): void {
    this.logger.error({
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
      ...meta,
    }, message);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(meta, message);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(meta, message);
  }
}
