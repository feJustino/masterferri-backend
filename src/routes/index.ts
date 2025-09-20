import { Router } from 'express';
import productsRoutes from './products.routes';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';

const router = Router();

// Versioning da API
const API_VERSION = '/api/v1';

// Registrar rotas
router.use(`${API_VERSION}/products`, productsRoutes);
router.use(`${API_VERSION}/health`, healthRoutes);
router.use(`${API_VERSION}/auth`, authRoutes);

// Rota raiz da API
router.get(API_VERSION, (req, res) => {
  res.json({
    message: 'MasterFerri Backend API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      products: `${API_VERSION}/products`,
      health: `${API_VERSION}/health`,
      auth: `${API_VERSION}/auth`,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
