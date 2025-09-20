import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MasterFerri Backend API',
      version: '1.0.0',
      description: 'Backend Node.js com Express para integração com API do Bling',
      contact: {
        name: 'MasterFerri Team',
        email: 'support@masterferri.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.masterferri.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        BlingProduct: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Product ID',
            },
            nome: {
              type: 'string',
              description: 'Product name',
            },
            codigo: {
              type: 'string',
              description: 'Product code',
            },
            preco: {
              type: 'number',
              format: 'float',
              description: 'Product price',
            },
            precoPromocional: {
              type: 'number',
              format: 'float',
              description: 'Promotional price',
            },
            unidade: {
              type: 'string',
              description: 'Unit of measurement',
            },
            pesoLiquido: {
              type: 'number',
              format: 'float',
              description: 'Net weight',
            },
            pesoBruto: {
              type: 'number',
              format: 'float',
              description: 'Gross weight',
            },
            volumes: {
              type: 'integer',
              description: 'Number of volumes',
            },
            categoria: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                },
                descricao: {
                  type: 'string',
                },
              },
            },
            estoque: {
              type: 'object',
              properties: {
                minimo: {
                  type: 'number',
                },
                maximo: {
                  type: 'number',
                },
                crossdocking: {
                  type: 'number',
                },
                localizacao: {
                  type: 'string',
                },
              },
            },
            situacao: {
              type: 'string',
              description: 'Product status',
            },
            tipo: {
              type: 'string',
              description: 'Product type',
            },
          },
          required: ['id', 'nome'],
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              description: 'Current page number',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Number of items per page',
            },
            total: {
              type: 'integer',
              description: 'Total number of items',
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
            },
          },
          required: ['page', 'limit', 'total', 'totalPages'],
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp',
            },
            path: {
              type: 'string',
              description: 'Request path',
            },
            method: {
              type: 'string',
              description: 'HTTP method',
            },
          },
          required: ['error', 'message', 'timestamp'],
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy'],
              description: 'Overall health status',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Health check timestamp',
            },
            services: {
              type: 'object',
              properties: {
                bling: {
                  type: 'string',
                  enum: ['connected', 'disconnected'],
                  description: 'Bling API connection status',
                },
                cache: {
                  type: 'string',
                  enum: ['active', 'inactive'],
                  description: 'Cache service status',
                },
              },
              required: ['bling', 'cache'],
            },
            uptime: {
              type: 'number',
              description: 'Server uptime in seconds',
            },
          },
          required: ['status', 'timestamp', 'services', 'uptime'],
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Unauthorized: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        TooManyRequests: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Products',
        description: 'Product management endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Authentication',
        description: 'Authentication endpoints',
      },
    ],
  },
  apis: [
    './src/http/controllers/*.ts',
    './src/routes/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
