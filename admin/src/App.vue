<template>
  <n-config-provider :theme="theme">
    <n-layout class="app">
      <n-layout-header class="top" bordered>
        <div class="w-full px-4 py-3">
          <HeaderBar :me="me" :route="route" v-model:is-dark="isDark" @logout="logout" @navigate="setRoute" />
        </div>
      </n-layout-header>

      <n-layout-content class="content">
        <template v-if="!me">
          <div class="w-full px-4 py-6">
            <div class="login">
              <LoginCard />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="w-full px-4 pb-10">
            <div v-if="route === 'editor'" class="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_6fr_2fr]">
              <n-layout-sider width="260" bordered content-style="padding: 12px;">
                <DayList
                  v-model:search="daySearch"
                  :days="filteredDays"
                  :selected-day-id="selectedDayId"
                  @select="selectDay"
                  @create="createDay"
                  @clear-search="daySearch = ''"
                />
              </n-layout-sider>

              <n-layout-content class="main" content-style="padding: 12px;">
                <DayEditor
                  :day="selectedDay"
                  @save="saveDay"
                  @delete="deleteDay"
                  @create-message="createMessage"
                  @bulk-open="showBulk = true"
                >
                  <div class="mb-3">
                    <SearchBar v-model="messageSearch" @clear="messageSearch = ''" />
                  </div>
                  <div class="max-h-[70vh] overflow-y-auto pr-1 pb-[100px]">
                    <MessageList
                      :messages="filteredMessages"
                      :selected-message-id="selectedMessageId"
                      :draggable="messageSearch.length === 0"
                      :feedback-ids="messageIdsWithFeedback"
                      @select="selectMessage"
                      @save="saveMessage"
                      @delete="deleteMessage"
                      @reorder="reorderMessages"
                    />
                  </div>
                </DayEditor>
              </n-layout-content>

              <n-layout-sider width="500" bordered content-style="padding: 12px;">
                <FeedbackPanel
                  :selected-message-id="selectedMessageId"
                  :buttons="feedbackButtons"
                  :messages="feedbackMessages"
                  :type-options="feedbackTypeOptions"
                  @refresh="loadFeedback"
                  @add-button="addButton"
                  @save-button="saveButton"
                  @delete-button="deleteButton"
                  @add-message="addFeedbackMessage"
                  @save-message="saveFeedbackMessage"
                  @delete-message="deleteFeedbackMessage"
                />
              </n-layout-sider>
            </div>
            <div v-else class="max-w-[900px]">
              <PremiumDaysPage v-if="route === 'premium-days'" :days="days" @toggle-day-premium="toggleDayPremium" />
              <UsersPage
                v-else
                :users="users"
                :selected-user-id="selectedUserId"
                v-model:search="userSearch"
                @select="selectUser"
              />
            </div>
          </div>
        </template>
      </n-layout-content>
    </n-layout>
  </n-config-provider>

  <BulkModal v-model:show="showBulk" v-model:text="bulkText" @close="showBulk = false" @apply="applyBulk" />
</template>

<script setup lang="ts">
import { NConfigProvider, NLayout, NLayoutContent, NLayoutHeader, NLayoutSider, darkTheme } from 'naive-ui';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createDiscreteApi } from 'naive-ui';
import { useLocalStorage } from '@vueuse/core';
import { apiDelete, apiGet, apiPost, apiPut } from './api';
import type {
  AdminUser,
  AppUser,
  Day,
  FeedbackButton,
  FeedbackMessage,
  FeedbackResponse,
  Message,
} from './types';
import HeaderBar from './components/HeaderBar.vue';
import LoginCard from './components/LoginCard.vue';
import DayList from './components/DayList.vue';
import DayEditor from './components/DayEditor.vue';
import MessageList from './components/MessageList.vue';
import FeedbackPanel from './components/FeedbackPanel.vue';
import BulkModal from './components/BulkModal.vue';
import SearchBar from './components/SearchBar.vue';
import PremiumDaysPage from './components/PremiumDaysPage.vue';
import UsersPage from './components/UsersPage.vue';

