import { Router } from 'express';
import { container } from 'tsyringe';
import { HealthController } from '@/http/controllers';
import { validate } from '@/http/middleware';
import { emptySchema } from '@/utils/schemas';

const router = Router();

// Resolver controller do container uma única vez
const healthController = container.resolve(HealthController);

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check endpoints
 */

/**
 * GET /api/v1/health
 * Health check básico
 */
router.get(
  '/',
  validate(emptySchema),
  (req, res, next) => healthController.checkHealth(req, res, next)
);

/**
 * GET /api/v1/health/detailed
 * Health check detalhado com métricas
 */
router.get(
  '/detailed',
  validate(emptySchema),
  (req, res, next) => healthController.detailedHealth(req, res, next)
);

export default router;
