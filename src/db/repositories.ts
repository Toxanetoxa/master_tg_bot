import { eq } from 'npm:drizzle-orm@0.36.4';
import { db } from './client.ts';
import { users, userState } from './schema.ts';
import { sql } from './client.ts';
import { Day, FeedbackType, Message } from '../types/messages.ts';
import {
  DayRow,
  FeedbackButtonRow,
  FeedbackMessageRow,
  MessageRow,
} from '../types/db.ts';
import { UserStatus } from '../types/state.ts';

export const getOrCreateUser = async (tgUserId: number, profile?: {
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) => {
  const existing = await db.select().from(users).where(eq(users.tgUserId, tgUserId)).limit(1);
  if (existing.length) {
    const updated = await db
      .update(users)
      .set({
        username: profile?.username ?? existing[0].username ?? null,
        firstName: profile?.firstName ?? existing[0].firstName ?? null,
        lastName: profile?.lastName ?? existing[0].lastName ?? null,
        lastSeenAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.tgUserId, tgUserId))
      .returning();
    return updated[0];
  }

  const inserted = await db
    .insert(users)
    .values({
      tgUserId,
      username: profile?.username ?? null,
      firstName: profile?.firstName ?? null,
      lastName: profile?.lastName ?? null,
      lastSeenAt: new Date(),
    })
    .returning();
  return inserted[0];
};

export const upsertUserState = async (userId: number, state: {
  day: number;
  messageIndex: number;
  status: string;
}) => {
  const existing = await db
    .select()
    .from(userState)
    .where(eq(userState.userId, userId))
    .limit(1);
  if (existing.length) {
    const updated = await db
      .update(userState)
      .set({
        day: state.day,
        messageIndex: state.messageIndex,
        status: state.status,
        updatedAt: new Date(),
      })
      .where(eq(userState.userId, userId))
      .returning();
    return updated[0];
  }

  const inserted = await db
    .insert(userState)
    .values({
      userId,
      day: state.day,
      messageIndex: state.messageIndex,
      status: state.status,
    })
    .returning();
  return inserted[0];
};

export const getUserStateByTgUserId = async (tgUserId: number) => {
  const result = await db
    .select()
    .from(userState)
    .innerJoin(users, eq(userState.userId, users.id))
    .where(eq(users.tgUserId, tgUserId))
    .limit(1);
  return result[0] ?? null;
};

export const getAllUserStates = async () => {
  const rows = await db
    .select({
      tgUserId: users.tgUserId,
      day: userState.day,
      messageIndex: userState.messageIndex,
      status: userState.status,
    })
    .from(userState)
    .innerJoin(users, eq(userState.userId, users.id));
  return rows.map((row) => ({
    ...row,
    status: (row.status === 'scheduled'
      ? 'scheduled'
      : row.status === 'blocked'
        ? 'blocked'
        : 'active') as UserStatus,
  }));
};

export const loadMessageDays = async () => {
  const days = await sql<DayRow[]>`
    SELECT id, day_number, is_premium, reminders
    FROM bot_days
    ORDER BY day_number
  `;
  const messages = await sql<MessageRow[]>`
    SELECT id, day_id, step_index, message_text
    FROM bot_messages
    ORDER BY day_id, step_index
  `;
  const buttons = await sql<FeedbackButtonRow[]>`
    SELECT message_id, type, text
    FROM bot_feedback_buttons
    ORDER BY id
  `;
  const feedbackMessages = await sql<FeedbackMessageRow[]>`
    SELECT message_id, type, message_text
    FROM bot_feedback_messages
    ORDER BY id
  `;

  const messageByDay = new Map<number, MessageRow[]>();
  for (const msg of messages) {
    if (!messageByDay.has(msg.day_id)) messageByDay.set(msg.day_id, []);
    messageByDay.get(msg.day_id)!.push(msg);
  }

  const buttonsByMessage = new Map<number, FeedbackButtonRow[]>();
  for (const btn of buttons) {
    if (!buttonsByMessage.has(btn.message_id)) buttonsByMessage.set(btn.message_id, []);
    buttonsByMessage.get(btn.message_id)!.push(btn);
  }

  const feedbackMessagesByMessage = new Map<number, FeedbackMessageRow[]>();
  for (const row of feedbackMessages) {
    if (!feedbackMessagesByMessage.has(row.message_id)) {
      feedbackMessagesByMessage.set(row.message_id, []);
    }
    feedbackMessagesByMessage.get(row.message_id)!.push(row);
  }

  const map = new Map<number, Day>();
  for (const day of days) {
    const dayMessages = messageByDay.get(day.id) ?? [];
    const mapped: Message[] = dayMessages.map((m) => {
      const btns = buttonsByMessage.get(m.id) ?? [];
      const msgs = feedbackMessagesByMessage.get(m.id) ?? [];
      const feedback = btns.length || msgs.length
        ? {
          buttons: btns.length ? btns.map((b) => ({ type: b.type, text: b.text })) : undefined,
          messages: msgs.length
            ? msgs.reduce((acc, cur) => {
              acc[cur.type] = cur.message_text;
              return acc;
            }, {} as Record<FeedbackType, string>)
            : undefined,
        }
        : undefined;
      return { id: m.step_index, message: m.message_text, feedback };
    });
    map.set(day.day_number, {
      isPremium: day.is_premium,
      msg: mapped,
      reminders: day.reminders ?? undefined,
    });
  }

  return map;
};

export const upsertUserStateByTgUserId = async (tgUserId: number, state: {
  day: number;
  messageIndex: number;
  status: UserStatus;
}) => {
  const user = await getOrCreateUser(tgUserId);
  return await upsertUserState(user.id, state);
};

export const deleteUserStateByTgUserId = async (tgUserId: number) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.tgUserId, tgUserId))
    .limit(1);
  if (!result.length) return;
  await db.delete(userState).where(eq(userState.userId, result[0].id));
};

