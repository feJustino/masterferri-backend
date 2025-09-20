import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { IFirebaseService, IFirebaseConfig } from '@/interfaces';
import { Logger } from '@/utils';
import { injectable } from 'tsyringe';

@injectable()
export class FirebaseService implements IFirebaseService {
    private logger = new Logger();
    private app: App | undefined = undefined;
    private firestoreInstance: Firestore | undefined = undefined;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        try {
            if (getApps().length > 0) {
                this.app = getApps()[0];
            } else {
                const decodeKey = Buffer.from(
                    process.env.FIREBASE_PRIVATE_KEY!,
                    'base64'
                ).toString('utf-8');

                const firebaseCert = cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: decodeKey,
                });

                this.app = initializeApp({
                    credential: firebaseCert,
                });
            }

            if (!this.app) {
                throw new Error('Firebase app não foi inicializado');
            }

            this.firestoreInstance = getFirestore(this.app);
            this.logger.info('Firebase inicializado com sucesso', {
                projectId: process.env.FIREBASE_PROJECT_ID
            });
        } catch (error) {
            this.logger.error('Erro ao inicializar Firebase', error as Error);
            throw new Error('Falha na inicialização do Firebase');
        }
    }

    private validateConfig(config: IFirebaseConfig): void {
        if (!config.projectId || !config.clientEmail || !config.privateKey) {
            throw new Error('Configurações do Firebase incompletas');
        }
    }

    getFirestore(): Firestore {
        if (!this.firestoreInstance) {
            throw new Error('Firebase Firestore não foi inicializado');
        }
        return this.firestoreInstance;
    }

    isInitialized(): boolean {
        return !!this.firestoreInstance;
    }
}