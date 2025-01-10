FROM node:20-alpine3.17

WORKDIR /app

CMD node -r ts-node/register src/server.ts

COPY tsconfig.json tsconfig.json
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm i --omit=dev


COPY src src/





