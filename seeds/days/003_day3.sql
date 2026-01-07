-- Day 3
INSERT INTO bot_days (day_number, is_premium)
VALUES (3, false)
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 0, $$Доброе утро, милая.
Сегодня третий день практики. Ты уже заметила, как меняется твоё состояние — ты стала смелее, живее, теплее.$$ 
FROM bot_days d WHERE d.day_number = 3
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 1, $$❗ Задание дня: когда будешь дома одна, подойди к зеркалу, посмотри себе в глаза и спой.
Ту песню, которая приходит в сердце первой. Короткую, длинную — не важно.

Женский голос — это энергия, которая освобождает тело и возвращает внутреннюю близость с собой.$$ 
FROM bot_days d WHERE d.day_number = 3
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 2, $$Когда закончишь — нажми кнопку. Мне важно знать, как ты прошла это упражнение.$$ 
FROM bot_days d WHERE d.day_number = 3
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Сделала и мне понравилось$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 3 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'neutral', $$Сделала, но было странно$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 3 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'negative', $$Не смогла, зажалась$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 3 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Ты молодец. Ты пропустила через себя свой голос — и это уже огромный шаг.
Мужчины чувствуют женщину, которая звучит изнутри, даже если она молчит.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 3 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'neutral', $$Это нормально. Первый раз всегда непривычно.
Главное — ты попробовала, а значит уже сняла часть напряжения.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 3 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'negative', $$Понимаю. Это значит, что внутри много зажатости.
Но ты уже увидела это — и это первый шаг к освобождению.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 3 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 3, $$Ты сегодня сделала важное упражнение.
Завтра я дам следующий шаг, который усиливает близость и притяжение.$$ 
FROM bot_days d WHERE d.day_number = 3
ON CONFLICT (day_id, step_index) DO NOTHING;