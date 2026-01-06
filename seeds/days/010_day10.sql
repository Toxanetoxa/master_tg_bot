-- Day 10
INSERT INTO bot_days (day_number, is_premium)
VALUES (10, false)
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 0, $$День 10. Сегодня закрепим результат.$$ 
FROM bot_days d WHERE d.day_number = 10
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 1, $$❗ Задание: выбери вечерний момент для спокойного разговора и скажи мужу одну вещь, за которую ты ему благодарна.
Коротко и искренне.$$ 
FROM bot_days d WHERE d.day_number = 10
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 2, $$Когда скажешь — нажми кнопку.$$ 
FROM bot_days d WHERE d.day_number = 10
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Сказала$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 10 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Ты закрепила всё самое важное — тепло и уважение.
Это сильная основа для близости.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 10 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 3, $$Ты прошла 10 дней. Это уже заметные изменения.$$ 
FROM bot_days d WHERE d.day_number = 10
ON CONFLICT (day_id, step_index) DO NOTHING;
