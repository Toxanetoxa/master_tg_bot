<template>
  <Draggable
    :list="internalList"
    item-key="id"
    :disabled="draggable === false"
    handle=".drag-handle"
    ghost-class="drag-ghost"
    chosen-class="drag-chosen"
    drag-class="drag-active"
    @end="onEnd"
  >
    <template #item="{ element }">
      <n-card
        size="small"
        :class="{ active: element.id === selectedMessageId }"
        @click="$emit('select', element.id)"
      >
      <n-space align="center" justify="space-between" size="small" class="mb-2 w-full">
        <div class="drag-handle">⠿</div>
        <n-tag v-if="feedbackIds?.has(element.id)" size="small" type="info">buttons</n-tag>
        </n-space>
        <n-space align="center" justify="space-between" size="small" class="mb-2 w-full">
          <span class="mr-1">Шаг</span>
          <n-input-number v-model:value="element.step_index" size="small" class="min-w-[96px]" />
        </n-space>
      <n-input
        v-model:value="element.message_text"
        type="textarea"
        :autosize="{ minRows: 6 }"
        class="rounded-lg"
      />
        <n-space justify="end" size="small" class="card-actions">
          <n-button size="small" @click.stop="$emit('save', element)">Сохранить</n-button>
          <n-button size="small" type="error" @click.stop="$emit('delete', element.id)">Удалить</n-button>
        </n-space>
      </n-card>
    </template>
  </Draggable>
</template>

<script setup lang="ts">
import Draggable from 'vuedraggable';
import { NButton, NCard, NInput, NInputNumber, NSpace, NTag } from 'naive-ui';
import { ref, watch } from 'vue';
import type { Message } from '../types';

const props = defineProps<{
  messages: Message[];
  selectedMessageId: number | null;
  draggable?: boolean;
  feedbackIds?: Set<number>;
}>();

const emit = defineEmits<{
  (e: 'select', id: number): void;
  (e: 'save', msg: Message): void;
  (e: 'delete', id: number): void;
  (e: 'reorder', ids: number[]): void;
}>();

const internalList = ref<Message[]>([]);

watch(
  () => props.messages,
  (value) => {
    internalList.value = [...value];
  },
  { immediate: true },
);

const onEnd = () => {
  const currentOrder = props.messages.map((m) => m.id);
  const nextOrder = internalList.value.map((m) => m.id);
  const isSame = currentOrder.length === nextOrder.length &&
    currentOrder.every((id, idx) => id === nextOrder[idx]);
  if (isSame) return;
  emit('reorder', nextOrder);
};
</script>

<style scoped>
.card-actions {
  margin-top: 8px;
}
.active {
  background: #f2f2f2;
}
.drag-handle {
  cursor: grab;
  user-select: none;
  font-size: 30px;
  color: #777;
  margin-bottom: 6px;
}
.drag-ghost {
  background: rgba(99, 102, 241, 0.08);
  border: 2px dashed rgba(99, 102, 241, 0.6);
  min-height: 140px;
  position: relative;
}
.drag-ghost * {
  visibility: hidden;
}
.drag-ghost::before {
  content: 'Отпустите, чтобы вставить здесь';
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #6366f1;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.drag-chosen {
  outline: 2px dashed #999;
  outline-offset: 2px;
}
.drag-active {
  cursor: grabbing;
}
.n-input__textarea-el {
  padding: 10px 12px;
}
</style>
