ALTER TABLE users
  ADD COLUMN IF NOT EXISTS timezone_offset_min INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS scheduler_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  daily_send_time TEXT NOT NULL DEFAULT '10:00',
  start_now_requested_at TIMESTAMPTZ
);

INSERT INTO scheduler_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
