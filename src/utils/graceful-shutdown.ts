import { Server } from 'http';
import { Logger } from '@/utils';

export class GracefulShutdown {
    private isShuttingDown = false;
    private listenersRegistered = false;

    constructor(private logger: Logger) { }

    public setup(server: Server): void {
        if (this.listenersRegistered) {
            this.logger.debug('Shutdown listeners already registered');
            return;
        }

        // Shutdown signals
        process.on('SIGTERM', () => this.shutdown('SIGTERM', server));
        process.on('SIGINT', () => this.shutdown('SIGINT', server));

        // Error handlers
        process.on('uncaughtException', (error: Error) => {
            this.logger.error('Uncaught Exception', error);
            this.forceExit(1);
        });

        process.on('unhandledRejection', (reason: any) => {
            this.logger.error('Unhandled Rejection', new Error(reason));
            this.forceExit(1);
        });

        this.listenersRegistered = true;
        this.logger.debug('Graceful shutdown configured');
    }

    private async shutdown(signal: string, server: Server): Promise<void> {
        if (this.isShuttingDown) {
            this.logger.warn(`Already shutting down, ignoring ${signal}`);
            return;
        }

        this.isShuttingDown = true;
        this.logger.info(`Received ${signal}, starting graceful shutdown...`);

        // Close server
        server.close((err) => {
            if (err) {
                this.logger.error('Error during server close', err);
                this.forceExit(1);
            } else {
                this.logger.info('Server closed successfully');
                this.forceExit(0);
            }
        });

        // Force exit after timeout
        setTimeout(() => {
            this.logger.warn('Forced shutdown due to timeout');
            this.forceExit(1);
        }, 10000);
    }

    private forceExit(code: number): void {
        process.exit(code);
    }
}