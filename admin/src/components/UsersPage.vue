<template>
  <n-card title="Пользователи">
    <n-space vertical size="small">
      <n-input
        v-model:value="searchModel"
        placeholder="Поиск по username/first_name/last_name"
        clearable
      />
      <div class="layout">
        <div class="list">
          <n-card v-if="!filteredUsers.length" size="small" class="empty">
            Нет пользователей для отображения.
          </n-card>
          <n-card
            v-for="user in filteredUsers"
            :key="user.id"
            size="small"
            :class="['list-item', selectedUserId === user.id ? 'selected' : '']"
            @click="$emit('select', user.id)"
          >
            <div class="row">
              <div class="name">
                {{ displayName(user) }}
                <span v-if="user.username" class="username">@{{ user.username }}</span>
              </div>
              <n-tag size="small" :type="user.role === 'admin' ? 'error' : 'info'">{{ user.role }}</n-tag>
            </div>
          </n-card>
        </div>

        <n-card size="small" class="details">
          <template v-if="selectedUser">
            <div class="detail-title">{{ displayName(selectedUser) }}</div>
            <div class="detail-row">
              <span class="label">Username</span>
              <span class="value">{{ selectedUser.username || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Telegram ID</span>
              <span class="value">{{ selectedUser.tg_user_id }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Role</span>
              <span class="value">{{ selectedUser.role }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Created</span>
              <span class="value">{{ formatDate(selectedUser.created_at) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Last seen</span>
              <span class="value">{{ formatDate(selectedUser.last_seen_at) }}</span>
            </div>
          </template>
          <div v-else class="empty">
            Выберите пользователя из списка.
          </div>
        </n-card>
      </div>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NCard, NInput, NSpace, NTag } from 'naive-ui';
import type { AppUser } from '../types';

const props = defineProps<{
  users: AppUser[];
  selectedUserId: number | null;
  search: string;
}>();

const emit = defineEmits<{
  (e: 'select', id: number): void;
  (e: 'update:search', value: string): void;
}>();

const searchModel = computed({
  get: () => props.search,
  set: (value: string) => {
    const next = value ?? '';
    if (next !== props.search) {
      emit('update:search', next);
    }
  },
});

const filteredUsers = computed(() => {
  const query = props.search.trim().toLowerCase();
  if (!query) return props.users;
  return props.users.filter((user) => {
    const username = user.username ?? '';
    const first = user.first_name ?? '';
    const last = user.last_name ?? '';
    const haystack = `${username} ${first} ${last}`.toLowerCase();
    return haystack.includes(query);
  });
});

const selectedUser = computed(() => {
  if (!props.selectedUserId) return null;
  return props.users.find((u) => u.id === props.selectedUserId) ?? null;
});

const displayName = (user: AppUser) => {
  const full = [user.first_name, user.last_name].filter(Boolean).join(' ');
  return full || user.username || `User #${user.id}`;
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ru-RU');
};
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(280px, 360px);
  gap: 12px;
}
.list {
  display: grid;
  gap: 8px;
}
.list-item {
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.list-item.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6 inset;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.name {
  font-size: 13px;
  font-weight: 600;
}
.username {
  margin-left: 6px;
  font-size: 12px;
  color: #6b7280;
}
.details {
  min-height: 220px;
}
.detail-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0;
  font-size: 13px;
}
.label {
  color: #6b7280;
}
.value {
  text-align: right;
}
.empty {
  padding: 12px;
  color: #6b7280;
  font-size: 13px;
}
@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .details {
    min-height: auto;
  }
}
</style>
