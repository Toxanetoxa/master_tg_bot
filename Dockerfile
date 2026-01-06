FROM denoland/deno:2.1.0 AS builder

WORKDIR /app

COPY deno.json ./
COPY src ./src
COPY migrations ./migrations
COPY seeds ./seeds

RUN deno compile \
  --no-lock \
  --allow-env \
  --allow-net \
  --allow-read \
  --output /app/bot \
  src/index.ts

FROM debian:bookworm-slim

WORKDIR /app

COPY --from=builder /app/bot /usr/local/bin/bot
COPY migrations ./migrations
COPY seeds ./seeds

ENV DENO_NO_LOCK=1

CMD ["bot"]
