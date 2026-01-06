-- Day 2
INSERT INTO bot_days (day_number, is_premium)
VALUES (2, false)
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 0, $$Доброе утро, милая! Думаю, ты опять сегодня не выспалась. Но это не повод откладывать практику. Аппетит приходит во время еды. А ты, спойлер, – придешь без трусиков$$
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 1, $$❗Задание: сегодня вечером он придет с работы. И я рассчитываю, что его будет ждать не только горячие пюре с котлетой, но и горячая ты на десерт. Всё просто, как писали классики: сегодня ты должна "забыть" надеть свои трусы.$$ 
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 2, $$Дождись когда благоверный вечером вернется домой. Ты будешь выглядеть как обычно. Скажи своё тихое, спокойное, привычное «Привет». Всё очень буднично.$$ 
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 3, $$Но есть одно «НО». Сегодня ты забыла надеть трусики.$$ 
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 4, $$Когда он сядет ужинать, под столом мягко дотронься до его голени своей стопой.$$ 
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 5, $$Не торопись. Пусть почувствует, но сначала не поймёт.$$ 
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 6, $$От удивления он опустит глаза вниз и... И в этот момент просто медленно приоткрой халат ровно настолько, чтобы он понял: ты сегодня — его искушение, от которого невозможно уйти к телевизору.$$ 
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 7, $$Ничего не говори. Пусть его фантазия сама соберёт картинку.$$ 
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 8, $$Когда выполнишь задание — нажми кнопку$$
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Я сделала это!$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 2 AND m.step_index = 8
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Вот теперь ты настоящая умница.
Ты сделала шаг, на который 9 из 10 женщин просто не решаются — а потом они же жалуются, что муж их «не хочет».
Ты действуешь.
И это всегда даёт результат.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 2 AND m.step_index = 8
ON CONFLICT DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 9, $$Теперь скажи мне, милая: как он отреагировал? Мне важно знать, что всё прошло не только горячо, но и правильно$$
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Сразу завёлся и прикоснулся ко мне.$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 2 AND m.step_index = 9
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'neutral', $$Завис, удивился, но явно возбудился$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 2 AND m.step_index = 9
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'negative', $$Сказал «Что ты делаешь?» / смутился.$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 2 AND m.step_index = 9
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Вот это то, что я ждала.
Ты включила в нём самца.
Когда мужчина сразу тянется — это значит, что ты попала точно в его сенсорную зону, в его фантазийный триггер.

Такой отклик — это золото.
Запомни этот момент, он нам пригодится в следующих упражнениях, чтобы усилить зависимость от твоего тела.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 2 AND m.step_index = 9
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'neutral', $$Это идеальная реакция для второго дня.
Мужчины всегда слегка зависают, когда жена внезапно показывает себя такой… живой.
Такой женственной.
Такой смелой.

Не переживай: его возбуждение — признак того, что ты выбила его из рутины.
Ты уже раскачала его фантазию, и завтра мы пойдём дальше.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 2 AND m.step_index = 9
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'negative', $$Милая, это прекрасно.
Ты тронула его там, где давно никто не трогал — в его мужском эго.
Он растерялся, потому что не привык, что его жена может быть такой свободной и уверенной.

Это значит только одно:
ты на правильном пути.
Он почувствовал напряжение.
И завтра мы аккуратно покажем твою новую грань.$$ 
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 2 AND m.step_index = 9
ON CONFLICT DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 10, $$Сегодня ты сделала огромный шаг.
Ты вошла в его личное пространство не как «жена», а как женщина, от которой идёт ток.
Продолжай.$$
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 11, $$Завтра утром дам третье упражнение.
Оно усилит привязанность так, что мужчина начнёт сам искать касаний, взгляда, твоего запаха.
Ты увидишь, что он меняется.$$
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 12, $$Я горжусь тобой.
Ты заложила фундамент для новой интимности между вами. Продолжай в том же духе.$$
FROM bot_days d WHERE d.day_number = 2
ON CONFLICT (day_id, step_index) DO NOTHING;
