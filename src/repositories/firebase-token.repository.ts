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
        @inject('FirebaseService')
        private firebaseService: IFirebaseService
    ) { }

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

    async getTokenHistory(limit: number = 10): Promise<BlingTokens[]> {
        try {
            const firestore = this.firebaseService.getFirestore();

            const snapshot = await firestore
                .collection(this.HISTORY_COLLECTION)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => doc.data() as BlingTokens);
        } catch (error) {
            this.logger.error('Erro ao buscar histórico de tokens', error as Error);
            return [];
        }
    }

    private async saveToHistory(tokenData: any): Promise<void> {
        try {
            const firestore = this.firebaseService.getFirestore();

            await firestore
                .collection(this.HISTORY_COLLECTION)
                .add(tokenData);
        } catch (error) {
            this.logger.warn('Erro ao salvar histórico de token', error as Error);
            // Não falha a operação principal
        }
    }

}