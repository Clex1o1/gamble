import { SupabaseClient } from "@supabase/supabase-js";
import { PlayerModel } from "~/server/models/player.model";

export class PlayerRepository {
    constructor(private readonly db: SupabaseClient) { }
    async getPlayer(id: string): Promise<Required<PlayerModel> | null> {
        const { data, error } = await this.db.from('players').select('*').eq('id', id).limit(1);
        if (error) {
            throw new Error(error.message);
        }
        if (data.length === 0) {
            return null;
        }
        const persistedPlayer: PlayerModel = PlayerModel.hydrate(data[0]);
        persistedPlayer.assertPersisted();
        return persistedPlayer;
    }

    async createPlayer(player: PlayerModel): Promise<Required<PlayerModel>> {
        const { data, error } = await this.db.from('players').insert(player.toEntity()).select().single();
        if (error) {
            throw new Error(error.message);
        }
        const persistedPlayer: PlayerModel = PlayerModel.hydrate(data);
        persistedPlayer.assertPersisted();
        return persistedPlayer;
    }

    async updatePlayer(player: PlayerModel): Promise<Required<PlayerModel>> {
        const { data, error } = await this.db.from('players').update(player.toEntity()).eq('id', player.id).select().single();
        if (error) {
            throw new Error(error.message);
        }
        const persistedPlayer: PlayerModel = PlayerModel.hydrate(data);
        persistedPlayer.assertPersisted();
        return persistedPlayer;
    }

    async deletePlayer(id: string): Promise<void> {
        const { error } = await this.db.from('players').delete().eq('id', id);
        if (error) {
            throw new Error(error.message);
        }
    }
}