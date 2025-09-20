export interface BlingTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  expires_at: number; // timestamp
}

export interface BlingProduct {
  id: number;
  nome: string;
  codigo?: string;
  preco?: number;
  precoPromocional?: number;
  unidade?: string;
  pesoLiquido?: number;
  pesoBruto?: number;
  volumes?: number;
  itensPorCaixa?: number;
  gtin?: string;
  gtinEmbalagem?: string;
  tipoProducao?: string;
  condicao?: number;
  fretefixo?: number;
  marca?: string;
  descricaoCurta?: string;
  descricaoComplementar?: string;
  linkExterno?: string;
  observacoes?: string;
  descricaoEmbalagemDiscreta?: string;
  categoria?: {
    id: number;
    descricao: string;
  };
  estoque?: {
    minimo?: number;
    maximo?: number;
    crossdocking?: number;
    localizacao?: string;
  };
  actionEstoque?: string;
  dimensoes?: {
    largura?: number;
    altura?: number;
    profundidade?: number;
    unidadeMedida?: number;
  };
  tributacao?: any;
  midia?: {
    video?: {
      url?: string;
    };
    imagens?: {
      externas?: Array<{
        link: string;
      }>;
    };
  };
  linhaProduto?: {
    id: number;
    descricao: string;
  };
  estrutura?: {
    tipoEstrutura: string;
    lancamentoEstoque: number;
    componentes?: any[];
  };
  situacao?: string;
  tipo?: string;
  spedTipoItem?: string;
  classeIpi?: string;
}

export interface BlingApiResponse<T> {
  data: T[];
  errors?: Array<{
    error: {
      type: string;
      description: string;
    };
  }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductFilters extends PaginationParams {
  search?: string;
  categoria?: number;
  situacao?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    bling: 'connected' | 'disconnected';
    cache: 'active' | 'inactive';
  };
  uptime: number;
}

export interface MetricsData {
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  cacheHitRate: number;
}
