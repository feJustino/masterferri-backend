import { Router } from 'express';
import { container } from 'tsyringe';
import rateLimit from 'express-rate-limit';
import { ProductController } from '@/http/controllers';
import { validate } from '@/http/middleware';
import { productSearchSchema, productIdSchema, emptySchema } from '@/utils/schemas';
import { config } from '@/config';

const router = Router();

// Rate limiting específico para produtos
const productRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Resolver controller do container uma única vez
const productController = container.resolve(ProductController);

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * GET /api/v1/products
 * Buscar todos os produtos com filtros opcionais
 */
router.get(
  '/',
  productRateLimit,
  validate(productSearchSchema),
  (req, res, next) => productController.getAllProducts(req, res, next)
);

/**
 * GET /api/v1/products/search
 * Buscar produtos por termo de pesquisa
 */
router.get(
  '/search',
  productRateLimit,
  validate(productSearchSchema),
  (req, res, next) => productController.searchProducts(req, res, next)
);

/**
 * GET /api/v1/products/:id
 * Buscar produto específico por ID
 */
router.get(
  '/:id',
  productRateLimit,
  validate(productIdSchema),
  (req, res, next) => productController.getProductById(req, res, next)
);

/**
 * DELETE /api/v1/products/cache
 * Limpar cache de produtos
 */
router.delete(
  '/cache',
  validate(emptySchema),
  (req, res, next) => productController.clearCache(req, res, next)
);

export default router;
