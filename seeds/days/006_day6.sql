-- Day 6
INSERT INTO bot_days (day_number, is_premium)
VALUES (6, true)
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 0, $$День 6. Сегодня мы добавим игру и лёгкость.$$ 
FROM bot_days d WHERE d.day_number = 6
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 1, $$❗ Задание: напиши мужу короткое сообщение с намёком.
Например: "Сегодня я кое-что придумала" или "Я скучаю по твоим рукам".
Пусть он ждёт тебя вечером.$$ 
FROM bot_days d WHERE d.day_number = 6
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 2, $$Когда отправишь — нажми кнопку.$$ 
FROM bot_days d WHERE d.day_number = 6
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Отправила$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 6 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Отлично. Ты подняла градус ожидания.
Это мягко включает мужскую инициативу.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 6 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 3, $$Завтра будет ещё интереснее.$$ 
FROM bot_days d WHERE d.day_number = 6
ON CONFLICT (day_id, step_index) DO NOTHING;
