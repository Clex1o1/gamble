import { ApplicationError } from './base.error';

export class GuessTimeNotUpError extends ApplicationError {
    constructor() {
        super('Guess time is not up yet');
    }
}

export class InvalidGuessTypeError extends ApplicationError {
    constructor(guess: string) {
        super(`Invalid guess type: ${guess}. Must be 'up' or 'down'`);
    }
}

export class PriceDidNotChangeError extends ApplicationError {
    constructor() {
        super('Price did not change');
    }
}