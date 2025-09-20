/* import { ITokenRepository, ICacheRepository } from '@/interfaces';
import { BlingTokens } from '@/types';
import { Logger, generateCacheKey } from '@/utils';
import { config } from '@/config';

export class TokenRepository implements ITokenRepository {
  private logger = new Logger();
  private readonly TOKEN_CACHE_KEY = 'bling:tokens';

  constructor(private cacheRepository: ICacheRepository) {}

  async getTokens(): Promise<BlingTokens | null> {
    try {
      const tokens = await this.cacheRepository.get<BlingTokens>(this.TOKEN_CACHE_KEY);
      
      if (tokens) {
        this.logger.debug('Tokens retrieved from cache');
        return tokens;
      }

      this.logger.debug('No tokens found in cache');
      return null;
    } catch (error) {
      this.logger.error('Error retrieving tokens', error as Error);
      return null;
    }
  }

  async saveTokens(tokens: BlingTokens): Promise<void> {
    try {
      // Salvar com TTL baseado na expiração do token
      const ttl = Math.max(tokens.expires_in - 300, config.cache.tokensTtl); // 5 min buffer
      
      await this.cacheRepository.set(this.TOKEN_CACHE_KEY, tokens, ttl);
      
      this.logger.info('Tokens saved successfully', {
        expiresAt: new Date(tokens.expires_at * 1000).toISOString(),
        ttl,
      });
    } catch (error) {
      this.logger.error('Error saving tokens', error as Error);
      throw error;
    }
  }

  async deleteTokens(): Promise<void> {
    try {
      await this.cacheRepository.delete(this.TOKEN_CACHE_KEY);
      this.logger.info('Tokens deleted successfully');
    } catch (error) {
      this.logger.error('Error deleting tokens', error as Error);
      throw error;
    }
  }

  async hasValidTokens(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      if (!tokens) return false;

      const now = Math.floor(Date.now() / 1000);
      const buffer = 300; // 5 minutos de buffer
      
      return tokens.expires_at > (now + buffer);
    } catch (error) {
      this.logger.error('Error checking token validity', error as Error);
      return false;
    }
  }
}
 */