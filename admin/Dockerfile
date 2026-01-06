FROM node:20-alpine

WORKDIR /app

COPY admin/package.json ./package.json
COPY admin/tsconfig.json ./tsconfig.json
COPY admin/vite.config.ts ./vite.config.ts
COPY admin/tailwind.config.cjs ./tailwind.config.cjs
COPY admin/postcss.config.cjs ./postcss.config.cjs
COPY admin/index.html ./index.html

RUN npm install

COPY admin/src ./src
COPY admin/server ./server

EXPOSE 5173

CMD ["npm", "run", "dev"]
