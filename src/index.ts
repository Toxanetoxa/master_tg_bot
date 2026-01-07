import { Bot, type Context } from 'npm:grammy@1.32.0';
import { serve } from 'jsr:@std/http@0.224.0';
import { loadConfig } from './config.ts';
import { createStateStore } from './types/state.ts';
import { createMessageFlow } from './services/message-flow.ts';
import { createScheduler } from './services/scheduler.ts';
import { getAllUserStates, getOrCreateUser, loadMessageDays } from './db/repositories.ts';
import type { YooKassaWebhookEvent } from './types/payments.ts';
import { handleYooKassaWebhook } from './services/payments.ts';
import { isYooKassaWebhookAuthorized } from './utils/yookassa.ts';
import { processDueReminders } from './services/reminders.ts';

const config = loadConfig();
const bot = new Bot(config.token);
const state = createStateStore();
const messages = await loadMessageDays();

const hydrateState = async () => {
  if (Deno.env.get('HYDRATE_STATE') === 'false') return;
  const rows = await getAllUserStates();
  for (const row of rows) {
    state.set(row.tgUserId, {
      day: row.day,
      messageIndex: row.messageIndex,
      status: row.status,
    });
  }
  if (rows.length) {
    console.info(`Hydrated ${rows.length} user states from DB.`);
  }
};

await hydrateState();

const flow = createMessageFlow({ bot, config, state, messages });
const scheduler = createScheduler({
  config,
  state,
  startDay: flow.startDayNow,
});

const getChatId = (ctx: Context) =>
  ctx.chat?.id ?? ctx.from?.id ?? ctx.callbackQuery?.message?.chat?.id;

const ensureUser = async (ctx: Context) => {
  if (!ctx.from) return null;
  return await getOrCreateUser(ctx.from.id, {
    username: ctx.from.username ?? null,
    firstName: ctx.from.first_name ?? null,
    lastName: ctx.from.last_name ?? null,
  });
};

bot.command('start', async (ctx) => {
  const chatId = getChatId(ctx);
  if (!chatId) return;
  await ensureUser(ctx);
  await flow.startFirstDay(chatId);
});

bot.hears(/^\/test_day_(\d+)$/i, async (ctx) => {
  const day = Number(ctx.match[1]);
  const chatId = getChatId(ctx);
  if (!chatId) return;
  await ensureUser(ctx);
  await flow.startDayNow(chatId, day);
});

bot.on('callback_query:data', async (ctx) => {
  const data: string = ctx.callbackQuery.data;
  if (!data.startsWith('fb:')) return;
  const type = data.replace('fb:', '');
  try {
    await ctx.answerCallbackQuery();
  } catch (err) {
    if (!(err instanceof Error) || !String(err.message).includes('query is too old')) {
      throw err;
    }
  }
  const chatId = getChatId(ctx);
  if (!chatId) return;
  await ensureUser(ctx);
  await flow.processFeedback(chatId, type);
});

bot.on('message', async (ctx) => {
  const chatId = getChatId(ctx);
  if (!chatId) return;
  await ensureUser(ctx);
  await flow.handleMessage(chatId);
});

scheduler.run();

setInterval(() => {
  processDueReminders(bot, messages).catch((err) => {
    console.error('Reminder processing failed', err);
  });
}, 60_000);

const webhookPort = Number(Deno.env.get('YOOKASSA_WEBHOOK_PORT') ?? '0');
if (webhookPort) {
  serve(async (req) => {
    const url = new URL(req.url);
    if (req.method === 'GET' && url.pathname === '/return') {
      const botUsername = Deno.env.get('BOT_USERNAME') ?? '';
      const botUrl = botUsername ? `https://t.me/${botUsername}` : 'https://t.me/';
      const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Оплата успешна</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; }
      .card { max-width: 520px; margin: 10vh auto; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); }
      h1 { font-size: 20px; margin: 0 0 8px; }
      p { margin: 0 0 16px; line-height: 1.5; }
      a { display: inline-block; background: #0f172a; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Оплата успешна</h1>
      <p>Спасибо! Возвращайтесь в Telegram, чтобы продолжить программу.</p>
      <a href="${botUrl}">Перейти в Telegram</a>
    </div>
  </body>
</html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (req.method !== 'POST' || url.pathname !== '/webhooks/yookassa') {
      return new Response('not found', { status: 404 });
    }
    const expectedAuth = Deno.env.get('YOOKASSA_WEBHOOK_AUTH') ?? '';
    if (
      expectedAuth &&
      !isYooKassaWebhookAuthorized(
        { authorization: req.headers.get('authorization') ?? undefined },
        expectedAuth,
      )
    ) {
      return new Response('unauthorized', { status: 401 });
    }
    const payload = (await req.json()) as YooKassaWebhookEvent;
    console.info('YooKassa webhook received', {
      event: payload?.event,
      paymentId: payload?.object?.id,
      status: payload?.object?.status,
    });
    await handleYooKassaWebhook(bot, payload, flow.startDayNow);
    return new Response('ok');
  }, { port: webhookPort });
}

bot.catch((err) => {
  console.error('Bot error', err);
});

await bot.start({
  onStart: (info) =>
    console.info(
      `Bot launched as @${info.username} in ${config.mode} mode. Daily at ${config.dailySendTime}`,
    ),
});