const me = ref<AdminUser | null>(null);
const days = ref<Day[]>([]);
const selectedDayId = ref<number | null>(null);
const selectedDay = ref<Day | null>(null);
const messages = ref<Message[]>([]);
const selectedMessageId = ref<number | null>(null);
const selectedMessage = ref<Message | null>(null);
const feedbackButtons = ref<FeedbackButton[]>([]);
const feedbackMessages = ref<FeedbackMessage[]>([]);
const feedbackMessageIds = ref<number[]>([]);
const users = ref<AppUser[]>([]);
const selectedUserId = ref<number | null>(null);
const messageIdsWithFeedback = computed(() => {
  return new Set(feedbackMessageIds.value);
});
const feedbackTypeOptions = [
  { label: 'positive', value: 'positive' },
  { label: 'neutral', value: 'neutral' },
  { label: 'negative', value: 'negative' },
];
const showBulk = ref(false);
const bulkText = ref('');
const isDark = useLocalStorage('admin_theme_dark', false);
const theme = computed(() => (isDark.value ? darkTheme : null));
const daySearch = ref('');
const messageSearch = ref('');
const userSearch = ref('');
const route = ref<'editor' | 'premium-days' | 'users'>('editor');

const sortMessages = () => {
  messages.value = [...messages.value].sort((a, b) => a.step_index - b.step_index);
};

const hasDuplicateStep = (stepIndex: number, excludeId?: number) => {
  return messages.value.some((m) => m.step_index === stepIndex && m.id !== excludeId);
};

const filteredDays = computed(() => {
  const query = daySearch.value.trim().toLowerCase();
  if (!query) return days.value;
  return days.value.filter((day) => {
    const num = String(day.day_number);
    const reminders = day.reminders ?? '';
    return num.includes(query) || reminders.toLowerCase().includes(query);
  });
});

const filteredMessages = computed(() => {
  const query = messageSearch.value.trim().toLowerCase();
  if (!query) return messages.value;
  return messages.value.filter((msg) => msg.message_text.toLowerCase().includes(query));
});

const loadMe = async () => {
  try {
    me.value = await apiGet<AdminUser>('/auth/me');
  } catch {
    me.value = null;
  }
};

const syncRouteFromHash = () => {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'premium-days') {
    route.value = 'premium-days';
  } else if (hash === 'users') {
    route.value = 'users';
  } else {
    route.value = 'editor';
  }
};

const setRoute = (next: 'editor' | 'premium-days' | 'users') => {
  route.value = next;
  if (next === 'premium-days') {
    window.location.hash = '#premium-days';
  } else if (next === 'users') {
    window.location.hash = '#users';
  } else {
    window.location.hash = '';
  }
};

const loadDays = async () => {
  days.value = await apiGet<Day[]>('/api/days');
};

const loadUsers = async () => {
  users.value = await apiGet<AppUser[]>('/api/users');
};

const selectUser = (id: number) => {
  selectedUserId.value = id;
};

const selectDay = async (id: number) => {
  selectedDayId.value = id;
  selectedMessageId.value = null;
  selectedMessage.value = null;
  feedbackButtons.value = [];
  feedbackMessages.value = [];
  feedbackMessageIds.value = [];
  selectedDay.value = days.value.find((d) => d.id === id) ?? null;
  messages.value = await apiGet<Message[]>(`/api/days/${id}/messages`);
  feedbackMessageIds.value = await apiGet<number[]>(`/api/days/${id}/feedback-buttons`);
  sortMessages();
};

const createDay = async () => {
  const day = await apiPost<Day>('/api/days', { day_number: 0, is_premium: false, reminders: '' });
  days.value.push(day);
};

