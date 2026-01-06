-- Day 4
INSERT INTO bot_days (day_number, is_premium)
VALUES (4, false)
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 0, $$День 4. Сегодня мы пойдём глубже — к твоим настоящим желаниям.$$ 
FROM bot_days d WHERE d.day_number = 4
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 1, $$❗ Задание: возьми блокнот и ответь письменно на 3 вопроса.
1) Какой момент с мужем я хочу повторить?
2) Что именно мне нравится в его теле?
3) В какой момент мне было особенно хорошо в последние недели?

Пиши честно, только для себя.$$ 
FROM bot_days d WHERE d.day_number = 4
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 2, $$Когда закончишь — нажми кнопку.$$ 
FROM bot_days d WHERE d.day_number = 4
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Готово$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 4 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Ты умница. Когда желания записаны, они начинают работать на тебя.
Завтра ты начнёшь переводить это в действие.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 4 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 3, $$Отдыхай. Завтра будет следующий шаг.$$ 
FROM bot_days d WHERE d.day_number = 4
ON CONFLICT (day_id, step_index) DO NOTHING;
