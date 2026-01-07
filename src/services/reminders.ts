import { Bot } from 'npm:grammy@1.32.0';
import { Day, Message } from '../types/messages.ts';
import {
  clearReminderByTgUserId,
  getDueReminders,
  markReminderSentByTgUserId,
  setReminderByTgUserId,
} from '../db/repositories.ts';

const REMINDER_DELAY_MS = (() => {
  const raw = Deno.env.get('REMINDER_DELAY_HOURS');
  const hours = raw ? Number(raw) : 12;
  if (!Number.isFinite(hours) || hours <= 0) return 12 * 60 * 60 * 1000;
  return hours * 60 * 60 * 1000;
})();
const DEFAULT_REMINDERS = [
  'Я рядом. Если будет удобно, нажми кнопку — продолжим.',
  'Напоминаю про задание — просто выбери один из вариантов ответа.',
  'Ты на шаге с кнопками. Как будешь готова — нажми, и идём дальше.',
  'Маленькое напоминание: ответь кнопкой, чтобы продолжить.',
];

const pickReminderText = (message: Message) => {
  const custom = message.reminderText?.trim();
  if (custom) return custom;
  const idx = Math.floor(Math.random() * DEFAULT_REMINDERS.length);
  return DEFAULT_REMINDERS[idx];
};

export const scheduleReminder = async (tgUserId: number) => {
  const dueAt = new Date(Date.now() + REMINDER_DELAY_MS);
  await setReminderByTgUserId(tgUserId, dueAt);
};

export const clearReminder = async (tgUserId: number) => {
  await clearReminderByTgUserId(tgUserId);
};

export const processDueReminders = async (bot: Bot, messages: Map<number, Day>) => {
  const due = await getDueReminders(new Date());
  for (const row of due) {
    if (row.status !== 'active') {
      await markReminderSentByTgUserId(row.tg_user_id);
      continue;
    }
    const day = messages.get(row.day);
    const msg = day?.msg.find((m) => m.id === row.message_index);
    if (!msg?.feedback?.buttons?.length) {
      await markReminderSentByTgUserId(row.tg_user_id);
      continue;
    }
    const text = pickReminderText(msg);
    await bot.api.sendMessage(row.tg_user_id, text);
    await markReminderSentByTgUserId(row.tg_user_id);
  }
};
