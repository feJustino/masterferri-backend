import NodeCache from 'node-cache';
import { ICacheRepository } from '@/interfaces';
import { config } from '@/config';
import { Logger, MetricsService } from '@/utils';
import { injectable } from 'tsyringe';

@injectable()
export class CacheRepository implements ICacheRepository {
  private cache: NodeCache;
  private logger = new Logger();
  private metrics = new MetricsService();

  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.defaultTtl,
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false,
    });

    this.cache.on('set', (key, value) => {
      this.logger.debug(`Cache set: ${key}`);
    });

    this.cache.on('expired', (key, value) => {
      this.logger.debug(`Cache expired: ${key}`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = this.cache.get<T>(key);
      if (value !== undefined) {
        this.metrics.incrementCacheHit();
        this.logger.debug(`Cache hit: ${key}`);
        return value;
      }

      this.metrics.incrementCacheMiss();
      this.logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}`, error as Error);
      this.metrics.incrementCacheMiss();
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const success = this.cache.set(key, value, ttl || config.cache.defaultTtl);
      if (success) {
        this.logger.debug(`Cache set: ${key}`, { ttl: ttl || config.cache.defaultTtl });
      } else {
        this.logger.warn(`Failed to set cache key: ${key}`);
      }
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}`, error as Error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const deleted = this.cache.del(key);
      this.logger.debug(`Cache delete: ${key}`, { deleted });
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}`, error as Error);
    }
  }

  async clear(): Promise<void> {
    try {
      this.cache.flushAll();
      this.logger.info('Cache cleared');
    } catch (error) {
      this.logger.error('Cache clear error', error as Error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return this.cache.has(key);
    } catch (error) {
      this.logger.error(`Cache exists check error for key ${key}`, error as Error);
      return false;
    }
  }

  getStats() {
    return {
      keys: this.cache.keys().length,
      stats: this.cache.getStats(),
      metrics: this.metrics.getMetrics(),
    };
  }
}
