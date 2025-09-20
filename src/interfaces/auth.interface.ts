import { BlingTokens } from "@/types";

export interface IAuthService {
    getValidToken(): Promise<string>;
    forceRefreshToken(): Promise<BlingTokens>;
    validateToken(): Promise<BlingTokens | null>;

    getAuthenticationStatus(): Promise<{
        authenticated: boolean;
        message: string;
        expiresAt?: string;
        authUrl?: URL;
    }>;
    generateAuthorizationUrl(): Promise<URL>;
    handleAuthorizationCallback(code: string, state: string): Promise<{
        success: boolean;
        expiresAt: string;
        message: string;
        state: string
    }>;
}
