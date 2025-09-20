
export interface IFirebaseConfig {
    projectId: string;
    clientEmail: string;
    privateKey: string;
}

export interface IFirebaseService {
    getFirestore(): FirebaseFirestore.Firestore;
    isInitialized(): boolean;
}