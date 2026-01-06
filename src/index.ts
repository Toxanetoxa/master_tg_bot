import { Bot, type Context } from 'npm:grammy@1.32.0';
import { loadConfig } from './config.ts';
import { createStateStore } from './types/state.ts';
import { createMessageFlow } from './services/message-flow.ts';
import { createScheduler } from './services/scheduler.ts';
import { getAllUserStates, getOrCreateUser, loadMessageDays } from './db/repositories.ts';

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

bot.catch((err) => {
  console.error('Bot error', err);
});

await bot.start({
  onStart: (info) =>
    console.info(
      `Bot launched as @${info.username} in ${config.mode} mode. Daily at ${config.dailySendTime}`,
    ),
});