const saveDay = async () => {
  if (!selectedDay.value) return;
  const dayId = selectedDay.value.id;
  const updated = await apiPut<Day>(`/api/days/${dayId}`, selectedDay.value);
  const idx = days.value.findIndex((d) => d.id === updated.id);
  if (idx >= 0) days.value[idx] = updated;
};

const toggleDayPremium = async (payload: { id: number; isPremium: boolean }) => {
  const idx = days.value.findIndex((d) => d.id === payload.id);
  if (idx < 0) return;
  const updated = await apiPut<Day>(`/api/days/${payload.id}`, {
    ...days.value[idx],
    is_premium: payload.isPremium,
  });
  days.value[idx] = updated;
  if (selectedDay.value?.id === updated.id) {
    selectedDay.value = updated;
  }
};

const deleteDay = async () => {
  if (!selectedDay.value) return;
  const dayId = selectedDay.value.id;
  await apiDelete<{ ok: boolean }>(`/api/days/${dayId}`);
  days.value = days.value.filter((d) => d.id !== dayId);
  selectedDay.value = null;
  messages.value = [];
};

const createMessage = async () => {
  if (!selectedDay.value) return;
  const dayId = selectedDay.value.id;
  const nextStep = messages.value.length
    ? Math.max(...messages.value.map((m) => m.step_index)) + 1
    : 0;
  const msg = await apiPost<Message>(`/api/days/${dayId}/messages`, {
    step_index: nextStep,
    message_text: '',
  });
  messages.value.push(msg);
  sortMessages();
};

const applyBulk = async (text: string) => {
  if (!selectedDay.value) return;
  const dayId = selectedDay.value.id;
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return;
  let nextStep = messages.value.length
    ? Math.max(...messages.value.map((m) => m.step_index)) + 1
    : 0;
  for (const line of lines) {
    const msg = await apiPost<Message>(`/api/days/${dayId}/messages`, {
      step_index: nextStep,
      message_text: line,
    });
    messages.value.push(msg);
    nextStep += 1;
  }
  sortMessages();
  bulkText.value = '';
  showBulk.value = false;
};

const { message: messageApi } = createDiscreteApi(['message']);

const saveMessage = async (msg: Message) => {
  if (hasDuplicateStep(msg.step_index, msg.id)) return;
  try {
    const updated = await apiPut<Message>(`/api/messages/${msg.id}`, msg);
    const idx = messages.value.findIndex((m) => m.id === updated.id);
    if (idx >= 0) messages.value[idx] = updated;
    sortMessages();
  } catch (err) {
    if (err instanceof Error && err.message.includes('409')) {
      messageApi.error('Шаг с таким номером уже существует в этом дне.');
      return;
    }
    throw err;
  }
};

const reorderMessages = async (ids: number[]) => {
  const ordered = ids
    .map((id) => messages.value.find((m) => m.id === id))
    .filter((m): m is Message => Boolean(m));
  if (!ordered.length) return;

  for (let i = 0; i < ordered.length; i += 1) {
    ordered[i].step_index = -10000 - i;
    await saveMessage(ordered[i]);
  }
  for (let i = 0; i < ordered.length; i += 1) {
    ordered[i].step_index = i;
    await saveMessage(ordered[i]);
  }
  sortMessages();
};

const deleteMessage = async (id: number) => {
  await apiDelete<{ ok: boolean }>(`/api/messages/${id}`);
  messages.value = messages.value.filter((m) => m.id !== id);
  if (selectedMessageId.value === id) {
    selectedMessageId.value = null;
    selectedMessage.value = null;
  }
  sortMessages();
};

const selectMessage = async (id: number) => {
  selectedMessageId.value = id;
  selectedMessage.value = messages.value.find((m) => m.id === id) ?? null;
  await loadFeedback();
};

const loadFeedback = async () => {
  if (!selectedMessageId.value) return;
  const data = await apiGet<FeedbackResponse>(`/api/messages/${selectedMessageId.value}/feedback`);
  feedbackButtons.value = data.buttons;
  feedbackMessages.value = data.messages;
};

