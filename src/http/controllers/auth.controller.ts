import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAuthService } from '@/interfaces';
import { Logger } from '@/utils';

@injectable()
export class AuthController {
  private logger = new Logger();

  constructor(@inject('AuthService') private authService: IAuthService) { }



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
  getAuthStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await this.authService.getAuthenticationStatus();

      res.json({
        success: true,
        authenticated: status.authenticated,
        message: status.message,
        expiresAt: status.expiresAt,
        needsSetup: !status.authenticated,
        authUrl: !status.authenticated ? status.authUrl : undefined,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error checking auth status', error as Error);
      next(error);
    }
  };


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
  initiateSetup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUrl = await this.authService.generateAuthorizationUrl();

      res.json({
        success: true,
        authUrl,
        message: 'Acesse a URL para autorizar a aplicação no Bling',
        instructions: [
          '1. Clique na URL de autorização abaixo',
          '2. Faça login na sua conta do Bling',
          '3. Autorize a aplicação',
          '4. Você será redirecionado automaticamente',
          '5. A partir daí, a autenticação será automática'
        ],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error generating auth URL', error as Error);
      next(error);
    }
  };

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
  handleCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, state, error } = req.query;
      const formatedError = new Error(error?.toString())
      if (error) {
        this.logger.error('OAuth callback error', formatedError);
        res.status(400).send();
        return;
      }

      if (!code) {
        res.status(400).send();
        return;
      }

      // Processar o callback e obter tokens
      const result = await this.authService.handleAuthorizationCallback(
        code as string,
        state as string
      );

      this.logger.info('Authentication setup completed successfully');

      // Página de sucesso
      res.send();
    } catch (error) {
      this.logger.error('Error in auth callback', error as Error);
      res.status(500).send();
    }
  };


  /**
   * @swagger
   * /api/v1/auth/refresh:
   *   post:
   *     summary: Force refresh authentication token
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 timestamp:
   *                   type: string
   *       401:
   *         description: Unauthorized - invalid refresh token
   *       500:
   *         description: Internal server error
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.logger.info('Force refresh token requested');

      await this.authService.forceRefreshToken();

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error in refreshToken controller', error as Error);

      // Se o erro for de autenticação, retornar 401
      if ((error as any)?.status === 401 || (error as Error).message.includes('refresh token')) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired refresh token',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      next(error);
    }
  };

  /**
   * @swagger
   * /api/v1/auth/validate:
   *   get:
   *     summary: Validate current authentication token
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Token is valid
   *       401:
   *         description: Token is invalid or expired
   */
  validateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.logger.debug('Token validation requested');

      const isValid = await this.authService.validateToken();

      if (isValid) {
        res.json({
          success: true,
          valid: true,
          message: 'Token is valid',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(401).json({
          success: false,
          valid: false,
          message: 'Token is invalid or expired',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error('Error in validateToken controller', error as Error);
      next(error);
    }
  };
}
