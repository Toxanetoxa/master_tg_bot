-- Day 11
INSERT INTO bot_days (day_number, is_premium)
VALUES (11, false)
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 0, $$День 11. Это дополнительный день поддержки.$$ 
FROM bot_days d WHERE d.day_number = 11
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 1, $$❗ Задание: вспомни один момент за эти дни, который дал тебе чувство силы. Запиши его для себя.$$ 
FROM bot_days d WHERE d.day_number = 11
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 2, $$Когда запишешь — нажми кнопку.$$ 
FROM bot_days d WHERE d.day_number = 11
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Готово$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 11 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Отлично. Эти опоры помогают двигаться дальше.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 11 AND m.step_index = 2
ON CONFLICT DO NOTHING;