const addButton = async () => {
  if (!selectedMessageId.value) return;
  const btn = await apiPost<FeedbackButton>(`/api/messages/${selectedMessageId.value}/feedback/buttons`, {
    type: 'positive',
    text: '',
  });
  feedbackButtons.value.push(btn);
  if (selectedDayId.value) {
    feedbackMessageIds.value = await apiGet<number[]>(`/api/days/${selectedDayId.value}/feedback-buttons`);
  }
};

const saveButton = async (btn: FeedbackButton) => {
  const updated = await apiPut<FeedbackButton>(`/api/feedback/buttons/${btn.id}`, btn);
  const idx = feedbackButtons.value.findIndex((b) => b.id === updated.id);
  if (idx >= 0) feedbackButtons.value[idx] = updated;
};

const deleteButton = async (id: number) => {
  await apiDelete<{ ok: boolean }>(`/api/feedback/buttons/${id}`);
  feedbackButtons.value = feedbackButtons.value.filter((b) => b.id !== id);
  if (selectedDayId.value) {
    feedbackMessageIds.value = await apiGet<number[]>(`/api/days/${selectedDayId.value}/feedback-buttons`);
  }
};

const addFeedbackMessage = async () => {
  if (!selectedMessageId.value) return;
  const msg = await apiPost<FeedbackMessage>(`/api/messages/${selectedMessageId.value}/feedback/messages`, {
    type: 'positive',
    message_text: '',
  });
  feedbackMessages.value.push(msg);
};

const saveFeedbackMessage = async (msg: FeedbackMessage) => {
  const updated = await apiPut<FeedbackMessage>(`/api/feedback/messages/${msg.id}`, msg);
  const idx = feedbackMessages.value.findIndex((m) => m.id === updated.id);
  if (idx >= 0) feedbackMessages.value[idx] = updated;
};

const deleteFeedbackMessage = async (id: number) => {
  await apiDelete<{ ok: boolean }>(`/api/feedback/messages/${id}`);
  feedbackMessages.value = feedbackMessages.value.filter((m) => m.id !== id);
};

const logout = async () => {
  await apiPost<{ ok: boolean }>('/auth/logout', {});
  me.value = null;
};

const mountTelegramLogin = () => {
  const el = document.getElementById('tg-login');
  if (!el) return;
  el.innerHTML = '';
  const botUsername = import.meta.env.VITE_TG_BOT_USERNAME;
  if (!botUsername) {
    alert('VITE_TG_BOT_USERNAME не задан. Проверь admin/.env и перезапусти dev-сервер.');
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.setAttribute('data-telegram-login', botUsername);
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-userpic', 'false');
  script.setAttribute('data-lang', 'ru');
  script.setAttribute('data-request-access', 'write');
  script.setAttribute('data-onauth', 'onTelegramAuth(user)');
  el.appendChild(script);
};

(window as any).onTelegramAuth = async (user: Record<string, string | number>) => {
  try {
    await apiPost<{ ok: boolean }>('/auth/telegram', user);
    await loadMe();
    if (me.value) {
      await loadDays();
      if (route.value === 'users') {
        await loadUsers();
      }
    }
  } catch (err) {
    console.error(err);
    alert('Доступ запрещен');
  }
};

onMounted(async () => {
  document.documentElement.classList.toggle('dark', isDark.value);
  syncRouteFromHash();
  window.addEventListener('hashchange', syncRouteFromHash);
  await loadMe();
  if (me.value) {
    await loadDays();
    if (route.value === 'users') {
      await loadUsers();
    }
  } else {
    mountTelegramLogin();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncRouteFromHash);
});

watch(isDark, (value) => {
  document.documentElement.classList.toggle('dark', value);
});

watch(route, async (next) => {
  if (!me.value) return;
  if (next === 'users') {
    await loadUsers();
  }
});
</script>

<style scoped>
.app {
  min-height: 100vh;
}
.login {
  max-width: 420px;
}
</style>
