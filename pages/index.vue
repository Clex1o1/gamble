<template>
  <UContainer>
    <h1>Hello World from Nuxt 2</h1>
    <UButton @click="startGame">Start Game</UButton>
    <p>Price: {{ price }}</p>
    <p>Score: {{ player.score }}</p>
  </UContainer>
</template>
<script setup lang="ts">
import type { Player } from "~/server/types";

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { data: price } = await useFetch("/api/price/price");
const { data: player, error } = await useFetch<Player>("/api/player/player", {
  default: () => ({
    id: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    score: 0,
    guess: null,
    lastGuessTime: null,
    lastBtcPriceId: null,
  }),
});

async function startGame() {
  console.log("startGame");
  if (!user.value) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error(error);
    }
    console.log(data);
  }
  // const { data, error } = await useFetch("/api/player/player");
}
</script>
