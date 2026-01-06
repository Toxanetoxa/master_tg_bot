-- Day 8
INSERT INTO bot_days (day_number, is_premium)
VALUES (8, false)
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 0, $$День 8. Сегодня учимся мягко говорить о желаниях.$$ 
FROM bot_days d WHERE d.day_number = 8
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 1, $$❗ Задание: скажи мужу фразу: "Мне нравится, когда ты…" и назови один конкретный момент.
Без давления, просто как признание.$$ 
FROM bot_days d WHERE d.day_number = 8
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 2, $$Когда скажешь — нажми кнопку.$$ 
FROM bot_days d WHERE d.day_number = 8
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Сказала$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 8 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Ты дала мужчине ясный сигнал. Это усиливает контакт и доверие.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 8 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 3, $$Отличная работа. Завтра продолжим.$$ 
FROM bot_days d WHERE d.day_number = 8
ON CONFLICT (day_id, step_index) DO NOTHING;
