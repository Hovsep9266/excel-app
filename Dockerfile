FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/

RUN npm ci && npm --prefix server ci

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

EXPOSE 4000

CMD ["node", "server/index.js"]
