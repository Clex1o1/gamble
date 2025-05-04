import { PlayerModel } from "../models/player.model";
import { Guess, Player } from "../types";
import { PlayerService } from "./player.service";
import { PriceService } from "./price.service";
export interface IGameService {
    initializePlayer(playerId: string): Promise<Player>;
    makeGuess(playerId: string, guess: Guess): Promise<Player>;
    resolveGuess(playerId: string): Promise<Player>;
}

export class GameService implements IGameService {
    private readonly guessTime = process.env.GUESS_RESOLVE_SECONDS ? parseInt(process.env.GUESS_RESOLVE_SECONDS) * 1000 : 60 * 1000;
    constructor(private readonly playerService: PlayerService, private readonly priceService: PriceService) {
    }

    async initializePlayer(playerId: string): Promise<Player> {
        return this.playerService.initializePlayer(playerId);
    }

    async makeGuess(playerId: string, guess: Guess): Promise<Player> {
        return this.playerService.makeGuess(playerId, guess);
    }
    async resolveGuess(playerId: string): Promise<Player> {
        const player: Required<PlayerModel> = await this.playerService.getPlayer(playerId);
        player.assertHasGuess();

        if (
            !(player.lastGuessTime !== null &&
                Date.now() - player.lastGuessTime >= this.guessTime)
        ) {
            throw new Error('Guess time is not up');
        }
        const btcPrice = await this.priceService.getBtcPrice();
        const lastBtcPrice = await this.priceService.getPriceById(player.lastBtcPriceId);
        const isCorrect = player.guess === 'up' ? btcPrice > lastBtcPrice : btcPrice < lastBtcPrice;
        return this.playerService.resolveGuess(playerId, isCorrect);
    }
}