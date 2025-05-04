import { createClient } from "@supabase/supabase-js";
import { initializePriceService } from "../../index";

export default defineEventHandler(async (event) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVER_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw createError({
            statusCode: 500,
            statusMessage: "Supabase URL or key is not set"
        })
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
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