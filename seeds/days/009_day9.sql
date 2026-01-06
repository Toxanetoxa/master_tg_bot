-- Day 9
INSERT INTO bot_days (day_number, is_premium)
VALUES (9, false)
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 0, $$День 9. Сегодня — про близость без слов.$$ 
FROM bot_days d WHERE d.day_number = 9
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 1, $$❗ Задание: во время общения слегка коснись его руки или плеча и удержи прикосновение 3–5 секунд.
Пусть он почувствует твою мягкость.$$ 
FROM bot_days d WHERE d.day_number = 9
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 2, $$Когда сделаешь — нажми кнопку.$$ 
FROM bot_days d WHERE d.day_number = 9
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Сделала$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 9 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Отлично. Тактильность быстро возвращает тепло между вами.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 9 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 3, $$Горжусь тобой. Завтра финальный шаг на закрепление.$$ 
FROM bot_days d WHERE d.day_number = 9
ON CONFLICT (day_id, step_index) DO NOTHING;
