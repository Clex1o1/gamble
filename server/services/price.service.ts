import { PriceModel } from "../models/price.model";
import { PriceRepository } from "../repositories/price.repository";
import { ApiService } from "./api.service";

export interface IPriceService {
    getBtcPrice(): Promise<Required<PriceModel>>;
}

export class PriceService implements IPriceService {
    constructor(private readonly priceRepository: PriceRepository, private readonly apiService: ApiService) {
    }

    async getBtcPrice(): Promise<Required<PriceModel>> {
        const price = await this.apiService.getBtcPrice();
        let priceModel = await this.priceRepository.getLastPrice();
        if (await this.didPriceChange(price)) {
            priceModel = await this.priceRepository.savePrice(price);
        }
        return priceModel;
    }
    private async didPriceChange(price: number): Promise<boolean> {
        const lastPrice = await this.priceRepository.getLastPrice();
        return lastPrice.price !== price;
    }
    getPriceById(id: string): Promise<Required<PriceModel>> {
        return this.priceRepository.getPriceById(id);
    }

}
