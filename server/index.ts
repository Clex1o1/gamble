import { PlayerRepository } from "./repositories/player.repository";
import { PriceRepository } from "./repositories/price.repository";
import { ApiService } from "./services/api.service";
import { GameService } from "./services/game.service";
import { PlayerService } from "./services/player.service";
import { PriceService } from "./services/price.service";
import { SupabaseClient } from "@supabase/supabase-js";

export function initializeGameService(supabase: SupabaseClient) {
    const priceService = new PriceService(new PriceRepository(supabase), new ApiService());
    const playerService = new PlayerService(new PlayerRepository(supabase), priceService);
    const gameService = new GameService(playerService, priceService);
    return gameService;
}

export function initializePlayerService(supabase: SupabaseClient) {
    const priceService = new PriceService(new PriceRepository(supabase), new ApiService());
    const playerService = new PlayerService(new PlayerRepository(supabase), priceService);
    return playerService;
}

export function initializePriceService(supabase: SupabaseClient) {
    const priceService = new PriceService(new PriceRepository(supabase), new ApiService());
    return priceService;
}