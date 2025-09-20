import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { IProductService } from '@/interfaces';
import { Logger } from '@/utils';
import { ProductFilters } from '@/types';

@injectable()
export class ProductController {
  private logger = new Logger();

  constructor(@inject('IProductService') private productService: IProductService) { }

  /**
   * @swagger
   * /api/v1/products:
   *   get:
   *     summary: Get all products
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Number of items per page
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term
   *       - in: query
   *         name: categoria
   *         schema:
   *           type: integer
   *         description: Category ID
   *       - in: query
   *         name: situacao
   *         schema:
   *           type: string
   *         description: Product status
   *     responses:
   *       200:
   *         description: List of products
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/BlingProduct'
   *                 pagination:
   *                   $ref: '#/components/schemas/Pagination'
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: ProductFilters = {
        page: req.query.page as number | undefined,
        limit: req.query.limit as number | undefined,
        search: req.query.search as string | undefined,
        categoria: req.query.categoria as number | undefined,
        situacao: req.query.situacao as string | undefined,
      };

      this.logger.info('Getting all products', { filters });

      const result = await this.productService.getAllProducts(filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error in getAllProducts controller', error as Error);
      next(error);
    }
  };

  /**
   * @swagger
   * /api/v1/products/{id}:
   *   get:
   *     summary: Get product by ID
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Product ID
   *     responses:
   *       200:
   *         description: Product details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/BlingProduct'
   *                 timestamp:
   *                   type: string
   *       404:
   *         description: Product not found
   *       500:
   *         description: Internal server error
   */
  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as unknown as number;

      this.logger.info('Getting product by ID', { id });

      const product = await this.productService.getProductById(id);

      res.json({
        success: true,
        data: product,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error in getProductById controller', error as Error);
      next(error);
    }
  };

  /**
   * @swagger
   * /api/v1/products/search:
   *   get:
   *     summary: Search products
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: Search query
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Number of items per page
   *       - in: query
   *         name: categoria
   *         schema:
   *           type: integer
   *         description: Category ID
   *       - in: query
   *         name: situacao
   *         schema:
   *           type: string
   *         description: Product status
   *     responses:
   *       200:
   *         description: Search results
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;
      const filters: ProductFilters = {
        page: req.query.page as number | undefined,
        limit: req.query.limit as number | undefined,
        categoria: req.query.categoria as number | undefined,
        situacao: req.query.situacao as string | undefined,
      };

      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      this.logger.info('Searching products', { query, filters });

      const result = await this.productService.searchProducts(query, filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        query,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error in searchProducts controller', error as Error);
      next(error);
    }
  };

  /**
   * @swagger
   * /api/v1/products/cache:
   *   delete:
   *     summary: Clear products cache
   *     tags: [Products]
   *     responses:
   *       200:
   *         description: Cache cleared successfully
   *       500:
   *         description: Internal server error
   */
  clearCache = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.logger.info('Clearing products cache');

      await this.productService.clearCache();

      res.json({
        success: true,
        message: 'Products cache cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('Error in clearCache controller', error as Error);
      next(error);
    }
  };
}
