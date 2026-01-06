<template>
  <div class="top-bar">
    <div class="title">Bot Admin</div>
    <div class="user">
      <n-switch v-model:value="model" size="small" />
      <span v-if="me">@{{ me.username || me.first_name }}</span>
      <n-button v-if="me" size="small" @click="$emit('logout')">Выйти</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NSwitch } from 'naive-ui';
import type { AdminUser } from '../types';

defineProps<{
  me: AdminUser | null;
}>();

defineEmits<{
  (e: 'logout'): void;
}>();

const model = defineModel<boolean>('isDark', { required: true });
</script>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title {
  font-size: 18px;
  font-weight: 600;
}
.user {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
