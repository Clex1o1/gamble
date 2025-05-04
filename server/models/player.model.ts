import { Guess, Player } from "../types";

export class PlayerModel {
    public readonly id?: string;
    public readonly score: number;
    public readonly guess: Guess | null;
    public readonly lastGuessTime: number | null;
    public readonly lastBtcPriceId: string | null;
    public readonly createdAt?: number;
    public readonly updatedAt?: number;

    private constructor(
        score: number,
        guess: Guess | null,
        lastGuessTime: number | null,
        lastBtcPriceId: string | null,
        id?: string,
        createdAt?: number,
        updatedAt?: number,
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
        lastGuessTime: number | null;
        lastBtcPriceId: string | null;
        createdAt: number;
        updatedAt: number;
    }): Required<PlayerModel> {
        return new PlayerModel(
            obj.score,
            obj.guess,
            obj.lastGuessTime,
            obj.lastBtcPriceId,
            obj.id,
            obj.createdAt,
            obj.updatedAt
        ) as Required<PlayerModel>;
    }

    makeGuess(guess: Guess, lastBtcPriceId: string): Required<PlayerModel> {
        console.log(this)
        this.assertPersisted();
        return new PlayerModel(
            this.score,
            guess,
            Date.now(),
            lastBtcPriceId,
            this.id,
            this.createdAt,
            this.updatedAt,
        ) as Required<PlayerModel>;
    }

    resolveGuess(isCorrect: boolean): Required<PlayerModel> {
        this.assertPersisted();
        return new PlayerModel(
            this.score + (isCorrect ? 1 : 0),
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
    assertPersisted(): asserts this is Required<PlayerModel> {
        if (
            this.id === undefined ||
            this.createdAt === undefined ||
            this.updatedAt === undefined
        ) {
            throw new Error('PlayerModel is not fully hydrated from the database!');
        }
    }


    assertHasGuess(): asserts this is this & { guess: Guess, lastGuessTime: number, lastBtcPriceId: string } {
        if (
            this.guess === null ||
            this.lastGuessTime === null ||
            this.lastBtcPriceId === null
        ) {
            throw new Error('PlayerModel does not have an active guess!');
        }
    }
}
