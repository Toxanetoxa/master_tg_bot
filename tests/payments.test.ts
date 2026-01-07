import { assertEquals, assertRejects } from 'jsr:@std/assert@0.224.0';
import { createPaymentLink, handleYooKassaWebhook } from '../src/services/payments.ts';
import type { YooKassaWebhookEvent } from '../src/types/payments.ts';

type BotStub = {
  api: {
    sendMessage: (chatId: number, text: string) => Promise<void>;
  };
};

type UserStub = {
  id: number;
  tgUserId: number;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const buildFetchResponse = (body: unknown) => {
  return new Response(JSON.stringify(body), { status: 200 });
};

Deno.test('createPaymentLink returns confirmation url and records payment', async () => {
  let recorded: { paymentId: string; status: string } | null = null;
  const url = await createPaymentLink(123, {
    env: { shopId: 'shop', secretKey: 'secret', returnUrl: 'https://example.com/return' },
    fetchFn: async () => {
      await Promise.resolve();
      return buildFetchResponse({
        id: 'pay_1',
        status: 'pending',
        confirmation: { confirmation_url: 'https://pay.example' },
      });
    },
    getOrCreateUserFn: async () => {
      await Promise.resolve();
      return ({
        id: 77,
        tgUserId: 123,
        username: null,
        firstName: null,
        lastName: null,
        role: 'user',
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }) as UserStub;
    },
    createPaymentForUserFn: async (_userId, data) => {
      await Promise.resolve();
      recorded = { paymentId: data.paymentId, status: data.status };
      return { id: 1 } as { id: number };
    },
  });

  assertEquals(url, 'https://pay.example');
  assertEquals(recorded, { paymentId: 'pay_1', status: 'pending' });
});

Deno.test('createPaymentLink throws when env is missing', async () => {
  await assertRejects(
    () => createPaymentLink(123, { env: { shopId: '', secretKey: '', returnUrl: undefined } }),
    Error,
  );
});

Deno.test('handleYooKassaWebhook sends success message and resumes blocked day', async () => {
  const sent: Array<{ chatId: number; text: string }> = [];
  const started: number[] = [];
  const bot: BotStub = {
    api: {
      sendMessage: async (chatId: number, text: string) => {
        await Promise.resolve();
        sent.push({ chatId, text });
      },
    },
  };

  const payload: YooKassaWebhookEvent = {
    type: 'notification',
    event: 'payment.succeeded',
    object: {
      id: 'pay_2',
      status: 'succeeded',
      amount: { value: '340.00', currency: 'RUB' },
    },
  };

  await handleYooKassaWebhook(
    bot,
    payload,
    async (chatId, day) => {
      started.push(day);
      await Promise.resolve(chatId);
    },
    {
      setPaymentStatusByPaymentIdFn: async () => {
        await Promise.resolve();
        return { id: 10, user_id: 5 };
      },
      createSubscriptionForPaymentFn: async () => {
        await Promise.resolve();
        return { id: 20 } as { id: number };
      },
      getTgUserIdByUserIdFn: async () => {
        await Promise.resolve();
        return 555;
      },
      getUserStateSimpleByTgUserIdFn: async () => {
        await Promise.resolve();
        return { day: 7, messageIndex: 0, status: 'blocked' };
      },
    },
  );

  assertEquals(sent.length, 1);
  assertEquals(sent[0].chatId, 555);
  assertEquals(started, [7]);
});
