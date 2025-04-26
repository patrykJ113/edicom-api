FROM node:23-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN apk update && apk add --no-cache openssl
RUN npm ci

CMD ["sh", "./start.sh"]
