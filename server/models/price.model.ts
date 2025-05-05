export class PriceModel {
    public readonly id?: string;
    public readonly price: number;
    public readonly createdAt?: string;
    public readonly updatedAt?: string;

    private constructor(
        price: number,
        id?: string,
        createdAt?: string,
        updatedAt?: string
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
        created_at: string;
        updated_at: string;
    }): Required<PriceModel> {
        return new PriceModel(
            obj.price,
            obj.id,
            obj.created_at,
            obj.updated_at
        ) as Required<PriceModel>;
    }

    dto(): { id?: string; price: number; createdAt?: string; updatedAt?: string } {
        return {
            id: this.id,
            price: this.price,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toEntity() {
        return {
            id: this.id,
            price: this.price,
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
