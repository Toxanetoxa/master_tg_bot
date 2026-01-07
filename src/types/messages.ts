export type FeedbackType = 'positive' | 'negative' | 'neutral';

export type FeedbackButton = {
  type: FeedbackType;
  text: string;
};

export interface Feedback {
  buttons?: FeedbackButton[];
  messages?: Partial<Record<FeedbackType, string>>;
}

export type Message = {
  id: number;
  message: string;
  feedback?: Feedback;
  reminderText?: string;
};

export type Day = {
  isPremium: boolean;
  msg: Message[];
  reminders?: string;
};
