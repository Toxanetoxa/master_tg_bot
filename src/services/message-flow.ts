import { Bot, InlineKeyboard } from 'npm:grammy@1.32.0';
import { Day } from '../types/messages.ts';
import { AppConfig } from '../config.ts';
import { StateStore, UserState } from '../types/state.ts';
import {
  deleteUserStateByTgUserId,
  hasActiveSubscriptionByTgUserId,
  upsertUserStateByTgUserId,
} from '../db/repositories.ts';

type Dependencies = {
  bot: Bot;
  config: AppConfig;
  state: StateStore;
  messages: Map<number, Day>;
};

const getDayData = (deps: Dependencies, day: number) => deps.messages.get(day);
const buildDayOrder = (deps: Dependencies) => {
  return Array.from(deps.messages.entries())
    .map(([dayNumber, day]) => ({ dayNumber, isPremium: day.isPremium }))
    .sort((a, b) => {
      if (a.isPremium === b.isPremium) return a.dayNumber - b.dayNumber;
      return a.isPremium ? 1 : -1;
    })
    .map((d) => d.dayNumber);
};

const buildKeyboard = (feedbackButtons: { type: string; text: string }[]) => {
  const kb = new InlineKeyboard();
  feedbackButtons.forEach((btn, idx) => {
    kb.text(btn.text, `fb:${btn.type}`);
    if (idx < feedbackButtons.length - 1) kb.row(); // каждая кнопка в новой строке
  });
  return kb;
};

export const createMessageFlow = (deps: Dependencies) => {
  const orderedDays = buildDayOrder(deps);
  const getNextDayNumber = (currentDay: number) => {
    const idx = orderedDays.indexOf(currentDay);
    if (idx < 0) return null;
    return orderedDays[idx + 1] ?? null;
  };

  const sendPremiumUpsell = async (chatId: number) => {
    await deps.bot.api.sendMessage(
      chatId,
      'Этот день доступен только по подписке. Оформите подписку, чтобы продолжить.',
    );
  };

  const advanceState = async (chatId: number) => {
    const state = deps.state.get(chatId);
    if (!state) return;
    const dayData = getDayData(deps, state.day);
    if (!dayData) return;

    const nextIndex = state.messageIndex + 1;
    if (nextIndex < dayData.msg.length) {
      const nextState: UserState = { ...state, messageIndex: nextIndex };
      deps.state.set(chatId, nextState);
      await upsertUserStateByTgUserId(chatId, nextState);
      return;
    }

    const nextDay = getNextDayNumber(state.day);
    if (nextDay === null) {
      deps.state.delete(chatId);
      await deleteUserStateByTgUserId(chatId);
      return;
    }

    const nextDayData = getDayData(deps, nextDay);
    if (nextDayData) {
      if (nextDayData.isPremium) {
        const hasAccess = await hasActiveSubscriptionByTgUserId(chatId);
        if (!hasAccess) {
          await sendPremiumUpsell(chatId);
          deps.state.delete(chatId);
          await deleteUserStateByTgUserId(chatId);
          return;
        }
      }
      const status: UserState['status'] = deps.config.mode === 'prod' ? 'scheduled' : 'active';
      const nextState: UserState = { day: nextDay, messageIndex: 0, status };
      deps.state.set(chatId, nextState);
      await upsertUserStateByTgUserId(chatId, nextState);
    } else {
      deps.state.delete(chatId);
      await deleteUserStateByTgUserId(chatId);
    }
  };

  const sendChain = async (chatId: number) => {
    // Отправляем подряд все сообщения, пока не встретилось feedback с кнопками или не закончились шаги.
    while (true) {
      const state = deps.state.get(chatId);
      if (!state || state.status !== 'active') break;

      const dayData = getDayData(deps, state.day);
      if (!dayData) break;

      const current = dayData.msg[state.messageIndex];
      if (!current) break;

      const kb = current.feedback?.buttons && current.feedback.buttons.length > 0
        ? buildKeyboard(current.feedback.buttons)
        : undefined;

      // Пропускаем пустые сообщения, чтобы не падать с 400 от Telegram.
      if (current.message?.trim()) {
        await deps.bot.api.sendMessage(chatId, current.message, {
          reply_markup: kb,
        });
      }

      // Если есть feedback-кнопки — ждём реакции пользователя.
      if (current.feedback?.buttons?.length) break;

      await advanceState(chatId);

      const nextState = deps.state.get(chatId);
      if (!nextState || nextState.status !== 'active') break;
    }
  };

  const startDayNow = async (chatId: number, day: number) => {
    const dayData = getDayData(deps, day);
    if (!dayData) {
      await deps.bot.api.sendMessage(chatId, 'Нет данных для этого дня.');
      return;
    }
    if (dayData.isPremium) {
      const hasAccess = await hasActiveSubscriptionByTgUserId(chatId);
      if (!hasAccess) {
        await sendPremiumUpsell(chatId);
        deps.state.delete(chatId);
        await deleteUserStateByTgUserId(chatId);
        return;
      }
    }
    deps.state.set(chatId, { day, messageIndex: 0, status: 'active' });
    await upsertUserStateByTgUserId(chatId, { day, messageIndex: 0, status: 'active' });
    await sendChain(chatId);
  };

  const startFirstDay = async (chatId: number) => {
    const firstDay = orderedDays[0];
    if (firstDay === undefined) {
      await deps.bot.api.sendMessage(chatId, 'Нет доступных дней для старта.');
      return;
    }
    await startDayNow(chatId, firstDay);
  };

  const processFeedback = async (chatId: number, type: string) => {
    const state = deps.state.get(chatId);
    if (!state) return;
    const dayData = getDayData(deps, state.day);
    if (!dayData) return;
    const current = dayData.msg[state.messageIndex];
    const replyText = current.feedback?.messages?.[type as keyof typeof current.feedback.messages];
    if (replyText) {
      await deps.bot.api.sendMessage(chatId, replyText);
    }

    await advanceState(chatId);
    await sendChain(chatId);
  };

  const handleMessage = async (chatId: number) => {
    const state = deps.state.get(chatId);
    if (!state || state.status !== 'active') return;

    // Без кнопок двигаемся автоматически, поэтому просто пытаемся продолжить цепочку.
    await sendChain(chatId);
  };

  return {
    advanceState,
    startDayNow,
    startFirstDay,
    processFeedback,
    handleMessage,
  };
};
