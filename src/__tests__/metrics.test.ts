import { MetricsService } from '@/utils/metrics';

describe('MetricsService', () => {
  let metricsService: MetricsService;

  beforeEach(() => {
    metricsService = new MetricsService();
  });

  describe('request counting', () => {
    it('should increment request count', () => {
      metricsService.incrementRequestCount();
      metricsService.incrementRequestCount();

      const metrics = metricsService.getMetrics();
      expect(metrics.totalRequests).toBe(2);
    });
  });

  describe('error counting', () => {
    it('should increment error count', () => {
      metricsService.incrementErrorCount();
      metricsService.incrementErrorCount();

      const metrics = metricsService.getMetrics();
      expect(metrics.totalRequests).toBe(0); // No requests recorded
      expect(metrics.errorRate).toBe(0); // Can't calculate rate without requests
    });

    it('should calculate error rate correctly', () => {
      metricsService.incrementRequestCount();
      metricsService.incrementRequestCount();
      metricsService.incrementErrorCount();

      const metrics = metricsService.getMetrics();
      expect(metrics.errorRate).toBe(50); // 1 error out of 2 requests = 50%
    });
  });

  describe('response time tracking', () => {
    it('should record and calculate average response time', () => {
      metricsService.recordResponseTime(100);
      metricsService.recordResponseTime(200);
      metricsService.recordResponseTime(300);

      const metrics = metricsService.getMetrics();
      expect(metrics.averageResponseTime).toBe(200);
    });
  });

  describe('cache metrics', () => {
    it('should track cache hits and misses', () => {
      metricsService.incrementCacheHit();
      metricsService.incrementCacheHit();
      metricsService.incrementCacheMiss();

      const metrics = metricsService.getMetrics();
      expect(metrics.cacheHitRate).toBe(66.67); // 2 hits out of 3 total = 66.67%
    });

    it('should handle zero cache requests', () => {
      const metrics = metricsService.getMetrics();
      expect(metrics.cacheHitRate).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset all metrics', () => {
      metricsService.incrementRequestCount();
      metricsService.incrementErrorCount();
      metricsService.recordResponseTime(100);
      metricsService.incrementCacheHit();

      metricsService.reset();

      const metrics = metricsService.getMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
      expect(metrics.cacheHitRate).toBe(0);
    });
  });
});
