import { injectable, inject } from 'tsyringe';
import { IAuthService, ITokenRepository } from '@/interfaces';
import { BlingTokens } from '@/types';
import { Logger, isTokenExpired, sanitizeError } from '@/utils';
import axios, { AxiosInstance } from 'axios';
import crypto from 'node:crypto';
import config from '@/config';

@injectable()
export class AuthService implements IAuthService {
    private logger = new Logger();
    private httpClient: AxiosInstance;
    private readonly blingBaseUrl = config.bling.apiUrl || 'https://api.bling.com.br/Api/v3';
    private readonly clientId = config.bling.clientId!;
    private readonly clientSecret = config.bling.clientSecret!;
    private readonly redirectUri = config.bling.redirectUri || 'http://localhost:3000/api/v1/auth/callback';
    private readonly basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    constructor(@inject('TokenRepository') private tokenRepository: ITokenRepository) {
        this.httpClient = axios.create({
            baseURL: this.blingBaseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async validateToken(): Promise<BlingTokens | null> {
        let tokens = await this.tokenRepository.getTokens();

        if (!tokens) {
            return null;
        }

        if (isTokenExpired(tokens.expires_at)) {
            this.logger.debug('Token expirado durante validação');
            tokens = await this.forceRefreshToken();
        }

        const isAccessTokenValid = await this.testTokens(tokens.access_token);
        if (!isAccessTokenValid) {
            this.logger.debug('Token de acesso inválido durante validação, tentando renovar');
            tokens = await this.forceRefreshToken();
        }

        return tokens;

    }

    async getAuthenticationStatus() {
        const tokens = await this.validateToken();

        if (!tokens) {
            return {
                authenticated: false,
                message: 'Nenhum token encontrado. Setup inicial necessário.',
                authUrl: await this.generateAuthorizationUrl()
            };
        }

        try {
            return {
                authenticated: true,
                expiresAt: new Date(tokens.expires_at).toISOString(),
                message: 'Autenticado',
            };
        } catch (error) {
            this.logger.error('Falha ao renovar token', error as Error);
            return {
                authenticated: false,
                message: 'Token expirado e não foi possível renovar. Setup necessário.',
                authUrl: await this.generateAuthorizationUrl()
            };
        }


    }

    async generateAuthorizationUrl(): Promise<URL> {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            state: crypto.randomBytes(16).toString('hex'),
            redirect_uri: new URL(this.redirectUri).toString(),
        });

        const authUrl = new URL(`https://bling.com.br/Api/v3/oauth/authorize?${params.toString()}`);

        this.logger.info('URL de autorização gerada', {
            redirectUri: this.redirectUri,
        });

        return authUrl;
    }

    async handleAuthorizationCallback(code: string, state: string): Promise<{
        success: boolean;
        expiresAt: string;
        message: string;
        state: string
    }> {
        try {
            this.logger.info('Processando callback de autorização', {
                code: code.substring(0, 10) + '...',
            });

            const body = new URLSearchParams({
                grant_type: 'authorization_code',
                code,
            }).toString();

            const tokenResponse = await axios.post(
                `${this.blingBaseUrl}/oauth/token`,
                body,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': '1.0',
                        'Authorization': `Basic ${this.basicAuth}`,
                    },
                    timeout: 30000
                }
            );

            const tokens: BlingTokens = {
                access_token: tokenResponse.data.access_token,
                refresh_token: tokenResponse.data.refresh_token,
                expires_in: tokenResponse.data.expires_in,
                token_type: tokenResponse.data.token_type,
                scope: tokenResponse.data.scope,
                expires_at: Date.now() + (tokenResponse.data.expires_in * 1000)
            };

            await this.tokenRepository.saveTokens(tokens);
            this.logger.info('Tokens salvos com sucesso', {
                expiresAt: new Date(tokens.expires_at).toISOString(),
                scope: tokens.scope
            });

            // Testar se os tokens funcionam
            await this.testTokens(tokens.access_token);

            return {
                success: true,
                expiresAt: new Date(tokens.expires_at).toISOString(),
                message: 'Autenticação configurada com sucesso',
                state: ''
            };
        } catch (error) {
            this.logger.error('Erro no callback de autorização', error as Error);
            throw new Error(`Falha na autenticação: ${(error as Error).message}`);
        }
    }


    async getValidToken(): Promise<string> {
        try {
            const tokens = await this.validateToken();

            if (!tokens) {
                throw new Error('No tokens found. Please authenticate first.');
            }

            return tokens.access_token;

        } catch (error) {
            this.logger.error('Error getting valid token', error as Error);
            throw error;
        }
    }

    async forceRefreshToken(): Promise<BlingTokens> {
        const tokens = await this.tokenRepository.getTokens();
        if (!tokens?.refresh_token) {
            throw new Error('No refresh token available');
        }
        this.logger.info('Forcing token refresh');

        const refreshTokens = await this.performTokenRefresh(tokens.refresh_token)
        await this.tokenRepository.saveTokens(refreshTokens);
        this.logger.info('Token refreshed successfully');
        return refreshTokens;
    }

    private async testTokens(accessToken: string): Promise<boolean> {
        try {
            await axios.get(`${this.blingBaseUrl}/produtos`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                params: { limite: 1 }, // Apenas 1 item para teste
                timeout: 10000
            });

            this.logger.debug('Teste de token bem-sucedido');
            return true;
        } catch (error) {
            this.logger.error('Falha no teste de token', error as Error);
            return false;
        }
    }

    private async performTokenRefresh(refreshToken: string): Promise<BlingTokens> {
        const tokenResponse = await this.httpClient.post('/oauth/token', {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }, {
            headers: {
                'Authorization': `Basic ${this.basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const tokens: BlingTokens = {
            access_token: tokenResponse.data.access_token,
            refresh_token: tokenResponse.data.refresh_token,
            expires_in: tokenResponse.data.expires_in,
            token_type: tokenResponse.data.token_type,
            scope: tokenResponse.data.scope,
            expires_at: Date.now() + (tokenResponse.data.expires_in * 1000)
        };
        return tokens;
    }
}
