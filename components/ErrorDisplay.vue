<template>
  <div class="error-display">
    <UAlert type="error">
      <p class="error-message">{{ error.message }}</p>
    </UAlert>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error: Error;
}>();
</script>

<style scoped>
.error-display {
  margin: 1rem 0;
}

.error-message {
  margin: 0;
  font-weight: 500;
}
</style>
