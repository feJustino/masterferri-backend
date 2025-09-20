import { z } from 'zod';

// Schema para paginação
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
}).refine(data => data.page >= 1, {
  message: "Page must be greater than 0",
  path: ["page"]
}).refine(data => data.limit >= 1 && data.limit <= 100, {
  message: "Limit must be between 1 and 100",
  path: ["limit"]
});

// Schema para busca de produtos
export const productSearchSchema = z.object({
  search: z.string().optional(),
  categoria: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  situacao: z.string().optional(),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
}).refine(data => (data.page || 1) >= 1, {
  message: "Page must be greater than 0",
  path: ["page"]
}).refine(data => {
  const limit = data.limit || 20;
  return limit >= 1 && limit <= 100;
}, {
  message: "Limit must be between 1 and 100",
  path: ["limit"]
});

// Schema para ID de produto
export const productIdSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val) && val > 0, {
    message: "ID must be a positive number"
  }),
});

// Schema para health check
export const healthSchema = z.object({}).optional();

// Schema vazio para endpoints sem parâmetros
export const emptySchema = z.object({});
