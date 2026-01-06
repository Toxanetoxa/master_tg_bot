CREATE TABLE IF NOT EXISTS bot_days (
  id SERIAL PRIMARY KEY,
  day_number INTEGER NOT NULL UNIQUE,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  reminders TEXT
);

CREATE TABLE IF NOT EXISTS bot_messages (
  id SERIAL PRIMARY KEY,
  day_id INTEGER NOT NULL REFERENCES bot_days(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  message_text TEXT NOT NULL,
  CONSTRAINT bot_messages_day_step_unique UNIQUE (day_id, step_index)
);

CREATE TABLE IF NOT EXISTS bot_feedback_buttons (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES bot_messages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  text TEXT NOT NULL,
  CONSTRAINT bot_feedback_buttons_unique UNIQUE (message_id, type, text)
);

CREATE TABLE IF NOT EXISTS bot_feedback_messages (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES bot_messages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message_text TEXT NOT NULL,
  CONSTRAINT bot_feedback_messages_unique UNIQUE (message_id, type, message_text)
);
