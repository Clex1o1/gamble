import { SupabaseClient } from "@supabase/supabase-js";
import { PriceModel } from "../models/price.model";
export interface IPriceRepository {
    savePrice(price: number): Promise<Required<PriceModel>>;
    getLastPrice(): Promise<Required<PriceModel>>;
}

export class PriceRepository implements IPriceRepository {
    constructor(private readonly db: SupabaseClient) {
    }
    async savePrice(price: number): Promise<Required<PriceModel>> {
        const { data, error } = await this.db.from('prices').insert({ price }).select().single();
        if (error) {
            throw new Error(error.message);
        }
        const persistedPrice: PriceModel = PriceModel.hydrate(data);
        persistedPrice.assertPersisted();
        return persistedPrice;
    }
    async getLastPrice(): Promise<Required<PriceModel>> {
        const { data, error } = await this.db.from('prices').select('*').order('created_at', { ascending: false }).limit(1).single();
        if (error) {
            throw new Error(error.message);
        }
        const persistedPrice: PriceModel = PriceModel.hydrate(data);
        persistedPrice.assertPersisted();
        return persistedPrice;
    }
    async getPriceById(id: string): Promise<Required<PriceModel>> {
        const { data, error } = await this.db.from('prices').select('*').eq('id', id).single();
        if (error) {
            throw new Error(error.message);
        }
        const persistedPrice: PriceModel = PriceModel.hydrate(data);
        persistedPrice.assertPersisted();
        return persistedPrice;
    }
}