import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PlayerModel } from '~/server/models/player.model';
import { PlayerRepository } from '~/server/repositories/player.repository';
import { PlayerService } from '~/server/services/player.service';
import { PlayerAlreadyHasAGuessError } from '~/server/errors';
describe('Player Service', () => {
    let currentPlayer: PlayerModel;
    let mockRepository: PlayerRepository;

    beforeEach(() => {
        // Reset player state before each test
        currentPlayer = PlayerModel.hydrate({
            id: '123',
            score: 0,
            guess: null,
            lastGuessTime: null,
            lastBtcPriceId: null,
            createdAt: 0,
            updatedAt: 0,
            deletedAt: null,
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
    });

    it('should initialize a new player with a score of 0', async () => {
        const playerService = new PlayerService(mockRepository);
        const player = await playerService.initializePlayer('123');
        expect(player.score).toBe(0);
    });

    it('should allow the player to make a guess', async () => {
        const playerService = new PlayerService(mockRepository);
        const player = await playerService.initializePlayer('123');
        const { guess } = await playerService.makeGuess(player.id, 'up');
        expect(guess).toBe('up');
    });

    it('should not allow the player to make a new guess if a guess is already pending', async () => {
        const playerService = new PlayerService(mockRepository);
        const player = await playerService.initializePlayer('123');
        const { guess } = await playerService.makeGuess(player.id, 'up');
        expect(guess).toBe('up');
        await expect(playerService.makeGuess(player.id, 'down')).rejects.toThrow(PlayerAlreadyHasAGuessError);
    });

    it('should persist the player\'s score across sessions', async () => {
        // TODO: not sure if this is the correct test
        const playerService = new PlayerService(mockRepository);
        const originalPlayer = await playerService.initializePlayer('123');
        await playerService.incrementScore(originalPlayer.id);
        const player = await playerService.getPlayer(originalPlayer.id);
        expect(player.score).toBe(1);
        const player2 = await playerService.getPlayer(originalPlayer.id);
        expect(player2.score).toBe(1);
    });

    it('should restore the player\'s score after session reload', () => {
        // TODO: not sure how to test this correctly; is this the right place?
        expect(false).toBe(true);
    });
});


