import { BlingTokens } from "@/types";

export interface ITokenRepository {
    getTokens(): Promise<BlingTokens | null>;
    saveTokens(tokens: BlingTokens): Promise<void>;
    deleteTokens(): Promise<void>;
}