import { BlingProduct, PaginatedResponse, ProductFilters } from "@/types";

export interface IProductService {
    getAllProducts(filters?: ProductFilters): Promise<PaginatedResponse<BlingProduct>>;
    getProductById(id: number): Promise<BlingProduct>;
    searchProducts(query: string, filters?: ProductFilters): Promise<PaginatedResponse<BlingProduct>>;
    clearCache(): Promise<void>;
}