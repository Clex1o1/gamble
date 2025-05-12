<template>
  <div class="game-stats gap-4 flex flex-col items-center md:max-w-sm">
    <div class="grid grid-cols-2 gap-4 w-full">
      <span class="text-2xl"> Price: </span>
      <div class="relative flex justify-end h-8">
        <span
          class="text-3xl text-primary font-bold text-right"
          aria-live="polite"
        >
          {{ animatedPrice.price.toFixed(2) }}
        </span>
        <span class="text-3xl text-primary font-bold text-right ml-2"> $</span>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4 w-full">
      <span class="text-2xl"> Score: </span>
      <div class="relative flex justify-end h-8">
        <span
          class="text-3xl text-primary font-bold text-right"
          aria-live="polite"
        >
          {{ animatedScore.score.toFixed(0) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from "gsap";

const props = defineProps<{
  price: number;
  score: number;
  isVisible: boolean;
}>();

const localScore = ref(props.score);
const localPrice = ref(props.price);

const animatedScore = reactive({
  score: 0,
});
const animatedPrice = reactive({
  price: 0,
});

watch(
  () => localScore.value,
  (n) => {
    if (import.meta.client) {
      gsap.to(animatedScore, { duration: 0.5, score: Number(n) || 0 });
    }
  },
  { immediate: true }
);

watch(
  () => localPrice.value,
  (n) => {
    if (import.meta.client) {
      gsap.to(animatedPrice, { duration: 0.5, price: Number(n) || 0 });
    }
  },
  { immediate: true }
);

watch(
  () => props.isVisible,
  (newVisible) => {
    if (newVisible) {
      setTimeout(() => {
        localPrice.value = props.price;
        localScore.value = props.score;
      }, 600);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.game-stats {
  grid-template-columns: min-content minmax(0, 1fr);
}
</style>
