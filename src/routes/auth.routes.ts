import { Router } from 'express';
import { container } from 'tsyringe';
import rateLimit from 'express-rate-limit';
import { AuthController } from '@/http/controllers';
import { validate } from '@/http/middleware';
import { emptySchema } from '@/utils/schemas';
import { config } from '@/config';

const router = Router();

// Rate limiting mais restritivo para autenticação
const authRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: Math.floor(config.rateLimit.max / 2), // Metade do limite padrão
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Resolver controller do container uma única vez
const authController = container.resolve(AuthController);

/**
 * @swagger
 * /api/v1/auth/status:
 *   get:
 *     summary: Check authentication status
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication status
 */
router.get(
  '/status',
  authRateLimit,
  (req, res, next) => authController.getAuthStatus(req, res, next)
);

/**
 * @swagger
 * /api/v1/auth/setup:
 *   get:
 *     summary: Get authorization URL for first-time setup
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authorization URL generated
 */
router.get(
  '/setup',
  authRateLimit,
  (req, res, next) => authController.initiateSetup(req, res, next)
);
/**
 * @swagger
 * /api/v1/auth/callback:
 *   get:
 *     summary: OAuth callback endpoint (used by Bling)
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Bling
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for security
 */
router.get(
  '/callback',
  authRateLimit,
  (req, res, next) => authController.handleCallback(req, res, next)
);

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication endpoints
 */

/**
 * POST /api/v1/auth/refresh
 * Forçar refresh do token de autenticação
 */
router.post(
  '/refresh',
  authRateLimit,
  validate(emptySchema),
  (req, res, next) => authController.refreshToken(req, res, next)
);

/**
 * GET /api/v1/auth/validate
 * Validar token atual
 */
router.get(
  '/validate',
  authRateLimit,
  validate(emptySchema),
  (req, res, next) => authController.validateToken(req, res, next)
);

export default router;
