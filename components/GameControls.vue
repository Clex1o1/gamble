<template>
  <div class="game-controls" role="group" aria-label="Game Controls">
    <svg
      viewBox="-25 -25 250 250"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      style="transform: rotate(-90deg)"
      class="loader"
      role="img"
      aria-label="Progress indicator"
    >
      <title>Game progress indicator</title>
      <desc>
        A circular progress indicator showing the time remaining for the current
        guess
      </desc>
      <circle
        r="90"
        cx="100"
        cy="100"
        fill="transparent"
        stroke="var(--color-gray-200)"
        class="loader-bg"
        stroke-width="16px"
      ></circle>
      <circle
        r="90"
        cx="100"
        cy="100"
        class="progress"
        :class="status"
        stroke="var(--color-primary-400)"
        stroke-width="16px"
        stroke-linecap="round"
        :stroke-dashoffset="`${(565.48 * (100 - progress)) / 100}px`"
        fill="transparent"
        stroke-dasharray="565.48"
      ></circle>
    </svg>

    <div class="buttons grid">
      <UButton
        @click="$emit('up')"
        :disabled="disabled"
        class="control-button"
        variant="outline"
        aria-label="Guess price will go up"
      >
        <Icon name="fa6-solid:angle-up" aria-hidden="true" />
        <span>UP</span>
      </UButton>
      <UButton
        @click="$emit('down')"
        variant="outline"
        :disabled="disabled"
        class="control-button"
        aria-label="Guess price will go down"
      >
        <span>DOWN</span>
        <Icon name="fa6-solid:angle-down" aria-hidden="true" />
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  disabled: boolean;
  progress: number;
  status: "ok" | "warning" | "error";
}>();

const status = computed(() => {
  return `status-${props.status}`;
});

defineEmits<{
  (e: "up"): void;
  (e: "down"): void;
}>();
</script>

<style scoped>
.game-controls {
  display: grid;
  gap: var(--spacing-4);
  position: relative;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1/1;
  min-width: 20rem;
  width: 100%;
}

.loader {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.control-button {
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px 8px 0 0;
  font-size: 1.2rem;
  border-width: 2px;
  transition: all var(--transition-duration) ease;
}

.control-button + .control-button {
  border-radius: 0 0 8px 8px;
}

.control-button .iconify {
  display: block;
  width: 100%;
  height: 100%;
}

.progress {
  stroke: var(--color-primary-400);
  transition: stroke var(--transition-duration) linear;
}

.status-ok {
  stroke: var(--color-primary-400);
}

.status-warning {
  stroke: var(--color-warning-400);
}

.status-error {
  stroke: var(--color-error-400);
}
</style>
