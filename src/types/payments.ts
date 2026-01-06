export type PaymentProvider = 'yookassa';

export type PaymentStatus = 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled' | 'failed';

export type CurrencyCode = 'RUB' | 'USD' | 'EUR';

export type SubscriptionStatus = 'pending' | 'active' | 'canceled' | 'expired';

export type SubscriptionPlan = 'basic' | 'premium';

export type YooKassaAmount = {
  value: string;
  currency: CurrencyCode;
};

export type YooKassaPaymentObject = {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  paid?: boolean;
  amount: YooKassaAmount;
  captured_at?: string;
  created_at?: string;
  description?: string;
  metadata?: Record<string, string>;
};

export type YooKassaWebhookEvent = {
  type: 'notification';
  event: 'payment.succeeded' | 'payment.canceled' | 'payment.waiting_for_capture';
  object: YooKassaPaymentObject;
};

export type YooKassaConfirmation = {
  type: 'redirect';
  confirmation_url: string;
};

export type YooKassaCreatePaymentRequest = {
  amount: YooKassaAmount;
  description: string;
  capture: boolean;
  confirmation: {
    type: 'redirect';
    return_url: string;
  };
  metadata?: Record<string, string>;
};

export type YooKassaCreatePaymentResponse = YooKassaPaymentObject & {
  confirmation?: YooKassaConfirmation;
};

export type YooKassaWebhookHeaders = {
  'content-type'?: string;
  'authorization'?: string;
  'idempotence-key'?: string;
};

export type UserSubscription = {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  startAt?: string;
  endAt?: string;
  paymentId?: string;
};
