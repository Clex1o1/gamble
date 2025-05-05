import { GuessTimeNotUpError, NoActiveGuessError, PlayerNotFoundError, PriceDidNotChangeError } from '../errors';
import { PlayerModel } from '../models/player.model';
import { Guess } from '../types';
import { PlayerService } from './player.service';
import { PriceService } from './price.service';

export interface IGameService {
    initializePlayer(playerId: string): Promise<PlayerModel>;
    makeGuess(playerId: string, guess: Guess): Promise<PlayerModel>;
    resolveGuess(playerId: string): Promise<PlayerModel>;
}

export class GameService implements IGameService {
    private readonly guessTime: number;

    constructor(
        private readonly playerService: PlayerService,
        private readonly priceService: PriceService,
    ) {
        this.guessTime = (Number(process.env.GUESS_RESOLVE_SECONDS) ?? 60) * 1000;
    }

    async initializePlayer(playerId: string): Promise<PlayerModel> {
        return this.playerService.initializePlayer(playerId);
    }

    async makeGuess(playerId: string, guess: Guess): Promise<Required<PlayerModel>> {
        return this.playerService.makeGuess(playerId, guess);
    }


    async resolveGuess(playerId: string): Promise<Required<PlayerModel>> {
        const player: Required<PlayerModel> = await this.playerService.getPlayer(playerId);
        player.assertHasGuess();

        if (
            !(player.lastGuessTime !== null &&
                new Date(player.lastGuessTime).getTime() + this.guessTime <= Date.now())
        ) {
            throw new GuessTimeNotUpError();
        }
        const btcPrice = await this.priceService.getBtcPrice();
        const lastBtcPrice = await this.priceService.getPriceById(player.lastBtcPriceId);

        if (btcPrice.price === lastBtcPrice.price) {
            throw new PriceDidNotChangeError();
        }
        const isCorrect = player.guess === Guess.UP ? btcPrice.price > lastBtcPrice.price : btcPrice.price < lastBtcPrice.price;
        return this.playerService.resolveGuess(playerId, isCorrect);
    }
}