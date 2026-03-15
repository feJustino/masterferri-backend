import { injectable, inject } from 'tsyringe';
import { IHealthService, ICacheRepository, IAuthService } from '@/interfaces';
import { Logger } from '@/utils';

@injectable()
export class HealthService implements IHealthService {
  private logger = new Logger();
  private startTime = Date.now();

  constructor(
    @inject('AuthService') private authService: IAuthService,
    @inject('ICacheRepository') private cacheRepository: ICacheRepository
  ) { }

  async checkHealth() {
    try {
      this.logger.debug('Performing health check');

      // Verificar conexão com Bling
      const blingStatus = await this.checkBlingConnection();

      // Verificar cache
      const cacheStatus = await this.checkCacheConnection();

      const status: 'healthy' | 'unhealthy' = blingStatus === 'connected' && cacheStatus === 'active'
        ? 'healthy'
        : 'unhealthy';

      const result = {
        status,
        timestamp: new Date().toISOString(),
        services: {
          bling: blingStatus,
          cache: cacheStatus,
        },
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
      };

      this.logger.info('Health check completed', result);
      return result;
    } catch (error) {
      this.logger.error('Health check failed', error as Error);

      return {
        status: 'unhealthy' as const,
        timestamp: new Date().toISOString(),
        services: {
          bling: 'disconnected' as const,
          cache: 'inactive' as const,
        },
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
      };
    }
  }

  private async checkBlingConnection(): Promise<'connected' | 'disconnected'> {
    try {
      const isValid = await this.authService.validateToken();
      return isValid ? 'connected' : 'disconnected';
    } catch (error) {
      this.logger.warn('Bling connection check failed', { error: (error as Error).message });
      return 'disconnected';
    }
  }

  private async checkCacheConnection(): Promise<'active' | 'inactive'> {
    try {
      const testKey = 'health:test';
      const testValue = 'test';

      // Tentar escrever e ler do cache
      await this.cacheRepository.set(testKey, testValue, 10);
      const result = await this.cacheRepository.get(testKey);
      await this.cacheRepository.delete(testKey);

      return result === testValue ? 'active' : 'inactive';
    } catch (error) {
      this.logger.warn('Cache connection check failed', { error: (error as Error).message });
      return 'inactive';
    }
  }

  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  getStartTime(): Date {
    return new Date(this.startTime);
  }
}
