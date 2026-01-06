DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bot_feedback_buttons_unique'
  ) THEN
    ALTER TABLE bot_feedback_buttons
      ADD CONSTRAINT bot_feedback_buttons_unique UNIQUE (message_id, type, text);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bot_feedback_messages_unique'
  ) THEN
    ALTER TABLE bot_feedback_messages
      ADD CONSTRAINT bot_feedback_messages_unique UNIQUE (message_id, type, message_text);
  END IF;
END $$;
