import { injectable, inject } from 'tsyringe';
import { ITokenRepository, IFirebaseService } from '@/interfaces';
import { BlingTokens } from '@/types';
import { Logger } from '@/utils';

@injectable()
export class FirebaseTokenRepository implements ITokenRepository {
    private logger = new Logger();
    private readonly COLLECTION = 'bling_tokens';
    private readonly HISTORY_COLLECTION = 'bling_tokens_history';
    private readonly CURRENT_DOC_ID = 'current';

    constructor(
        private firebaseService: IFirebaseService
    ) { 
        if (!this.firebaseService.isInitialized()) {
            this.logger.error('Firebase não inicializado. Verifique a configuração.');
            throw new Error('Firebase não inicializado');
        }
    }

    async saveTokens(tokens: BlingTokens): Promise<void> {
        try {
            const firestore = this.firebaseService.getFirestore();

            // Adicionar metadata
            const tokenData = {
                ...tokens,
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            };

            // Salvar token atual
            await firestore
                .collection(this.COLLECTION)
                .doc(this.CURRENT_DOC_ID)
                .set(tokenData);

            this.logger.info('Tokens salvos no Firebase', {
                expiresAt: new Date(tokens.expires_at).toISOString(),
                collection: this.COLLECTION
            });
        } catch (error) {
            this.logger.error('Erro ao salvar tokens no Firebase', error as Error);
            throw new Error('Falha ao persistir tokens no Firebase');
        }
    }

    async getTokens(): Promise<BlingTokens | null> {
        try {
            const firestore = this.firebaseService.getFirestore();

            const doc = await firestore
                .collection(this.COLLECTION)
                .doc(this.CURRENT_DOC_ID)
                .get();

            if (!doc.exists) {
                this.logger.debug('Nenhum token encontrado no Firebase');
                return null;
            }

            const data = doc.data();
            if (!data) return null;

            this.logger.debug('Tokens recuperados do Firebase');
            return data as BlingTokens;
        } catch (error) {
            this.logger.error('Erro ao buscar tokens no Firebase', error as Error);
            return null;
        }
    }

    async deleteTokens(): Promise<void> {
        try {
            const firestore = this.firebaseService.getFirestore();

            await firestore
                .collection(this.COLLECTION)
                .doc(this.CURRENT_DOC_ID)
                .delete();

            this.logger.info('Tokens removidos do Firebase');
        } catch (error) {
            this.logger.error('Erro ao remover tokens do Firebase', error as Error);
            throw new Error('Falha ao remover tokens do Firebase');
        }
    }

}