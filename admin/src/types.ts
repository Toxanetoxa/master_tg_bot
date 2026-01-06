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
