import { assertEquals } from 'jsr:@std/assert@0.224.0';
import type { Day } from '../src/types/messages.ts';

type BotStub = {
  api: {
    sendMessage: (chatId: number, text: string) => Promise<void>;
  };
};

const setRequiredEnv = () => {
  const keys = [
    'BOT_TOKEN',
    'BOT_MODE',
    'DAILY_SEND_TIME',
    'HYDRATE_STATE',
    'POSTGRES_DB',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_PORT',
    'DATABASE_URL',
    'ADMIN_COOKIE_SECRET',
    'NGROK_AUTHTOKEN',
    'VITE_TG_BOT_USERNAME',
    'BOT_USERNAME',
    'YOOKASSA_SHOP_ID',
    'YOOKASSA_SECRET_KEY',
    'YOOKASSA_WEBHOOK_PORT',
    'YOOKASSA_RETURN_URL',
    'REMINDER_DELAY_HOURS',
  ];
  for (const key of keys) {
    if (!Deno.env.get(key)) Deno.env.set(key, '');
  }
  Deno.env.set('DATABASE_URL', 'postgres://bot:bot@localhost:5432/bot');
};

Deno.test('processDueReminders sends custom reminder text', async () => {
  setRequiredEnv();
  const { processDueReminders } = await import('../src/services/reminders.ts');
  const sent: Array<{ chatId: number; text: string }> = [];
  const bot: BotStub = {
    api: {
      sendMessage: async (chatId: number, text: string) => {
        await Promise.resolve();
        sent.push({ chatId, text });
      },
    },
  };

  const messages = new Map<number, Day>();
  messages.set(1, {
    isPremium: false,
    msg: [
      {
        id: 0,
        message: 'step',
        feedback: { buttons: [{ type: 'positive', text: 'ok' }] },
        reminderText: 'custom reminder',
      },
    ],
  });

  const marked: number[] = [];
  await processDueReminders(bot, messages, {
    getDueRemindersFn: async () => {
      await Promise.resolve();
      return [{
        tg_user_id: 111,
        day: 1,
        message_index: 0,
        status: 'active',
      }];
    },
    markReminderSentByTgUserIdFn: async (id) => {
      await Promise.resolve();
      marked.push(id);
    },
    randomFn: () => 0.5,
  });

  assertEquals(sent, [{ chatId: 111, text: 'custom reminder' }]);
  assertEquals(marked, [111]);
});
