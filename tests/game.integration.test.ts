import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { PlayerModel } from '~/server/models/player.model';
import type { PlayerRepository } from '~/server/repositories/player.repository';
import { PlayerService } from '~/server/services/player.service'
import { GameService } from '~/server/services/game.service'
import { Gues, Player } from '~/server/types'
import { PriceService } from '~/server/services/price.service';
import type { PriceRepository } from '~/server/repositories/price.repository';
import { PriceModel } from '~/server/models/price.model';
import { ApiService } from '~/server/services/api.service';
import { PlayerAlreadyHasAGuessError } from '~/server/errors/player.errors';
import { PriceDidNotChangeError } from '~/server/errors/guess.errors';

const guessTime = 0;
vi.stubEnv('GUESS_RESOLVE_SECONDS', guessTime.toString());

vi.mock('~/server/services/api.service');

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

    let currentPrices = new Map<string, PriceModel>();
    currentPrices.set('mock-id', PriceModel.hydrate({
        id: 'mock-id',
        price: 10000,
        createdAt: now,
        updatedAt: now,
    }));

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
            const id = Math.random().toString();
            currentPrices.set(id, PriceModel.hydrate({
                id,
                price,
                createdAt: now,
                updatedAt: now,
            }));
            return Promise.resolve(currentPrices.get(id));
        }),
        getLastPrice: vi.fn().mockImplementation(() => Promise.resolve(currentPrices.get('mock-id'))),
        getPriceById: vi.fn().mockImplementation((id: string) => Promise.resolve(currentPrices.get(id))),
    } as unknown as PriceRepository;

    beforeEach(async () => {
        // Setup services with real or mock repositories
        // (You can use stateful mocks as shown in previous answers)
        priceService = new PriceService(mockPriceRepository, new ApiService());
        playerService = new PlayerService(mockPlayerRepository, priceService);
        gameService = new GameService(playerService, priceService);
        playerId = 'test-player';

    });
    afterEach(() => {
        vi.clearAllMocks();
        currentPlayer = PlayerModel.hydrate({
            id: 'mock-id',
            score: 0,
            guess: null,
            lastGuessTime: null,
            lastBtcPriceId: null,
            createdAt: 0,
            updatedAt: 0
        });
        currentPrices.clear()
        currentPrices.set('mock-id', PriceModel.hydrate({
            id: 'mock-id',
            price: 10000,
            createdAt: now,
            updatedAt: now,
        }));
        vi.stubEnv('GUESS_RESOLVE_SECONDS', '0');
    });

    it('should allow the player to see their current score and the latest available BTC price in USD at all times', async () => {
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(10000);
        let player = await gameService.initializePlayer(playerId);
        expect(player.score).toBe(0);
        let price = await priceService.getBtcPrice();
        expect(price.price).toBe(10000);
    });

    it('should allow the player to make a guess of either "up" or "down"', async () => {
        let player = await gameService.initializePlayer(playerId);
        player = await gameService.makeGuess(playerId, 'up');
        expect(player.guess).toBe('up');
    });

    it('should prevent the player from making a new guess until the existing guess is resolved', async () => {
        let player = await gameService.initializePlayer(playerId);
        player = await gameService.makeGuess(playerId, 'up');
        expect(player.guess).toBe('up');
        await expect(gameService.makeGuess(playerId, 'down')).rejects.toThrow(PlayerAlreadyHasAGuessError);
    });

    it('should resolve a guess only when the price changes and at least 60 seconds have passed since the guess was made', async () => {
        vi.stubEnv('GUESS_RESOLVE_SECONDS', '0.1');
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1000);
        let player = await gameService.initializePlayer(playerId);
        player = await gameService.makeGuess(playerId, 'up');
        expect(player.guess).toBe('up');
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1100);
        await new Promise(resolve => setTimeout(resolve, 200));
        const result = await gameService.resolveGuess(playerId);
        expect(result.score).toBe(1);
    });

    it('should not resolve the the guess if price did not change but 60 seconds pass', async () => {
        vi.stubEnv('GUESS_RESOLVE_SECONDS', '0.1');
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1000);
        let player = await gameService.initializePlayer(playerId);
        player = await gameService.makeGuess(playerId, 'up');
        expect(player.guess).toBe('up');
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1000);
        await new Promise(resolve => setTimeout(resolve, 200));
        await expect(gameService.resolveGuess(playerId)).rejects.toThrow(PriceDidNotChangeError);
    });

    it('should increase the player\'s score by 1 for a correct guess and decrease by 1 for an incorrect guess', async () => {
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1000);
        let player = await gameService.initializePlayer(playerId);
        player = await gameService.makeGuess(playerId, 'up');
        expect(player.guess).toBe('up');
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1100);
        player = await gameService.resolveGuess(playerId);
        expect(player.score).toBe(1);
        player = await gameService.makeGuess(playerId, 'down');
        expect(player.guess).toBe('down');
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1000);
        player = await gameService.resolveGuess(playerId);
        expect(player.score).toBe(2);
        player = await gameService.makeGuess(playerId, 'up');
        expect(player.guess).toBe('up');
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(900);
        player = await gameService.resolveGuess(playerId);
        expect(player.score).toBe(1);
    });

    it('should ensure the player can only have one active guess at a time', async () => {
        let player = await gameService.initializePlayer(playerId);
        player = await gameService.makeGuess(playerId, 'up');
        expect(player.guess).toBe('up');
        await expect(gameService.makeGuess(playerId, 'down')).rejects.toThrow(PlayerAlreadyHasAGuessError);
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
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1000);
        let player = await gameService.initializePlayer(playerId);
        player = await gameService.makeGuess(playerId, 'up');
        expect(player.guess).toBe('up');
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1100);
        player = await gameService.resolveGuess(playerId);
        expect(player.score).toBe(1);
    });
    it('should score a guess correctly', async () => {
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1000);
        let player = await gameService.initializePlayer(playerId);
        player = await gameService.makeGuess(playerId, 'up');
        expect(player.guess).toBe('up');
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1100);
    });
    it('should score a guess incorrectly', async () => {
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1000);
        let player = await gameService.initializePlayer(playerId);
        player = await gameService.makeGuess(playerId, 'up');
        expect(player.guess).toBe('up');
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(900);
    });
    it('should persist the score of each player in a backend data store', async () => {
        let player = await gameService.initializePlayer(playerId);
        player = await gameService.makeGuess(playerId, 'up');
        expect(player.guess).toBe('up');
        vi.mocked(ApiService.prototype.getBtcPrice).mockResolvedValue(1100);
        player = await gameService.resolveGuess(playerId);
        expect(player.score).toBe(1);
    });
});
