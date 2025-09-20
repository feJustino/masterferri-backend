import 'reflect-metadata';
import { container } from 'tsyringe';

// Imports das implementações
import { ICacheRepository, ITokenRepository, IAuthService, IBlingApiService, IProductService, IHealthService, IFirebaseService } from '@/interfaces';
import { CacheRepository } from '@/repositories/cache.repository';
import { AuthService, BlingApiService, ProductService, HealthService } from '@/services';
import { ProductController, HealthController, AuthController } from '@/http/controllers';
import { MakeTokenRepository } from '@/services/factories/make-token-repository';
import { FirebaseService } from '@/lib/firebase';

// === REPOSITORIES ===
// Cache Repository
container.registerSingleton<ICacheRepository>('ICacheRepository', CacheRepository);

// Firebase Service
container.registerSingleton<IFirebaseService>('FirebaseService', FirebaseService);

// Token Repository (usando factory)
container.registerSingleton(MakeTokenRepository);
container.register<ITokenRepository>('ITokenRepository', {
  useFactory: (container) => {
    const factory = container.resolve(MakeTokenRepository);
    return factory.createRepository();
  }
});

// === SERVICES ===
// Services são automaticamente resolvidos pelos decorators @inject
container.registerSingleton<IAuthService>('IAuthService', AuthService);
container.registerSingleton<IBlingApiService>('IBlingApiService', BlingApiService);
container.registerSingleton<IProductService>('IProductService', ProductService);
container.registerSingleton<IHealthService>('IHealthService', HealthService);

// === CONTROLLERS ===
// Controllers também são automaticamente resolvidos
container.registerSingleton(ProductController);
container.registerSingleton(HealthController);
container.registerSingleton(AuthController);

export { container };
