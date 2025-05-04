import { initializePlayerService } from "../../index";
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized"
        })
    }
    const playerService = initializePlayerService(supabase);
    try {
        const player = await playerService.initializePlayer(user.id)
        return player.dto();
    } catch (error) {
        console.error(error);
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to get player"
        })
    }
})