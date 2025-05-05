export enum Guess {
    UP = 'up',
    DOWN = 'down',
}

export interface Player {
    id: string | undefined;
    score: number;
    guess: Guess | null;
    lastGuessTime: string | null;
    lastBtcPriceId: string | null;
    createdAt: string | undefined;
    updatedAt: string | undefined;
}
