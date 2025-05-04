import { ApplicationError } from './base.error';

export class PlayerNotFoundError extends ApplicationError {
    constructor(playerId: string) {
        super(`Player with ID ${playerId} not found`);
    }
}

export class PlayerAlreadyHasAGuessError extends ApplicationError {
    constructor() {
        super('Player already has an active guess');
    }
}

export class NoActiveGuessError extends ApplicationError {
    constructor() {
        super('Player does not have an active guess');
    }
} 