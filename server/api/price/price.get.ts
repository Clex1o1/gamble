import { initializePriceService } from "../../index";
import { serverSupabaseServiceRole } from '#supabase/server'
export default defineEventHandler(async (event) => {

    const supabase = serverSupabaseServiceRole(event);
    const priceService = initializePriceService(supabase);
    try {
        const price = await priceService.getBtcPrice();
        return price.dto();
    } catch (error) {
        console.error(error);
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to get price"
        })
    }
})