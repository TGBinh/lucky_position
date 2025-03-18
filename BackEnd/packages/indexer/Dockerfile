FROM node:16-alpine

WORKDIR /app

COPY ../../package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

COPY packages/indexer/schema.graphql /app/schema.graphql
COPY packages/indexer/tsconfig.json /app/tsconfig.json

EXPOSE 3000

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
