FROM node:23-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN apk update && apk add openssl
RUN npm ci

CMD ["npx", "cross-env", "NODE_ENV=development", "nodemon", "-r", "tsconfig-paths/register", "src/server.ts"]
