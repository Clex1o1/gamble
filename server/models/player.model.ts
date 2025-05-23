import { Guess, Player } from "../types";

export class PlayerModel {
    public readonly id?: string;
    public readonly score: number;
    public readonly guess: Guess | null;
    public readonly lastGuessTime: string | null;
    public readonly lastBtcPriceId: string | null;
    public readonly createdAt?: string;
    public readonly updatedAt?: string;

    private constructor(
        score: number,
        guess: Guess | null,
        lastGuessTime: string | null,
        lastBtcPriceId: string | null,
        id?: string,
        createdAt?: string,
        updatedAt?: string,
    ) {
        this.id = id;
        this.score = score;
        this.guess = guess;
        this.lastGuessTime = lastGuessTime;
        this.lastBtcPriceId = lastBtcPriceId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static createPlayer(playerId: string): PlayerModel {
        return new PlayerModel(0, null, null, null, playerId);
    }

    static hydrate(obj: {
        id: string;
        score: number;
        guess: Guess | null;
        last_guess_time: string | null;
        last_price_id: string | null;
        created_at: string;
        updated_at: string;
    }): Required<PlayerModel> {
        return new PlayerModel(
            obj.score,
            obj.guess,
            obj.last_guess_time,
            obj.last_price_id,
            obj.id,
            obj.created_at,
            obj.updated_at
        ) as Required<PlayerModel>;
    }

    makeGuess(guess: Guess, lastBtcPriceId: string): Required<PlayerModel> {
        this.assertPersisted();
        return new PlayerModel(
            this.score,
            guess,
            new Date().toISOString(),
            lastBtcPriceId,
            this.id,
            this.createdAt,
            this.updatedAt,
        ) as Required<PlayerModel>;
    }

    resolveGuess(isCorrect: boolean): Required<PlayerModel> {
        this.assertPersisted();
        return new PlayerModel(
            this.score + (isCorrect ? 1 : -1),
            null,
            null,
            null,
            this.id,
            this.createdAt,
            this.updatedAt,
        ) as Required<PlayerModel>;
    }

    dto(): Player {
        return {
            id: this.id,
            score: this.score,
            guess: this.guess,
            lastGuessTime: this.lastGuessTime,
            lastBtcPriceId: this.lastBtcPriceId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    toEntity() {
        return {
            id: this.id,
            score: this.score,
            guess: this.guess,
            last_guess_time: this.lastGuessTime ? new Date(this.lastGuessTime).toISOString() : null,
            last_price_id: this.lastBtcPriceId,
        };
    }
    assertPersisted(): asserts this is Required<PlayerModel> {
        if (
            this.id === undefined ||
            this.createdAt === undefined ||
            this.updatedAt === undefined
        ) {
            throw new Error('PlayerModel is not fully hydrated from the database!');
        }
    }


    assertHasGuess(): asserts this is this & { guess: Guess, lastGuessTime: string, lastBtcPriceId: string } {
        if (
            this.guess === null ||
            this.lastGuessTime === null ||
            this.lastBtcPriceId === null
        ) {
            throw new Error('PlayerModel does not have an active guess!');
        }
    }
}
