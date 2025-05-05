import { initializeGameService, initializePlayerService } from "../../index";
import { serverSupabaseClient, serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { Guess } from "~/server/types";
import { PriceDidNotChangeError } from "~/server/errors/guess.errors";

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseServiceRole(event);
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        })
    }
    const gameService = initializeGameService(supabase);
    try {
        const player = await gameService.resolveGuess(user.id)
        return player.dto();
    } catch (error) {
        console.error(error);
        if (error instanceof PriceDidNotChangeError) {
            throw createError({
                statusCode: 400,
                statusMessage: "Price did not change",
                data: {
                    error: error,
                    retry: true
                }
            })
        }
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to resolve guess"
        })
    }
})