import { FeedbackType } from './messages.ts';

export type DayRow = {
  id: number;
  day_number: number;
  is_premium: boolean;
  reminders: string | null;
};

export type MessageRow = {
  id: number;
  day_id: number;
  step_index: number;
  message_text: string;
};

export type FeedbackButtonRow = {
  message_id: number;
  type: FeedbackType;
  text: string;
};

export type FeedbackMessageRow = {
  message_id: number;
  type: FeedbackType;
  message_text: string;
};
