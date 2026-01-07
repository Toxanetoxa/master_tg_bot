import { YooKassaCreatePaymentResponse, YooKassaWebhookEvent } from '../types/payments.ts';
import {
  createPaymentForUser,
  createSubscriptionForPayment,
  getOrCreateUser,
  getTgUserIdByUserId,
  getUserStateSimpleByTgUserId,
  setPaymentStatusByPaymentId,
} from '../db/repositories.ts';

const PRICE_RUB = 340;
const PAYMENT_DESCRIPTION = 'Подписка на программу «30 дней разжигания страсти в отношениях»';

export const buildUpsellText = () => {
  return [
    'Я создала полноценную программу:',
    '«30 дней разжигания страсти в отношениях».',
    '',
    'Это не просто задания.',
    'Это ежедневные маленькие шаги, которые возвращают к жизни женственность, чувственность и ту самую лёгкость, от которой мужчины теряют голову.',
    'И за 30 дней ты делаешь то, что многие пытаются сделать годами.',
    '',
    'Стоимость — всего 340 рублей.',
    'Это даже меньше, чем чашка кофе.',
    'Только кофе даёт удовольствие на пару часов. А то, что ты получишь — это годы удовольствия в браке.',
    '',
    'Это инвестиция в отношения, в душевную близость, в твою силу как женщины.',
    '',
    'Ты готова продолжить занятия со мной?',
  ].join('\n');
};

export const getPaymentButtonText = () =>
  'Купить программу «30 дней разжигания страсти в отношениях»';

export const createPaymentLink = async (
  tgUserId: number,
  deps?: {
    fetchFn?: typeof fetch;
    getOrCreateUserFn?: typeof getOrCreateUser;
    createPaymentForUserFn?: typeof createPaymentForUser;
    env?: {
      shopId?: string;
      secretKey?: string;
      returnUrl?: string;
    };
  },
) => {
  const fetchFn = deps?.fetchFn ?? fetch;
  const getOrCreateUserFn = deps?.getOrCreateUserFn ?? getOrCreateUser;
  const createPaymentForUserFn = deps?.createPaymentForUserFn ?? createPaymentForUser;
  const shopId = deps?.env?.shopId ?? Deno.env.get('YOOKASSA_SHOP_ID') ?? '';
  const secretKey = deps?.env?.secretKey ?? Deno.env.get('YOOKASSA_SECRET_KEY') ?? '';
  const returnUrl = deps?.env?.returnUrl ?? Deno.env.get('YOOKASSA_RETURN_URL');
  const authHeader = shopId && secretKey ? `Basic ${btoa(`${shopId}:${secretKey}`)}` : null;
  if (!authHeader || !returnUrl) {
    throw new Error('Missing YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, or YOOKASSA_RETURN_URL');
  }

  const user = await getOrCreateUserFn(tgUserId);
  const idempotencyKey = crypto.randomUUID();

  const response = await fetchFn('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotencyKey,
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: {
        value: PRICE_RUB.toFixed(2),
        currency: 'RUB',
      },
      description: PAYMENT_DESCRIPTION,
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      metadata: {
        tg_user_id: String(tgUserId),
      },
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = (await response.json()) as YooKassaCreatePaymentResponse;
  const confirmationUrl = data.confirmation?.confirmation_url;
  if (!confirmationUrl) {
    throw new Error('Missing confirmation URL from YooKassa');
  }

  await createPaymentForUserFn(user.id, {
    provider: 'yookassa',
    status: data.status,
    amount: PRICE_RUB,
    currency: 'RUB',
    paymentId: data.id,
    idempotencyKey,
  });

  return confirmationUrl;
};

export const handleYooKassaWebhook = async (
  bot: BotLike,
  payload: YooKassaWebhookEvent,
  startDayNow?: (chatId: number, day: number) => Promise<void>,
  deps?: {
    setPaymentStatusByPaymentIdFn?: typeof setPaymentStatusByPaymentId;
    createSubscriptionForPaymentFn?: typeof createSubscriptionForPayment;
    getTgUserIdByUserIdFn?: typeof getTgUserIdByUserId;
    getUserStateSimpleByTgUserIdFn?: typeof getUserStateSimpleByTgUserId;
  },
) => {
  if (payload.event !== 'payment.succeeded') return;
  if (payload.object?.status !== 'succeeded') return;
  const paymentId = payload.object?.id;
  if (!paymentId) return;

  const setPaymentStatusByPaymentIdFn = deps?.setPaymentStatusByPaymentIdFn ??
    setPaymentStatusByPaymentId;
  const createSubscriptionForPaymentFn = deps?.createSubscriptionForPaymentFn ??
    createSubscriptionForPayment;
  const getTgUserIdByUserIdFn = deps?.getTgUserIdByUserIdFn ?? getTgUserIdByUserId;
  const getUserStateSimpleByTgUserIdFn = deps?.getUserStateSimpleByTgUserIdFn ??
    getUserStateSimpleByTgUserId;

  const paymentRow = await setPaymentStatusByPaymentIdFn(paymentId, 'succeeded');
  if (!paymentRow) return;

  const subscription = await createSubscriptionForPaymentFn(paymentRow.user_id, paymentRow.id);
  if (!subscription) return;
  const tgUserId = await getTgUserIdByUserIdFn(paymentRow.user_id);
  if (!tgUserId) return;

  await bot.api.sendMessage(
    tgUserId,
    'Оплата прошла успешно. Доступ к программе открыт, можно продолжать занятия.',
  );

  if (startDayNow) {
    const state = await getUserStateSimpleByTgUserIdFn(tgUserId);
    if (state?.status === 'blocked' && typeof state.day === 'number') {
      await startDayNow(tgUserId, state.day);
    }
  }
};
type BotLike = {
  api: {
    sendMessage: (chatId: number, text: string) => Promise<void>;
  };
};
