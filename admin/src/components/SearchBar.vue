<template>
  <n-space align="center" size="small">
    <n-input
      v-model:value="model"
      placeholder="Поиск по тексту"
      clearable
    />
    <n-button size="small" tertiary @click="$emit('clear')">Сброс</n-button>
  </n-space>
</template>

<script setup lang="ts">
import { NButton, NInput, NSpace } from 'naive-ui';

const emit = defineEmits<{
  (e: 'clear'): void;
}>();

const model = defineModel<string>({ required: true });
</script>
