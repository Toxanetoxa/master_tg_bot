<template>
  <n-space vertical size="small">
    <n-card title="Платежи и подписки">
      <n-space justify="space-between" align="center" class="summary">
        <div>
          <div class="label">Подписок (активные)</div>
          <div class="value">{{ analytics.totals.subscriptions }}</div>
        </div>
        <div>
          <div class="label">Выручка</div>
          <div class="value">{{ formatAmount(analytics.totals.revenue) }}</div>
        </div>
      </n-space>
    </n-card>

    <div class="charts">
      <n-card title="Подписки по месяцам">
        <canvas ref="subsCanvas" height="160"></canvas>
      </n-card>
      <n-card title="Выручка по месяцам">
        <canvas ref="revenueCanvas" height="160"></canvas>
      </n-card>
    </div>

    <n-card title="Прогресс пользователей по дням">
      <canvas ref="progressCanvas" height="200"></canvas>
    </n-card>

    <n-card title="Последние платежи">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Пользователь</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in payments" :key="row.id">
              <td>{{ row.payment_id }}</td>
              <td>{{ userLabel(row) }}</td>
              <td>{{ formatAmount(row.amount, row.currency) }}</td>
              <td>{{ row.status }}</td>
              <td>{{ formatDate(row.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </n-card>
  </n-space>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { NCard, NSpace } from 'naive-ui';
import Chart from 'chart.js/auto';
import type { AnalyticsResponse, PaymentRow } from '../types';

const props = defineProps<{
  analytics: AnalyticsResponse;
  payments: PaymentRow[];
}>();

const subsCanvas = ref<HTMLCanvasElement | null>(null);
const revenueCanvas = ref<HTMLCanvasElement | null>(null);
const progressCanvas = ref<HTMLCanvasElement | null>(null);

const charts = {
  subs: null as Chart | null,
  revenue: null as Chart | null,
  progress: null as Chart | null,
};

const buildMonthSeries = <T extends { month: string }>(
  data: T[],
  valueKey: keyof T,
) => {
  const labels = data.map((d) => d.month);
  const values = data.map((d) => Number(d[valueKey] ?? 0));
  return { labels, values };
};

const buildProgressSeries = () => {
  const labels = props.analytics.dayProgress.map((d) => `День ${d.day}`);
  const values = props.analytics.dayProgress.map((d) => d.count);
  return { labels, values };
};

const renderCharts = () => {
  const subs = buildMonthSeries(props.analytics.monthlySubscriptions, 'count');
  const revenue = buildMonthSeries(props.analytics.monthlyRevenue, 'total');
  const progress = buildProgressSeries();

  charts.subs?.destroy();
  charts.revenue?.destroy();
  charts.progress?.destroy();

  if (subsCanvas.value) {
    charts.subs = new Chart(subsCanvas.value, {
      type: 'bar',
      data: {
        labels: subs.labels,
        datasets: [{ label: 'Подписки', data: subs.values, backgroundColor: '#2563eb' }],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }

  if (revenueCanvas.value) {
    charts.revenue = new Chart(revenueCanvas.value, {
      type: 'line',
      data: {
        labels: revenue.labels,
        datasets: [{ label: 'Выручка', data: revenue.values, borderColor: '#16a34a' }],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }

  if (progressCanvas.value) {
    charts.progress = new Chart(progressCanvas.value, {
      type: 'bar',
      data: {
        labels: progress.labels,
        datasets: [{ label: 'Пользователей', data: progress.values, backgroundColor: '#0f766e' }],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }
};

onMounted(renderCharts);
onBeforeUnmount(() => {
  charts.subs?.destroy();
  charts.revenue?.destroy();
  charts.progress?.destroy();
});

watch(
  () => props.analytics,
  () => renderCharts(),
  { deep: true },
);

const userLabel = (row: PaymentRow) => {
  const full = [row.first_name, row.last_name].filter(Boolean).join(' ');
  return full || row.username || (row.tg_user_id ? `tg:${row.tg_user_id}` : '—');
};

const formatAmount = (value: number, currency = 'RUB') => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ru-RU');
};
</script>

<style scoped>
.summary {
  gap: 16px;
}
.label {
  font-size: 12px;
  color: #6b7280;
}
.value {
  font-size: 22px;
  font-weight: 600;
}
.charts {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
.table-wrap {
  overflow-x: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.table th,
.table td {
  padding: 8px 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}
</style>