export const getUserStateByUserId = async (userId: number) => {
  const rows = await db.select().from(userState).where(eq(userState.userId, userId)).limit(1);
  return rows[0] ?? null;
};

export const hasActiveSubscriptionByTgUserId = async (tgUserId: number) => {
  const rows = await sql<{ status: string; plan: string; end_at: Date | string | null }[]>`
    SELECT status, plan, end_at
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    WHERE u.tg_user_id = ${tgUserId}
    ORDER BY s.id DESC
    LIMIT 1
  `;
  if (!rows.length) return false;
  const sub = rows[0];
  if (sub.status !== 'active') return false;
  if (sub.plan !== 'premium') return false;
  if (!sub.end_at) return true;
  const endAt = sub.end_at instanceof Date ? sub.end_at : new Date(sub.end_at);
  return endAt.getTime() > Date.now();
};

export const createPaymentForUser = async (userId: number, data: {
  provider: string;
  status: string;
  amount: number;
  currency: string;
  paymentId: string;
  idempotencyKey: string;
}) => {
  const rows = await sql<{ id: number }[]>`
    INSERT INTO payments (user_id, provider, status, amount, currency, payment_id, idempotency_key)
    VALUES (
      ${userId},
      ${data.provider},
      ${data.status},
      ${data.amount},
      ${data.currency},
      ${data.paymentId},
      ${data.idempotencyKey}
    )
    RETURNING id
  `;
  return rows[0] ?? null;
};

export const setPaymentStatusByPaymentId = async (paymentId: string, status: string) => {
  const rows = await sql<{ id: number; user_id: number }[]>`
    UPDATE payments
    SET status = ${status}, updated_at = NOW()
    WHERE payment_id = ${paymentId} AND status IS DISTINCT FROM ${status}
    RETURNING id, user_id
  `;
  return rows[0] ?? null;
};

export const createSubscriptionForPayment = async (userId: number, paymentDbId: number) => {
  const rows = await sql<{ id: number }[]>`
    INSERT INTO subscriptions (user_id, status, plan, start_at, end_at, payment_id)
    SELECT ${userId}, 'active', 'premium', NOW(), NULL, ${paymentDbId}
    WHERE NOT EXISTS (
      SELECT 1 FROM subscriptions WHERE payment_id = ${paymentDbId}
    )
    RETURNING id
  `;
  return rows[0] ?? null;
};

export const getTgUserIdByUserId = async (userId: number) => {
  const rows = await sql<{ tg_user_id: number }[]>`
    SELECT tg_user_id
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  return rows[0]?.tg_user_id ?? null;
};
