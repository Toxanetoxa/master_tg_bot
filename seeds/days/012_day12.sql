-- Day 12
INSERT INTO bot_days (day_number, is_premium)
VALUES (12, false)
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 0, $$День 12. Финальный тестовый день перед продолжением программы.$$ 
FROM bot_days d WHERE d.day_number = 12
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 1, $$❗ Задание: выбери вечерний момент и просто побудь рядом с мужем 5-10 минут без телефона.
Тишина тоже создаёт близость.$$ 
FROM bot_days d WHERE d.day_number = 12
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 2, $$Когда сделаешь — нажми кнопку.$$ 
FROM bot_days d WHERE d.day_number = 12
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Сделала$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 12 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Ты закрепила навык близости. Это достойно уважения.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 12 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 3, $$Если хочешь продолжить программу глубже — я готова вести тебя дальше.$$ 
FROM bot_days d WHERE d.day_number = 12
ON CONFLICT (day_id, step_index) DO NOTHING;
