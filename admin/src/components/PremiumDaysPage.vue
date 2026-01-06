<template>
  <n-card title="Премиум дни">
    <n-space vertical size="small">
      <div v-if="!sortedDays.length" class="empty">
        Нет дней для настройки.
      </div>
      <n-card v-for="day in sortedDays" :key="day.id" size="small">
        <n-space align="center" justify="space-between">
          <div class="day-title">День {{ day.day_number }}</div>
          <n-space align="center" size="small">
            <span class="day-label">{{ day.is_premium ? 'Premium' : 'Free' }}</span>
            <n-switch
              :value="day.is_premium"
              @update:value="(value) => $emit('toggle-day-premium', { id: day.id, isPremium: value })"
            />
          </n-space>
        </n-space>
      </n-card>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NCard, NSpace, NSwitch } from 'naive-ui';
import type { Day } from '../types';

const props = defineProps<{
  days: Day[];
}>();

defineEmits<{
  (e: 'toggle-day-premium', payload: { id: number; isPremium: boolean }): void;
}>();

const sortedDays = computed(() => {
  return [...props.days].sort((a, b) => a.day_number - b.day_number);
});
</script>

<style scoped>
.empty {
  padding: 12px;
  color: #6b7280;
  font-size: 13px;
}
.day-title {
  font-size: 13px;
  font-weight: 600;
}
.day-label {
  font-size: 12px;
  color: #6b7280;
}
</style>
