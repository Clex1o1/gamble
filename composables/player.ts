import { PriceDidNotChangeError } from "~/server/errors/guess.errors";
import type { Player } from "~/server/types";
import { Guess } from "~/server/types";

export const usePlayer = () => {
    const player = useState<Player>("player", () => ({
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        score: 0,
        guess: null,
        lastGuessTime: null,
        lastBtcPriceId: null,
    }));

    const loading = ref(false);
    const error = ref<Error | null>(null);

    // const { data: playerData, refresh: refreshPlayer, pending } = useFetch("/api/player/player")

    async function loadPlayer() {
        loading.value = true;
        error.value = null;

        try {
            const response = await $fetch<Player>("/api/player/player");
            if (response) {
                player.value = response;
            }
            return response;
        } catch (err) {
            error.value = err as Error;
            const toast = useToast();
            toast.add({
                title: "Error loading player",
                description: error.value.message,
                color: "error",
            });
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function updatePlayer(data: Partial<Player>) {
        loading.value = true;
        error.value = null;

        try {
            const response = await $fetch<Player>("/api/player/player", {
                method: "PUT",
                body: data
            });
            if (response) {
                player.value = response;
            }
            return response;
        } catch (err) {
            error.value = err as Error;
            const toast = useToast();
            toast.add({
                title: "Error updating player",
                description: error.value.message,
                color: "error",
            });
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function makeGuess(guess: Guess) {
        loading.value = true;
        error.value = null;
        player.value.lastGuessTime = new Date().toISOString();
        try {
            const response = await $fetch<Player>("/api/game/guess", {
                method: "POST",
                body: { guess }
            });
            if (response) {
                player.value = response;
            }
            return response;
        } catch (err) {
            error.value = err as Error;
            const toast = useToast();
            toast.add({
                title: "Error making guess",
                description: error.value.message,
                color: "error",
            });
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function resolveGuess(): Promise<{ score: number, correct: boolean } | { priceDidNotChange: boolean, restart: boolean }> {
        loading.value = true;
        error.value = null;

        try {
            const response = await $fetch<{ score: number }>("/api/game/resolve", {
                method: "POST"
            });
            let correct = false;

            if (response) {
                if (response.score > player.value.score) {
                    const toast = useToast();
                    correct = true;
                    toast.add({
                        title: "Congratulations!",
                        description: "Your guess was correct!",
                        color: "success",
                    });
                    if (import.meta.client) {
                        const confetti = await import('js-confetti').then(module => new module.default());
                        confetti.addConfetti();
                    }
                } else {
                    const toast = useToast();
                    correct = false;
                    toast.add({
                        title: "Oops!",
                        description: "Your guess was incorrect!",
                        color: "warning",
                    });
                }
                await loadPlayer(); // Refresh player data after resolution
            }

            return {
                score: response.score,
                correct: correct
            };
        } catch (err: unknown) {
            const errData = (err as any)?.data?.data;

            // Only show error toast if not a retry error
            if (!errData?.retry) {
                const toast = useToast();
                toast.add({
                    title: "Error resolving guess",
                    description: (err as Error).message,
                    color: "error",
                });
                error.value = err as Error;
            }
            else if (errData?.error.name === PriceDidNotChangeError.name) {
                // Return special value to indicate price didn't change
                return {
                    priceDidNotChange: true,
                    restart: true
                };
            }

            return {
                priceDidNotChange: false,
                restart: false
            };
        } finally {
            loading.value = false;
        }
    }

    return {
        player,
        loading,
        error,
        loadPlayer,
        updatePlayer,
        makeGuess,
        resolveGuess,
    };
}