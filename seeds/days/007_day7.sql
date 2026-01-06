-- Day 7
INSERT INTO bot_days (day_number, is_premium)
VALUES (7, false)
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 0, $$День 7. Работаем с уверенностью и спокойствием.$$ 
FROM bot_days d WHERE d.day_number = 7
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 1, $$❗ Задание: выбери один элемент образа, который делает тебя особенно женственной (платье, запах, украшение) и используй его вечером.
Это маленькая деталь, которая меняет ощущение себя.$$ 
FROM bot_days d WHERE d.day_number = 7
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 2, $$Когда сделаешь — нажми кнопку.$$ 
FROM bot_days d WHERE d.day_number = 7
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Сделала$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 7 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Ты усилила свою женскую энергию.
Такие детали работают лучше, чем кажется.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 7 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 3, $$Горжусь тобой. Движемся дальше.$$ 
FROM bot_days d WHERE d.day_number = 7
ON CONFLICT (day_id, step_index) DO NOTHING;
