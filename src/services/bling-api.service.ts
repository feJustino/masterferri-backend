import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { injectable, inject } from 'tsyringe';
import { IBlingApiService, IAuthService, ICacheRepository } from '@/interfaces';
import { BlingProduct, BlingApiResponse, ProductFilters, PaginatedResponse } from '@/types';
import { config } from '@/config';
import { Logger, RetryService, generateCacheKey, sanitizeError } from '@/utils';

@injectable()
export class BlingApiService implements IBlingApiService {
  private logger = new Logger();
  private retryService = new RetryService();
  private httpClient: AxiosInstance;

  constructor(
    @inject('IAuthService') private authService: IAuthService,
    @inject('ICacheRepository') private cacheRepository: ICacheRepository
  ) {
    this.httpClient = axios.create({
      baseURL: config.bling.apiUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor para adicionar token automaticamente
    this.httpClient.interceptors.request.use(
      async (config) => {
        try {
          const token = await this.authService.getValidToken();
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        } catch (error) {
          this.logger.error('Failed to get valid token for request', error as Error);
          throw error;
        }
      },
      (error) => {
        this.logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

  }

  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<BlingProduct>> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        categoria,
        situacao
      } = filters;

      // Gerar chave de cache
      const cacheKey = generateCacheKey('products', page.toString(), limit.toString(), search || '', categoria?.toString() || '', situacao || '');

      // Verificar cache primeiro
      const cachedResult = await this.cacheRepository.get<PaginatedResponse<BlingProduct>>(cacheKey);
      if (cachedResult) {
        this.logger.debug('Products retrieved from cache', { cacheKey });
        return cachedResult;
      }

      // Construir parâmetros da query
      const params: any = {
        pagina: page,
        limite: Math.min(limit, 100), // Bling tem limite máximo
      };

      if (search) params.criterio = search;
      if (categoria) params.idCategoria = categoria;
      if (situacao) params.situacao = situacao;

      this.logger.info('Fetching products from Bling API', { params });

      const response = await this.retryService.execute(
        () => this.httpClient.get<BlingApiResponse<BlingProduct>>('/produtos', {
          params
        }),
        {
          maxRetries: 3,
          delay: 1000,
          backoff: 'exponential',
        }
      );

      if (response.data.errors && response.data.errors.length > 0) {
        const error = response.data.errors[0]?.error;
        throw new Error(`Bling API Error: ${error?.description || 'Unknown error'}`);
      }

      const products = response.data.data || [];

      // Simular paginação (Bling pode não retornar info de paginação)
      const result: PaginatedResponse<BlingProduct> = {
        data: products,
        pagination: {
          page,
          limit,
          total: products.length, // Aproximação
          totalPages: Math.ceil(products.length / limit),
        },
      };

      // Cache do resultado
      await this.cacheRepository.set(cacheKey, result, config.cache.productsTtl);

      this.logger.info('Products fetched successfully', {
        count: products.length,
        page,
        limit,
      });

      return result;
    } catch (error) {
      this.logger.error('Error fetching products', error as Error);
      throw sanitizeError(error);
    }
  }

  async getProductById(id: number): Promise<BlingProduct> {
    try {
      const cacheKey = generateCacheKey('product', id.toString());

      // Verificar cache primeiro
      const cachedProduct = await this.cacheRepository.get<BlingProduct>(cacheKey);
      if (cachedProduct) {
        this.logger.debug('Product retrieved from cache', { id, cacheKey });
        return cachedProduct;
      }

      this.logger.info('Fetching product from Bling API', { id });

      const response = await this.retryService.execute(
        () => this.httpClient.get<BlingApiResponse<BlingProduct>>(`/produtos/${id}`),
        {
          maxRetries: 3,
          delay: 1000,
          backoff: 'exponential',
        }
      );

      if (response.data.errors && response.data.errors.length > 0) {
        const error = response.data.errors[0]?.error;
        throw new Error(`Bling API Error: ${error?.description || 'Unknown error'}`);
      }

      const product = response.data.data[0];

      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }

      // Cache do produto
      await this.cacheRepository.set(cacheKey, product, config.cache.productsTtl);

      this.logger.info('Product fetched successfully', { id });

      return product;
    } catch (error) {
      this.logger.error('Error fetching product by ID', error as Error, { id });
      throw sanitizeError(error);
    }
  }

  async refreshToken(): Promise<import('@/types').BlingTokens> {
    return await this.authService.forceRefreshToken();
  }

  async validateToken(): Promise<boolean> {
    const tokens = await this.authService.validateToken();
    return Boolean(tokens);
  }
}
