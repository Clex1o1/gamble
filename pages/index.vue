<template>
  <div class="flex flex-col gap-4 flex-1 h-full">
    <header class="bg-slate-800 p-8 h-24">
      <transition :name="slideAnimation" mode="out-in">
        <h1
          v-if="gameState === 'idle' || gameState === 'finished'"
          class="text-4xl font-bold text-center"
        >
          Gamble Game
        </h1>
        <div v-else-if="gameState === 'running'" class="grid grid-cols-3">
          <UButton
            @click="back"
            variant="link"
            icon="i-heroicons-arrow-left"
            class="mr-auto"
            :disabled="!!player.lastGuessTime"
          ></UButton>
          <h1 class="text-2xl font-bold text-center">Set Bet</h1>
        </div>
      </transition>
    </header>
    <UContainer
      class="flex flex-col gap-4 p-4 flex-1 h-full md:grid md:grid-cols-2"
    >
      <div class="flex-col gap-8 justify-center hidden md:flex">
        <GameStats
          :is-visible="
            !!!player.lastGuessTime &&
            (gameState === 'idle' || gameState === 'finished')
          "
          :price="price?.price ?? 0"
          :score="player.score"
          :guessTime="guessTime"
        />
        <div v-if="!isLoggedIn">
          <UButton
            @click="startGame"
            :disabled="isLoadingPlayer"
            :loading="isLoadingPlayer"
            class="rounded-full w-full place-content-center text-xl font-bold text-white"
            >Start Game</UButton
          >
        </div>
      </div>
      <transition :name="slideAnimation" mode="out-in" class="md:hidden">
        <GameStats
          v-if="
            !!!player.lastGuessTime &&
            (gameState === 'idle' || gameState === 'finished')
          "
          :is-visible="
            !!!player.lastGuessTime &&
            (gameState === 'idle' || gameState === 'finished')
          "
          :price="price?.price ?? 0"
          :score="player.score"
          :guessTime="guessTime"
        />
        <div
          v-else-if="gameState === 'running'"
          class="grid gap-4 place-content-center"
        >
          <GameControls
            v-if="player"
            :disabled="!!player.lastGuessTime || !isLoggedIn"
            :progress="progress.value"
            :status="progress.status"
            @up="gamble(Guess.UP)"
            @down="gamble(Guess.DOWN)"
          />
        </div>
      </transition>
      <div class="hidden md:grid gap-4 place-content-center">
        <GameControls
          v-if="player"
          :disabled="!!player.lastGuessTime || !isLoggedIn"
          :progress="progress.value"
          :status="progress.status"
          @up="gamble(Guess.UP)"
          @down="gamble(Guess.DOWN)"
        />
      </div>
      <div class="grid gap-4 mt-auto md:hidden">
        <transition name="slideUpDown" mode="out-in">
          <div v-if="!isLoggedIn" class="md:hidden">
            <UButton
              @click="startGame"
              :disabled="isLoadingPlayer"
              :loading="isLoadingPlayer"
              class="rounded-full w-full place-content-center text-xl font-bold text-white"
              >Start Game</UButton
            >
          </div>
          <div
            v-else-if="
              (gameState === 'idle' || gameState === 'finished') && isLoggedIn
            "
          >
            <UButton
              @click="startRound"
              class="rounded-full w-full place-content-center text-xl font-bold text-white"
              >Start Round</UButton
            >
          </div>
        </transition>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
// Imports
import { Guess } from "~/server/types";

// Composables
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const toast = useToast();
const { error, loadPlayer, player } = usePlayer();
const {
  price,
  guessTime,
  gamble,
  startInterval,
  stopInterval,
  startGuessTimeout,
  progress,
  gameState,
} = useGame();

const isLoadingPlayer = ref(false);

const isLoggedIn = computed(() => player.value.isLoggedIn);

const slideAnimation = ref("slide-left");

async function startGame() {
  if (!user.value) {
    isLoadingPlayer.value = true;
    const { data, error } = await supabase.auth.signInAnonymously();
    await loadPlayer();
    if (error) {
      toast.add({
        title: "Error",
        description: error.message,
        color: "error",
      });
    } else {
      toast.add({
        title: "Success",
        description: "Ready to play!",
        color: "success",
      });
    }
    isLoadingPlayer.value = false;
  }
}

async function back() {
  slideAnimation.value = "slide-right";
  gameState.value = "idle";
}

async function startRound() {
  slideAnimation.value = "slide-left";
  gameState.value = "running";
}

onUnmounted(() => {
  stopInterval();
});

onMounted(async () => {
  await loadPlayer();
  startInterval();
});

watch(
  player,
  (newPlayer) => {
    if (newPlayer?.lastGuessTime) {
      startGuessTimeout(new Date(newPlayer.lastGuessTime).getTime());
    }
  },
  { immediate: true }
);
</script>
<style>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.slide-left-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}
.slide-right-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.slideUpDown-enter-active,
.slideUpDown-leave-active {
  transition: all 0.3s ease;
}

.slideUpDown-enter-from,
.slideUpDown-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.slideUpDown-enter-to,
.slideUpDown-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
