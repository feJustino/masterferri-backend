import 'reflect-metadata';
import { container } from 'tsyringe';

// Imports das implementações
import { ICacheRepository, ITokenRepository, IAuthService, IHealthService, IFirebaseService } from '@/interfaces';
import { CacheRepository } from '@/repositories/cache.repository';
import { AuthService,  HealthService } from '@/services';
import { HealthController, AuthController } from '@/http/controllers';
import { MakeTokenRepository } from '@/services/factories/make-token-repository';
import { FirebaseService } from '@/lib/firebase';

// === REPOSITORIES ===
// Cache Repository
container.registerSingleton<ICacheRepository>('ICacheRepository', CacheRepository);

// Firebase Service
container.registerSingleton<IFirebaseService>('FirebaseService', FirebaseService);

// Token Repository (usando factory)
container.registerSingleton(MakeTokenRepository);
container.register<ITokenRepository>('TokenRepository', {
  useFactory: (container) => {
    const factory = container.resolve(MakeTokenRepository);
    return factory.createRepository();
  }
});

// === SERVICES ===
// Services são automaticamente resolvidos pelos decorators @inject
container.registerSingleton<IAuthService>('AuthService', AuthService);
container.registerSingleton<IHealthService>('HealthService', HealthService);

// === CONTROLLERS ===
// Controllers também são automaticamente resolvidos
container.registerSingleton(HealthController);
container.registerSingleton(AuthController);

export { container };
