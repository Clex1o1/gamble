import { Guess, type Player } from "~/server/types";
import { useIntervalFn } from "@vueuse/core";
import { PriceDidNotChangeError } from "~/server/errors/guess.errors";

export const useGame = () => {
    const { makeGuess, resolveGuess } = usePlayer();
    const { data: price, refresh: refreshPrice } = useFetch("/api/price/price");
    const config = useRuntimeConfig();
    const guessTime = Number(config.public.GUESS_RESOLVE_SECONDS) * 1000;
    const toast = useToast();
    const retries = ref(0);
    const player = useState<Player>("player");
    const timeLeft = ref(0);
    const lastGuessTime = ref(0);
    const isResolving = ref(false);
    const progressStatus = ref<'ok' | 'warning' | 'error'>('ok');
    const gameState = ref<'idle' | 'running' | 'finished'>('idle');

    const progress = computed<{ value: number, status: 'ok' | 'warning' | 'error' }>(() => {
        return {
            value: 100 - ((timeLeft.value / guessTime) * 100),
            status: progressStatus.value
        };
    });

    const { pause: pauseInterval, resume: resumeInterval } = useIntervalFn(() => {
        const timeValue = guessTime - (Date.now() - lastGuessTime.value);
        timeLeft.value = timeValue > 0 ? timeValue : 0;
    }, 10, { immediate: false });

    async function resolveGuessWithRetry() {
        if (isResolving.value) return;
        isResolving.value = true;
        try {
            const result = await resolveGuess();
            if ('correct' in result) {
                progressStatus.value = result.correct ? 'ok' : 'error';
                setTimeout(() => {
                    gameState.value = 'finished';
                }, 3000);
            }
            await refreshPrice();

            if (shouldRestartTimer(result)) {
                progressStatus.value = 'warning';
                if (retries.value > 10) {
                    toast.add({
                        title: "Too many retries",
                        description: "The price hasn't changed enough times. Please try again later.",
                        color: "error",
                    });
                    return;
                }

                toast.add({
                    title: "Price didn't change",
                    description: "Restarting timer to wait for a price change",
                    color: "warning",
                });
                retries.value++;
                startGuessTimeout(Date.now());
            } else {
                retries.value = 0;
            }
        } catch (error) {
            toast.add({
                title: "Error",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                color: "error",
            });
        } finally {
            isResolving.value = false;
        }
    }

    function startGuessTimeout(startTime: number) {
        pauseInterval();
        resumeInterval();

        lastGuessTime.value = Date.now();
        const remainingTime = guessTime - (Date.now() - startTime);
        if (remainingTime > 0) {
            setTimeout(resolveGuessWithRetry, remainingTime);
        } else {
            resolveGuessWithRetry();
        }
    }

    async function gamble(guess: Guess) {
        progressStatus.value = 'ok';
        const updatedPlayer = await makeGuess(guess);
        if (updatedPlayer?.lastGuessTime) {
            startGuessTimeout(new Date(updatedPlayer.lastGuessTime).getTime());
        }
    }

    function stopInterval() {
        pauseInterval();
    }

    onUnmounted(() => {
        stopInterval();
    });

    return {
        price,
        guessTime,
        gamble,
        timeLeft,
        stopInterval,
        startInterval: resumeInterval,
        progress,
        startGuessTimeout,
        player,
        gameState
    }
};

function shouldRestartTimer(result: any): boolean {
    return result && 'restart' in result && result.restart === true;
}