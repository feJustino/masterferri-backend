import { injectable, inject } from 'tsyringe';
import { IProductService, IBlingApiService, ICacheRepository } from '@/interfaces';
import { BlingProduct, ProductFilters, PaginatedResponse } from '@/types';
import { Logger, generateCacheKey } from '@/utils';

@injectable()
export class ProductService implements IProductService {
  private logger = new Logger();

  constructor(
    @inject('IBlingApiService') private blingApiService: IBlingApiService,
    @inject('ICacheRepository') private cacheRepository: ICacheRepository
  ) { }

  async getAllProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<BlingProduct>> {
    try {
      this.logger.info('Getting all products', { filters });
      return await this.blingApiService.getProducts(filters);
    } catch (error) {
      this.logger.error('Error getting all products', error as Error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<BlingProduct> {
    try {
      this.logger.info('Getting product by ID', { id });
      return await this.blingApiService.getProductById(id);
    } catch (error) {
      this.logger.error('Error getting product by ID', error as Error, { id });
      throw error;
    }
  }

  async searchProducts(query: string, filters: ProductFilters = {}): Promise<PaginatedResponse<BlingProduct>> {
    try {
      this.logger.info('Searching products', { query, filters });

      const searchFilters: ProductFilters = {
        ...filters,
        search: query,
      };

      return await this.blingApiService.getProducts(searchFilters);
    } catch (error) {
      this.logger.error('Error searching products', error as Error, { query });
      throw error;
    }
  }

  async clearCache(): Promise<void> {
    try {
      this.logger.info('Clearing products cache');

      // Limpar cache específico de produtos
      const cacheKeys = [
        'products:*',
        'product:*',
      ];

      // Como não temos um método para limpar por padrão, vamos limpar todo o cache
      // Em uma implementação real, você poderia implementar um método mais específico
      await this.cacheRepository.clear();

      this.logger.info('Products cache cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing cache', error as Error);
      throw error;
    }
  }

  async getProductStats(): Promise<{
    totalCached: number;
    cacheStats: any;
  }> {
    try {
      // Retornar estatísticas básicas do cache de produtos
      // Esta é uma implementação simples, poderia ser expandida
      return {
        totalCached: 0, // Seria implementado com métodos específicos do cache
        cacheStats: {}, // Estatísticas do cache
      };
    } catch (error) {
      this.logger.error('Error getting product stats', error as Error);
      throw error;
    }
  }
}
