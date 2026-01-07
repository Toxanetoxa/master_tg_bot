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

type BotLike = {
  api: {
    sendMessage: (chatId: number, text: string) => Promise<void>;
  };
};

const pickReminderText = (message: Message, randomFn: () => number) => {
  const custom = message.reminderText?.trim();
  if (custom) return custom;
  const idx = Math.floor(randomFn() * DEFAULT_REMINDERS.length);
  return DEFAULT_REMINDERS[idx];
};

export const scheduleReminder = async (tgUserId: number, deps?: {
  setReminderByTgUserIdFn?: typeof setReminderByTgUserId;
}) => {
  const setReminderByTgUserIdFn = deps?.setReminderByTgUserIdFn ?? setReminderByTgUserId;
  const dueAt = new Date(Date.now() + REMINDER_DELAY_MS);
  await setReminderByTgUserIdFn(tgUserId, dueAt);
};

export const clearReminder = async (tgUserId: number, deps?: {
  clearReminderByTgUserIdFn?: typeof clearReminderByTgUserId;
}) => {
  const clearReminderByTgUserIdFn = deps?.clearReminderByTgUserIdFn ?? clearReminderByTgUserId;
  await clearReminderByTgUserIdFn(tgUserId);
};

export const processDueReminders = async (
  bot: BotLike,
  messages: Map<number, Day>,
  deps?: {
    getDueRemindersFn?: (now: Date) => Promise<
      Array<{
        tg_user_id: number;
        day: number;
        message_index: number;
        status: string;
      }>
    >;
    markReminderSentByTgUserIdFn?: typeof markReminderSentByTgUserId;
    randomFn?: () => number;
  },
) => {
  const getDueRemindersFn = deps?.getDueRemindersFn ?? getDueReminders;
  const markReminderSentByTgUserIdFn = deps?.markReminderSentByTgUserIdFn ??
    markReminderSentByTgUserId;
  const randomFn = deps?.randomFn ?? Math.random;
  const due = await getDueRemindersFn(new Date());
  for (const row of due) {
    if (row.status !== 'active') {
      await markReminderSentByTgUserIdFn(row.tg_user_id);
      continue;
    }
    const day = messages.get(row.day);
    const msg = day?.msg.find((m) => m.id === row.message_index);
    if (!msg?.feedback?.buttons?.length) {
      await markReminderSentByTgUserIdFn(row.tg_user_id);
      continue;
    }
    const text = pickReminderText(msg, randomFn);
    await bot.api.sendMessage(row.tg_user_id, text);
    await markReminderSentByTgUserIdFn(row.tg_user_id);
  }
};
