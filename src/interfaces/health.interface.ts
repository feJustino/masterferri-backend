export interface IHealthService {
    checkHealth(): Promise<{
        status: 'healthy' | 'unhealthy';
        timestamp: string;
        services: {
            bling: 'connected' | 'disconnected';
            cache: 'active' | 'inactive';
        };
        uptime: number;
    }>;
}