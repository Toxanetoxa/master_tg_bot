<template>
  <n-card v-if="day" :title="`День ${day.day_number}`" segmented>
    <template #header-extra>
      <n-space>
        <n-button size="small" @click="$emit('save')">Сохранить</n-button>
        <n-button size="small" type="error" @click="$emit('delete')">Удалить</n-button>
      </n-space>
    </template>

    <n-space vertical size="small">
      <n-input-number v-model:value="day.day_number" />
      <n-checkbox v-model:checked="day.is_premium">Premium</n-checkbox>
      <n-input v-model:value="day.reminders" type="textarea" placeholder="Reminders" />
    </n-space>

    <n-divider />

    <div class="panel-header">
      <n-h3>Сообщения</n-h3>
      <n-space>
        <n-button size="small" @click="$emit('create-message')">+ Сообщение</n-button>
        <n-button size="small" tertiary @click="$emit('bulk-open')">Пакетно</n-button>
      </n-space>
    </div>
    <slot />
  </n-card>
</template>

<script setup lang="ts">
import { NButton, NCard, NCheckbox, NDivider, NH3, NInput, NInputNumber, NSpace } from 'naive-ui';
import type { Day } from '../types';

defineProps<{
  day: Day | null;
}>();

defineEmits<{
  (e: 'save'): void;
  (e: 'delete'): void;
  (e: 'create-message'): void;
  (e: 'bulk-open'): void;
}>();
</script>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
</style>
