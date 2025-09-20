import { IMetricsService } from '@/interfaces';

export class MetricsService implements IMetricsService {
  private metrics = {
    totalRequests: 0,
    totalErrors: 0,
    responseTimes: [] as number[],
    cacheHits: 0,
    cacheMisses: 0,
  };

  incrementRequestCount(): void {
    this.metrics.totalRequests += 1;
  }

  incrementErrorCount(): void {
    this.metrics.totalErrors += 1;
  }

  recordResponseTime(time: number): void {
    this.metrics.responseTimes.push(time);
    
    // Manter apenas os últimos 1000 registros para evitar vazamento de memória
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes = this.metrics.responseTimes.slice(-1000);
    }
  }

  incrementCacheHit(): void {
    this.metrics.cacheHits += 1;
  }

  incrementCacheMiss(): void {
    this.metrics.cacheMisses += 1;
  }

  getMetrics() {
    const totalCacheRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const averageResponseTime = this.metrics.responseTimes.length > 0
      ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length
      : 0;

    return {
      totalRequests: this.metrics.totalRequests,
      errorRate: this.metrics.totalRequests > 0 
        ? (this.metrics.totalErrors / this.metrics.totalRequests) * 100 
        : 0,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      cacheHitRate: totalCacheRequests > 0 
        ? (this.metrics.cacheHits / totalCacheRequests) * 100 
        : 0,
    };
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      totalErrors: 0,
      responseTimes: [],
      cacheHits: 0,
      cacheMisses: 0,
    };
  }
}
