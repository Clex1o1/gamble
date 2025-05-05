import { initializeGameService, initializePlayerService } from "../../index";
import { serverSupabaseClient, serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { Guess } from "~/server/types";
import { GuessTimeNotUpError, InvalidGuessTypeError } from "~/server/errors/guess.errors";

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseServiceRole(event);
    const user = await serverSupabaseUser(event);
    const { guess } = await readBody<{ guess: Guess }>(event);
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        })
    }
    const gameService = initializeGameService(supabase);
    try {
        const player = await gameService.makeGuess(user.id, guess)
        return player.dto();
    } catch (error) {
        console.error(error);
        if (error instanceof GuessTimeNotUpError) {
            throw createError({
                statusCode: 400,
                statusMessage: "Guess time not up",
                data: {
                    error: error,
                    retry: true
                }
            })
        }
        if (error instanceof InvalidGuessTypeError) {
            throw createError({
                statusCode: 400,
                statusMessage: "Invalid guess type",
                data: {
                    error: error,
                    retry: true
                }
            })
        }
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to make guess",
        })
    }
})