import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PlayerModel } from '~/server/models/player.model';
import type { PlayerRepository } from '~/server/repositories/player.repository';
import { PlayerService } from '~/server/services/player.service'
import { GameService } from '~/server/services/game.service'
import { Gues, Player } from '~/server/types'
import { ApiService } from '~/server/services/api.service';
import { PriceService } from '~/server/services/price.service';
import type { PriceRepository } from '~/server/repositories/price.repository';
import { PriceModel } from '~/server/models/price.model';

const guessTime = 0;
vi.stubEnv('GUESS_RESOLVE_SECONDS', guessTime.toString());


describe('Game Requirements', () => {
    let gameService: GameService;
    let playerService: PlayerService;
    let priceService: PriceService;
    let playerId: string;
    const now = Date.now();

    let currentPlayer = PlayerModel.hydrate({
        id: 'mock-id',
        score: 0,
        guess: null,
        lastGuessTime: null,
        lastBtcPriceId: null,
        createdAt: now,
        updatedAt: now,
    });

    let currentPrice = PriceModel.hydrate({
        id: 'mock-id',
        price: 10000,
        createdAt: now,
        updatedAt: now,
    });

    const mockPlayerRepository = {
        createPlayer: vi.fn().mockImplementation((player: PlayerModel) => {
            // Simulate DB assigning id, createdAt, updatedAt
            currentPlayer = PlayerModel.hydrate({
                id: player.id ?? 'mock-id',
                score: player.score,
                guess: player.guess,
                lastGuessTime: player.lastGuessTime,
                lastBtcPriceId: player.lastBtcPriceId,
                createdAt: now,
                updatedAt: now,
            });
            return Promise.resolve(currentPlayer);
        }),
        updatePlayer: vi.fn().mockImplementation((player: PlayerModel) => {
            // Simulate DB updating updatedAt
            currentPlayer = PlayerModel.hydrate({
                id: player.id ?? 'mock-id',
                score: player.score,
                guess: player.guess,
                lastGuessTime: player.lastGuessTime,
                lastBtcPriceId: player.lastBtcPriceId,
                createdAt: player.createdAt ?? now,
                updatedAt: now,
            });
            return Promise.resolve(currentPlayer);
        }),
        getPlayer: vi.fn().mockImplementation(() => Promise.resolve(currentPlayer)),
    } as unknown as PlayerRepository;

    const mockPriceRepository = {
        savePrice: vi.fn().mockImplementation((price: number) => {
            currentPrice = PriceModel.hydrate({
                id: currentPrice.id ?? 'mock-id',
                price,
                createdAt: now,
                updatedAt: now,
            });
            return Promise.resolve(currentPrice);
        }),
        getLastPrice: vi.fn().mockImplementation(() => Promise.resolve(currentPrice)),
        getPriceById: vi.fn().mockImplementation((id: string) => Promise.resolve(currentPrice)),
    } as unknown as PriceRepository;


    beforeEach(async () => {
        // Setup services with real or mock repositories
        // (You can use stateful mocks as shown in previous answers)
        priceService = new PriceService(mockPriceRepository, new ApiService());
        playerService = new PlayerService(mockPlayerRepository, priceService);
        gameService = new GameService(playerService, priceService);
        // priceService = new PriceService(mockRepository);
        playerId = 'test-player';
    });

    it('should allow the player to see their current score and the latest available BTC price in USD at all times', async () => {
        expect(false).toBe(true);
    });

    it('should allow the player to make a guess of either "up" or "down"', async () => {
        expect(false).toBe(true);
    });

    it('should prevent the player from making a new guess until the existing guess is resolved', async () => {
        expect(false).toBe(true);
    });

    it('should resolve a guess only when the price changes and at least 60 seconds have passed since the guess was made', async () => {
        expect(false).toBe(true);
    });

    it('should increase the player\'s score by 1 for a correct guess and decrease by 1 for an incorrect guess', async () => {
        expect(false).toBe(true);
    });

    it('should ensure the player can only have one active guess at a time', async () => {
        expect(false).toBe(true);
    });

    it('should initialize a new player with a score of 0', async () => {
        const player = await playerService.initializePlayer(playerId);
        expect(player.score).toBe(0);
    });

    it('should persist the player\'s score so that closing and reopening the browser restores their score and allows them to continue guessing', async () => {
        let player = await gameService.initializePlayer(playerId);
        expect(player.score).toBe(0);
        player = await playerService.resolveGuess(playerId, true);
        expect(player.score).toBe(1);
        const player2 = await gameService.initializePlayer(playerId);
        expect(player2.score).toBe(1);
    });

    it('should resolve guesses fairly using BTC price data from a 3rd party API', async () => {
        let player = await gameService.initializePlayer(playerId);
        console.log('player', player);
        player = await gameService.makeGuess(playerId, 'up');
        expect(player.guess).toBe('up');
        player = await gameService.resolveGuess(playerId);
        expect(player.score).toBe(1);
    });

    it('should persist the score of each player in a backend data store', async () => {
        expect(false).toBe(true);
    });
});
