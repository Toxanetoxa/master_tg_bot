<template>
  <div class="top-bar">
    <div class="title">Bot Admin</div>
    <div class="nav" v-if="me">
      <n-button
        size="small"
        :type="route === 'editor' ? 'primary' : 'default'"
        secondary
        @click="$emit('navigate', 'editor')"
      >
        Редактор
      </n-button>
      <n-button
        size="small"
        :type="route === 'premium-days' ? 'primary' : 'default'"
        secondary
        @click="$emit('navigate', 'premium-days')"
      >
        Премиум дни
      </n-button>
      <n-button
        size="small"
        :type="route === 'users' ? 'primary' : 'default'"
        secondary
        @click="$emit('navigate', 'users')"
      >
        Пользователи
      </n-button>
      <n-button
        size="small"
        :type="route === 'payments' ? 'primary' : 'default'"
        secondary
        @click="$emit('navigate', 'payments')"
      >
        Платежи
      </n-button>
      <n-button
        size="small"
        :type="route === 'scheduler' ? 'primary' : 'default'"
        secondary
        @click="$emit('navigate', 'scheduler')"
      >
        Рассылка
      </n-button>
    </div>
    <div class="user">
      <span class="theme-label">Тема</span>
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
  route: 'editor' | 'premium-days' | 'users' | 'payments' | 'scheduler';
}>();

defineEmits<{
  (e: 'logout'): void;
  (e: 'navigate', route: 'editor' | 'premium-days' | 'users' | 'payments' | 'scheduler'): void;
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
.nav {
  display: flex;
  gap: 8px;
  align-items: center;
}
.user {
  display: flex;
  gap: 12px;
  align-items: center;
}
.theme-label {
  font-size: 12px;
  color: #6b7280;
}
</style>
