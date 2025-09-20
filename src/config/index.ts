import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  server: {
    port: number;
    env: string;
  };
  bling: {
    clientId: string;
    clientSecret: string;
    apiUrl: string;
    redirectUri: string;
  };
  cache: {
    defaultTtl: number;
    productsTtl: number;
    tokensTtl: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  retry: {
    maxRetries: number;
    delay: number;
    backoff: 'linear' | 'exponential';
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
}

const requiredEnvVars = [
  'BLING_CLIENT_ID',
  'BLING_CLIENT_SECRET',
  'BLING_API_URL'
];

// Validar variáveis de ambiente obrigatórias
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  bling: {
    clientId: process.env.BLING_CLIENT_ID!,
    clientSecret: process.env.BLING_CLIENT_SECRET!,
    apiUrl: process.env.BLING_API_URL || 'https://api.bling.com.br/v3',
    redirectUri: process.env.BLING_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  },
  cache: {
    defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10), // 5 minutos
    productsTtl: parseInt(process.env.CACHE_PRODUCTS_TTL || '600', 10), // 10 minutos
    tokensTtl: parseInt(process.env.CACHE_TOKENS_TTL || '3300', 10), // 55 minutos
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests por janela
  },
  retry: {
    maxRetries: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3', 10),
    delay: parseInt(process.env.RETRY_DELAY || '1000', 10),
    backoff: (process.env.RETRY_BACKOFF as 'linear' | 'exponential') || 'exponential',
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['https://bling.com.br', 'http://localhost:3000', 'https://api.bling.com.br', 'https://orgbling.s3.amazonaws.com'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

export default config;
