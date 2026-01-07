export type AdminUser = {
  id: number;
  tg_user_id: number;
  username: string | null;
  first_name: string | null;
  role: string;
};

export type AppUser = {
  id: number;
  tg_user_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string | null;
  last_seen_at: string | null;
};

export type PaymentRow = {
  id: number;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  tg_user_id: number | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
};

export type AnalyticsResponse = {
  monthlyRevenue: { month: string; total: number }[];
  monthlySubscriptions: { month: string; count: number }[];
  dayProgress: { day: number; count: number }[];
  totals: { revenue: number; subscriptions: number };
};

export type Day = {
  id: number;
  day_number: number;
  is_premium: boolean;
  reminders: string | null;
};

export type Message = {
  id: number;
  day_id: number;
  step_index: number;
  message_text: string;
  reminder_text?: string | null;
};

export type FeedbackButton = {
  id: number;
  message_id: number;
  type: string;
  text: string;
};

export type FeedbackMessage = {
  id: number;
  message_id: number;
  type: string;
  message_text: string;
};

export type FeedbackResponse = {
  buttons: FeedbackButton[];
  messages: FeedbackMessage[];
};
