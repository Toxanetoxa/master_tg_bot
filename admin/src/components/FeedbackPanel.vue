<template>
  <n-card title="Feedback">
    <template #header-extra>
      <n-button size="small" :disabled="!selectedMessageId" @click="$emit('refresh')">Обновить</n-button>
    </template>

    <div v-if="!selectedMessageId" class="empty">
      Выберите сообщение, чтобы редактировать кнопки и ответы.
    </div>
    <template v-else>
      <n-h4>Кнопки</n-h4>
      <n-space vertical size="small">
        <n-button size="small" @click="$emit('add-button')">+ Кнопка</n-button>
        <n-card v-for="btn in buttons" :key="btn.id" size="small">
          <n-space vertical size="small">
            <n-select v-model:value="btn.type" :options="typeOptions" placeholder="type" />
          <n-input v-model:value="btn.text" placeholder="text" class="rounded-lg" />
            <n-space justify="end" size="small">
              <n-button size="small" @click="$emit('save-button', btn)">Сохранить</n-button>
              <n-button size="small" type="error" @click="$emit('delete-button', btn.id)">Удалить</n-button>
            </n-space>
          </n-space>
        </n-card>
      </n-space>

      <n-divider />

      <n-h4>Ответы</n-h4>
      <n-space vertical size="small">
        <n-button size="small" @click="$emit('add-message')">+ Ответ</n-button>
        <n-card v-for="msg in messages" :key="msg.id" size="small">
          <n-space vertical size="small">
            <n-select v-model:value="msg.type" :options="typeOptions" placeholder="type" />
          <n-input v-model:value="msg.message_text" type="textarea" class="rounded-lg" />
            <n-space justify="end" size="small">
              <n-button size="small" @click="$emit('save-message', msg)">Сохранить</n-button>
              <n-button size="small" type="error" @click="$emit('delete-message', msg.id)">Удалить</n-button>
            </n-space>
          </n-space>
        </n-card>
      </n-space>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { NButton, NCard, NDivider, NH4, NInput, NSelect, NSpace } from 'naive-ui';
import type { FeedbackButton, FeedbackMessage } from '../types';

defineProps<{
  selectedMessageId: number | null;
  buttons: FeedbackButton[];
  messages: FeedbackMessage[];
  typeOptions: { label: string; value: string }[];
}>();

defineEmits<{
  (e: 'refresh'): void;
  (e: 'add-button'): void;
  (e: 'save-button', btn: FeedbackButton): void;
  (e: 'delete-button', id: number): void;
  (e: 'add-message'): void;
  (e: 'save-message', msg: FeedbackMessage): void;
  (e: 'delete-message', id: number): void;
}>();
</script>

<style scoped>
.empty {
  padding: 12px;
  color: #6b7280;
  font-size: 13px;
}
.n-input__input-el,
.n-input__textarea-el {
  padding: 10px 12px;
}
</style>
