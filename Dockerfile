FROM denoland/deno:2.4.0 AS builder

WORKDIR /app

COPY deno.json ./
COPY deno.lock ./
COPY src ./src
COPY migrations ./migrations
COPY seeds ./seeds

RUN deno compile \
  --lock=deno.lock \
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

CMD ["bot"]
