<template>
  <n-card title="Рассылка нового дня">
    <n-space vertical size="large">
      <div class="row">
        <div class="label">Время старта</div>
        <n-time-picker
          v-model:value="timeValue"
          format="HH:mm"
          placeholder="HH:MM"
          class="time-input"
          :disabled="loading"
        />
        <n-button type="primary" :loading="saving" @click="saveTime">Сохранить</n-button>
      </div>
      <n-alert type="info" :bordered="false">
        Отправка идёт в указанное время по часовому поясу пользователя.
      </n-alert>
      <div class="row">
        <n-button strong secondary round type="success" @click="showConfirm = true" class="mx-auto">Начать новый день сейчас</n-button>
        <span v-if="settings?.start_now_requested_at" class="hint">
          Запрос отправлен: {{ formatDate(settings.start_now_requested_at) }}
        </span>
      </div>
    </n-space>
  </n-card>

  <n-modal v-model:show="showConfirm">
    <n-card title="Подтверждение" class="modal" size="small">
      <div class="modal-text">
        Вы уверены, что хотите открыть рассылку сообщений нового дня сейчас для всех пользователей?
      </div>
      <div class="modal-actions">
        <n-button type="error"  @click="showConfirm = false">Отмена</n-button>
        <n-button type="success" :loading="starting" @click="startNow">Подтвердить</n-button>
      </div>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { NAlert, NButton, NCard, NModal, NSpace, NTimePicker } from 'naive-ui';
import { createDiscreteApi } from 'naive-ui';
import { apiGet, apiPost, apiPut } from '../api';
import type { SchedulerSettings } from '../types';

const settings = ref<SchedulerSettings | null>(null);
const timeValue = ref<number | null>(null);
const loading = ref(false);
const saving = ref(false);
const starting = ref(false);
const showConfirm = ref(false);
const { message: messageApi } = createDiscreteApi(['message']);

const formatTime = (value: number) => {
  const date = new Date(value);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const parseTimeValue = (value: string) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [h, m] = value.split(':').map(Number);
  return new Date(1970, 0, 1, h, m, 0, 0).getTime();
};

const loadSettings = async () => {
  loading.value = true;
  try {
    settings.value = await apiGet<SchedulerSettings>('/api/scheduler');
    timeValue.value = parseTimeValue(settings.value.daily_send_time);
  } finally {
    loading.value = false;
  }
};

const saveTime = async () => {
  if (timeValue.value === null) {
    messageApi.error('Введите время в формате HH:MM (например, 12:00).');
    return;
  }
  const next = formatTime(timeValue.value);
  saving.value = true;
  try {
    settings.value = await apiPut<SchedulerSettings>('/api/scheduler', { daily_send_time: next });
    messageApi.success('Время сохранено.');
  } finally {
    saving.value = false;
  }
};

const startNow = async () => {
  starting.value = true;
  try {
    settings.value = await apiPost<SchedulerSettings>('/api/scheduler/start-now', {});
    messageApi.success('Запрос на старт отправлен.');
    showConfirm.value = false;
  } finally {
    starting.value = false;
  }
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ru-RU');
};

onMounted(() => {
  void loadSettings();
});
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.label {
  font-size: 13px;
  color: #6b7280;
  min-width: 110px;
}
.time-input {
  width: 120px;
}
.hint {
  font-size: 12px;
  color: #6b7280;
}
.modal {
  width: min(520px, 90vw);
}
.modal-text {
  font-size: 14px;
  line-height: 1.5;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
</style>
