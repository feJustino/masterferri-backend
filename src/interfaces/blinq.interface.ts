import { BlingProduct, BlingTokens, PaginatedResponse, ProductFilters } from "@/types";

export interface IBlingApiService {
    getProducts(filters?: ProductFilters): Promise<PaginatedResponse<BlingProduct>>;
    getProductById(id: number): Promise<BlingProduct>;
    refreshToken(): Promise<BlingTokens>;
    validateToken(): Promise<boolean>;
}