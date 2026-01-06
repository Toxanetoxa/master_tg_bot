<template>
  <div class="panel-header">
    <n-h3>Дни</n-h3>
    <n-button size="small" @click="$emit('create')">+ День</n-button>
  </div>
  <SearchBar v-model="search" @clear="$emit('clear-search')" />
  <n-list bordered clickable>
    <n-list-item
      v-for="day in days"
      :key="day.id"
      :class="{ active: day.id === selectedDayId }"
      @click="$emit('select', day.id)"
    >
      День {{ day.day_number }}
    </n-list-item>
  </n-list>
</template>

<script setup lang="ts">
import { NButton, NH3, NList, NListItem } from 'naive-ui';
import SearchBar from './SearchBar.vue';
import type { Day } from '../types';

defineProps<{
  days: Day[];
  selectedDayId: number | null;
}>();

defineEmits<{
  (e: 'select', id: number): void;
  (e: 'create'): void;
  (e: 'update:search', value: string): void;
  (e: 'clear-search'): void;
}>();

const search = defineModel<string>('search', { required: true });
</script>

<style scoped>
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.active {
  background: #f2f2f2;
}
</style>
