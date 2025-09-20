// Setup global para testes
import 'reflect-metadata';

// Mock do process.env para testes
process.env.NODE_ENV = 'test';
process.env.BLING_CLIENT_ID = 'test_client_id';
process.env.BLING_CLIENT_SECRET = 'test_client_secret';
process.env.BLING_API_URL = 'https://api.bling.com.br/v3';
process.env.PORT = '3001';

// Mock de console para evitar logs desnecessários nos testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
