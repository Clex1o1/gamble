import { PlayerAlreadyHasAGuessError } from "../errors";
import { PlayerModel } from "../models/player.model";
import { PlayerRepository } from "../repositories/player.repository";
import { Guess, Player } from "../types";
import { PriceService } from "./price.service";
export interface IPlayerService {
    initializePlayer(userId: string): Promise<Required<PlayerModel>>;
    getPlayer(playerId: string): Promise<Required<PlayerModel>>;
    makeGuess(playerId: string, guess: Guess): Promise<Required<PlayerModel>>;
    resolveGuess(playerId: string, isCorrect: boolean): Promise<Required<PlayerModel>>;
}



export class PlayerService implements IPlayerService {
    constructor(private readonly playerRepository: PlayerRepository, private readonly priceService: PriceService) {
    }

    async initializePlayer(userId: string): Promise<Required<PlayerModel>> {
        const player = await this.playerRepository.getPlayer(userId);
        if (player) {
            return player;
        }
        let newPlayer = PlayerModel.createPlayer(userId);
        return await this.playerRepository.createPlayer(newPlayer);
    }

    async getPlayer(playerId: string): Promise<Required<PlayerModel>> {
        const player = await this.playerRepository.getPlayer(playerId);
        return player;
    }

    async makeGuess(playerId: string, guess: Guess): Promise<Required<PlayerModel>> {
        let player = await this.playerRepository.getPlayer(playerId);
        if (player.guess) {
            throw new PlayerAlreadyHasAGuessError();
        }
        const lastPrice = await this.priceService.getBtcPrice();
        player = player.makeGuess(guess, lastPrice.id);
        player = await this.playerRepository.updatePlayer(player);
        return player;
    }

    async resolveGuess(playerId: string, isCorrect: boolean): Promise<Required<PlayerModel>> {
        let player = await this.playerRepository.getPlayer(playerId);
        player = player.resolveGuess(isCorrect);
        player = await this.playerRepository.updatePlayer(player);
        return player;
    }

}
