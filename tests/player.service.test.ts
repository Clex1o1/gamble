import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PlayerModel } from '~/server/models/player.model';
import { PlayerRepository } from '~/server/repositories/player.repository';
import { PlayerService } from '~/server/services/player.service';
import { PlayerAlreadyHasAGuessError } from '~/server/errors';
import { Guess } from '~/server/types';
import { PriceService } from '~/server/services/price.service';

describe('Player Service', () => {
    let currentPlayer: PlayerModel;
    let mockRepository: PlayerRepository;
    let mockPriceService: PriceService;

    beforeEach(() => {
        // Reset player state before each test
        currentPlayer = PlayerModel.hydrate({
            id: '123',
            score: 0,
            guess: null,
            last_guess_time: null,
            last_price_id: null,
            created_at: '0',
            updated_at: '0',
        });

        mockRepository = {
            createPlayer: vi.fn().mockImplementation((player: PlayerModel) => {
                currentPlayer = player;
                return Promise.resolve(currentPlayer);
            }),
            updatePlayer: vi.fn().mockImplementation((player: PlayerModel) => {
                currentPlayer = player;
                return Promise.resolve(currentPlayer);
            }),
            getPlayer: vi.fn().mockImplementation(() => Promise.resolve(currentPlayer)),
        } as unknown as PlayerRepository;

        mockPriceService = {
            getBtcPrice: vi.fn().mockResolvedValue({ id: 'price1', price: 1000 }),
            getPriceById: vi.fn().mockResolvedValue({ id: 'price1', price: 1000 }),
        } as unknown as PriceService;
    });

    it('should initialize a new player with a score of 0', async () => {
        const playerService = new PlayerService(mockRepository, mockPriceService);
        const player = await playerService.initializePlayer('123');
        expect(player.score).toBe(0);
    });

    it('should allow the player to make a guess', async () => {
        const playerService = new PlayerService(mockRepository, mockPriceService);
        const player = await playerService.initializePlayer('123');
        const { guess } = await playerService.makeGuess(player.id, Guess.UP);
        expect(guess).toBe(Guess.UP);
    });

    it('should not allow the player to make a new guess if a guess is already pending', async () => {
        const playerService = new PlayerService(mockRepository, mockPriceService);
        const player = await playerService.initializePlayer('123');
        const { guess } = await playerService.makeGuess(player.id, Guess.UP);
        expect(guess).toBe(Guess.UP);
        await expect(playerService.makeGuess(player.id, Guess.DOWN)).rejects.toThrow(PlayerAlreadyHasAGuessError);
    });

    it('should persist the player\'s score across sessions', async () => {
        const playerService = new PlayerService(mockRepository, mockPriceService);
        const originalPlayer = await playerService.initializePlayer('123');
        await playerService.resolveGuess(originalPlayer.id, true);
        const player = await playerService.getPlayer(originalPlayer.id);
        expect(player.score).toBe(1);
        const player2 = await playerService.getPlayer(originalPlayer.id);
        expect(player2.score).toBe(1);
    });

    it('should restore the player\'s score after session reload', async () => {
        const playerService = new PlayerService(mockRepository, mockPriceService);
        const player = await playerService.initializePlayer('123');
        await playerService.resolveGuess(player.id, true);
        const reloadedPlayer = await playerService.getPlayer(player.id);
        expect(reloadedPlayer.score).toBe(1);
    });
});


