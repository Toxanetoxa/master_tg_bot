-- Day 1
INSERT INTO bot_days (day_number, is_premium)
VALUES (1, false)
ON CONFLICT (day_number) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 0, $$Поздравляю, милая! Сегодня ты делаешь один из самых важных шагов в своей жизни. Ты возвращаешь в ваши отношения с мужем огонь и страсть. Потому что кто если не мы?$$
FROM bot_days d WHERE d.day_number = 1
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 1, $$У нас с тобой начинается практика, которая мягко выстраивает динамику отношений между мужчиной и женщиной. Я даю ее только тем, кто готов к настоящей близости. Думаю, ты даже вспотеешь от волнения, но это хороший знак. Потому что близость всегда начинается с храбрости$$
FROM bot_days d WHERE d.day_number = 1
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 2, $$Сегодня твоя задача узнать, какие именно моменты из вашего интима он прокручивает в голове, когда остаётся наедине с собой и своими желаниями.

Да, я знаю, что сейчас ты напряглась. Но послушай: они все это делают. И не всегда на нас с тобой. Но важно здесь держать грамотную, выигрышную позицию с позитивным подкреплением, что ты друг, а не враг, от которого нужно прятаться. Для этого он должен быть уверен, что с тобой можно спокойно говорить о личном.

Сегодня ты слегка приоткроешь к нему дверь. Ведь, вероятно, до этого ты либо входила туда с ноги, либо и вовсе игнорировала один из важнейших ритуалов спокойствия в его жизни.

❗ Задание: вечером, в спокойный момент, мягко скажи мужу: "Слушай, я давно хотела тебя спросить об одном моменте… Когда ты думаешь о моем теле наедине с собой: какой именно момент тебе вспоминается чаще всего?"

И. Просто. Позволь. Ему. Ответить. Как. Он. Чувствует..

Ты удивишься, как много мужчина может открыть, если женщина задаёт правильный вопрос и, более того, дает достаточно пространства для ответа.$$
FROM bot_days d WHERE d.day_number = 1
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 3, $$Скажи мне, как он отреагировал?$$
FROM bot_days d WHERE d.day_number = 1
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_messages (day_id, step_index, message_text)
SELECT d.id, 4, $$Я горжусь тобой. Сегодня ты заложила фундамент для новой интимности между вами. Продолжай в том же духе. Завтра утром ты получишь следующее упражнение. Оно создаст такое притяжение, что он сам начнёт искать твоего внимания$$
FROM bot_days d WHERE d.day_number = 1
ON CONFLICT (day_id, step_index) DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Когда выполнишь задание, то нажми на эту кнопку$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 1 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Ты просто умница. Ты сделала то, на что большинство женщин даже не решаются и годами бездействуют. Ты другая, ты уже начала возвращать себе власть, мягкую, женскую, спокойную.$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 1 AND m.step_index = 2
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'positive', $$Описал свои фантазии.$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 1 AND m.step_index = 3
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'neutral', $$Ответил уклончиво / отшутился.$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 1 AND m.step_index = 3
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_buttons (message_id, type, text)
SELECT m.id, 'negative', $$Сказал: "Не скажу", "Зачем тебе это?", "Странный вопрос"$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 1 AND m.step_index = 3
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'positive', $$Отлично. То, что он так честно сказал — это показатель доверия. Ты уже начала выстраивать мост между вами. Завтра ты сделаешь следующее упражнение, и оно усилит его включённость в тебя. И усилит твою уверенность в правильности выбранного пути.$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 1 AND m.step_index = 3
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'neutral', $$Дорогая, это типичная мужская защитная реакция, в этом нет ничего такого. Пока что он не привык говорить о своих фантазиях с женой. Он боится, что ты его осудишь. Но ты уже взяла начала доказывать ему обратное, тебе можно доверять.$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 1 AND m.step_index = 3
ON CONFLICT DO NOTHING;

INSERT INTO bot_feedback_messages (message_id, type, message_text)
SELECT m.id, 'negative', $$Знаешь, покажется странным, но это тоже хороший знак. Потому что за словами он почувствовал твоё влияние, что сама тема глубже, чем кажется, и что ТЫ можешь что-то изменить. Так ты запустила процесс. Завтра мы аккуратно развернем его в твою сторону$$
FROM bot_messages m
JOIN bot_days d ON d.id = m.day_id
WHERE d.day_number = 1 AND m.step_index = 3
ON CONFLICT DO NOTHING;
