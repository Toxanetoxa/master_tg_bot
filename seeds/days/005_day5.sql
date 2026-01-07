-- Day 5
INSERT INTO bot_days (day_number, is_premium)
VALUES (5, true)
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 0, $$День 5. Сегодня мы включаем язык тела.$$ 
FROM bot_days d WHERE d.day_number = 5
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 1, $$❗ Задание: вечером, когда муж придёт, обними его дольше обычного.
Не торопись, прижмись и просто будь рядом 20-30 секунд.
Это упражнение про присутствие.$$ 
FROM bot_days d WHERE d.day_number = 5
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 2, $$Когда сделаешь — нажми кнопку.$$ 
FROM bot_days d WHERE d.day_number = 5
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Сделала$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 5 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Такое простое действие возвращает близость.
Ты молодец. Завтра дам ещё одно упражнение.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 5 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 3, $$Сегодня ты укрепила связь. Это важно.$$ 
FROM bot_days d WHERE d.day_number = 5
ON CONFLICT (day_id, step_index) DO NOTHING;
