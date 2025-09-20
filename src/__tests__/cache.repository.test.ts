import { CacheRepository } from '@/repositories/cache.repository';

describe('CacheRepository', () => {
  let cacheRepository: CacheRepository;

  beforeEach(() => {
    cacheRepository = new CacheRepository();
  });

  afterEach(async () => {
    await cacheRepository.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve a value', async () => {
      const key = 'test:key';
      const value = { test: 'data' };

      await cacheRepository.set(key, value);
      const result = await cacheRepository.get(key);

      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      const result = await cacheRepository.get('non:existent');
      expect(result).toBeNull();
    });

    it('should respect TTL', async (done) => {
      const key = 'test:ttl';
      const value = 'ttl-test';
      const ttl = 1; // 1 second

      await cacheRepository.set(key, value, ttl);
      
      setTimeout(async () => {
        const result = await cacheRepository.get(key);
        expect(result).toBeNull();
        done();
      }, 1100);
    });
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      const key = 'test:delete';
      const value = 'delete-test';

      await cacheRepository.set(key, value);
      await cacheRepository.delete(key);
      
      const result = await cacheRepository.get(key);
      expect(result).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return true for existing key', async () => {
      const key = 'test:exists';
      const value = 'exists-test';

      await cacheRepository.set(key, value);
      const exists = await cacheRepository.exists(key);

      expect(exists).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      const exists = await cacheRepository.exists('non:existent');
      expect(exists).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all keys', async () => {
      await cacheRepository.set('key1', 'value1');
      await cacheRepository.set('key2', 'value2');
      
      await cacheRepository.clear();
      
      const result1 = await cacheRepository.get('key1');
      const result2 = await cacheRepository.get('key2');
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });
});
