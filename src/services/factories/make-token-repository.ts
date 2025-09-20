import { injectable, inject } from 'tsyringe';
import { ITokenRepository, IFirebaseService } from '@/interfaces';
import { FirebaseTokenRepository } from '@/repositories/firebase-token.repository';
import { CacheRepository } from '@/repositories/cache.repository';
import { Logger } from '@/utils';

@injectable()
export class MakeTokenRepository {
    private logger = new Logger();

    constructor(
        @inject('FirebaseService')
        private firebaseService: IFirebaseService
    ) { }

    createRepository(): ITokenRepository {
        const useFirebase = process.env.USE_FIREBASE_TOKENS === 'true';

        if (useFirebase && this.firebaseService.isInitialized()) {
            this.logger.info('Usando Firebase para persistência de tokens');
            return new FirebaseTokenRepository(this.firebaseService);
        } else {
            this.logger.info('Usando cache em memória para tokens');
            return new CacheRepository() as any; // Assumindo que implementa ITokenRepository
        }
    }
}