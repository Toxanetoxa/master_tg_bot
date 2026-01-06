import { bigint, integer, pgTable, serial, text, timestamp } from 'npm:drizzle-orm@0.36.4/pg-core';
import { relations } from 'npm:drizzle-orm@0.36.4';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  tgUserId: bigint('tg_user_id', { mode: 'number' }).notNull().unique(),
  username: text('username'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: text('role').notNull().default('user'),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userState = pgTable('user_state', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  day: integer('day').notNull(),
  messageIndex: integer('message_index').notNull(),
  status: text('status').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  provider: text('provider').notNull(),
  status: text('status').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('RUB'),
  paymentId: text('payment_id').notNull(),
  idempotencyKey: text('idempotency_key').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  status: text('status').notNull(),
  plan: text('plan').notNull(),
  startAt: timestamp('start_at', { withTimezone: true }),
  endAt: timestamp('end_at', { withTimezone: true }),
  paymentId: integer('payment_id').references(() => payments.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  state: one(userState, { fields: [users.id], references: [userState.userId] }),
  payments: many(payments),
  subscriptions: many(subscriptions),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  payment: one(payments, { fields: [subscriptions.paymentId], references: [payments.id] }),
}));
