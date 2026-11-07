FROM node:24.16.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY app.js ./

USER node

EXPOSE 8080

CMD ["node", "app.js"]