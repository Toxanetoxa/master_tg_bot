<template>
  <n-modal
    :show="show"
    preset="card"
    title="Пакетное добавление"
    @update:show="$emit('update:show', $event)"
  >
    <n-space vertical size="small">
      <n-input
        :value="text"
        type="textarea"
        placeholder="Каждая строка станет отдельным сообщением"
        @update:value="$emit('update:text', $event)"
      />
      <n-space justify="end">
        <n-button @click="$emit('close')">Отмена</n-button>
        <n-button type="primary" @click="$emit('apply', text)">Добавить</n-button>
      </n-space>
    </n-space>
  </n-modal>
</template>

<script setup lang="ts">
import { NButton, NInput, NModal, NSpace } from 'naive-ui';

defineProps<{
  show: boolean;
  text: string;
}>();

defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'update:text', value: string): void;
  (e: 'close'): void;
  (e: 'apply', value: string): void;
}>();
</script>
