export type Guess = 'up' | 'down';

export interface Player {
    id: string | undefined;
    score: number;
    guess: Guess | null;
    lastGuessTime: number | null;
    lastBtcPriceId: string | null;
    createdAt: number | undefined;
    updatedAt: number | undefined;
}
