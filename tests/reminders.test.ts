import { assertEquals } from 'jsr:@std/assert@0.224.0';
import { processDueReminders } from '../src/services/reminders.ts';
import type { Day } from '../src/types/messages.ts';

type BotStub = {
  api: {
    sendMessage: (chatId: number, text: string) => Promise<void>;
  };
};

Deno.test('processDueReminders sends custom reminder text', async () => {
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
