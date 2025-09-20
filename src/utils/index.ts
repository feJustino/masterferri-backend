export * from './logger';
export * from './retry';
export * from './metrics';

export const generateCacheKey = (prefix: string, ...parts: (string | number)[]): string => {
  return `${prefix}:${parts.join(':')}`;
};

export const isTokenExpired = (expiresAt: number): boolean => {
  const now = Math.floor(Date.now() / 1000);
  const buffer = 300; // 5 minutos de buffer
  return expiresAt <= (now + buffer);
};

export const parseIntSafe = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const sanitizeError = (error: any): { message: string; status: number; code?: string } => {
  if (error?.response?.data) {
    return {
      message: error.response.data.message || error.response.data.error || 'API Error',
      status: error.response.status || 500,
      code: error.response.data.code,
    };
  }

  if (error?.message) {
    return {
      message: error.message,
      status: error.status || 500,
      code: error.code,
    };
  }

  return {
    message: 'Internal Server Error',
    status: 500,
  };
};
