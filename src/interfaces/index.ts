export interface ILogger {
  info(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export interface IMetricsService {
  incrementRequestCount(): void;
  incrementErrorCount(): void;
  recordResponseTime(time: number): void;
  incrementCacheHit(): void;
  incrementCacheMiss(): void;
  getMetrics(): {
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
    cacheHitRate: number;
  };
}

export interface IRetryService {
  execute<T>(
    fn: () => Promise<T>,
    options?: {
      maxRetries?: number;
      delay?: number;
      backoff?: 'linear' | 'exponential';
    }
  ): Promise<T>;
}


export type { IAuthService } from './auth.interface'
export type { IHealthService } from './health.interface'
export type { IProductService } from './product.interface'
export type { ICacheRepository } from './cache.interface'
export type { ITokenRepository } from './token.interface'
export type { IBlingApiService } from './blinq.interface'
export type { IFirebaseService, IFirebaseConfig } from './firebase.interface'