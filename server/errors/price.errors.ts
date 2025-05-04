import { ApplicationError } from './base.error';

export class PriceNotFoundError extends ApplicationError {
    constructor(priceId?: string) {
        super(priceId ? `Price with ID ${priceId} not found` : 'Price not found');
    }
}

export class PriceFetchError extends ApplicationError {
    constructor(apiError?: string) {
        super(`Failed to fetch Bitcoin price from API${apiError ? `: ${apiError}` : ''}`);
    }
} 