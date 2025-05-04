export class PriceModel {
    public readonly id?: string;
    public readonly price: number;
    public readonly createdAt?: number;
    public readonly updatedAt?: number;

    private constructor(
        price: number,
        id?: string,
        createdAt?: number,
        updatedAt?: number
    ) {
        this.id = id;
        this.price = price;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static createPrice(price: number): PriceModel {
        return new PriceModel(price);
    }

    static hydrate(obj: {
        id: string;
        price: number;
        createdAt: number;
        updatedAt: number;
    }): Required<PriceModel> {
        return new PriceModel(
            obj.price,
            obj.id,
            obj.createdAt,
            obj.updatedAt
        ) as Required<PriceModel>;
    }

    dto(): { id?: string; price: number; createdAt?: number; updatedAt?: number } {
        return {
            id: this.id,
            price: this.price,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    assertPersisted(): asserts this is Required<PriceModel> {
        if (
            this.id === undefined ||
            this.createdAt === undefined ||
            this.updatedAt === undefined
        ) {
            throw new Error('PriceModel is not fully hydrated from the database!');
        }
    }
}
