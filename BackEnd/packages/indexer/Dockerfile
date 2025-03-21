FROM node:20-alpine

WORKDIR /app

COPY ../../package*.json ./
RUN npm install --legacy-peer-deps

# COPY package.json /app/package.json
# COPY package-lock.json /app/package-lock.json
# COPY nx.json /app/nx.json 
# COPY tsconfig.base.json /app/tsconfig.base.json
# COPY Dockerfile.indexer /app/Dockerfile.indexer
# COPY docker-compose.indexer.yml /app/docer-compose.indexer.yml
# COPY apps /app/apps
# COPY .nx /app/.nx
# COPY packages/indexer /app/indexer

COPY . .

RUN npx nx reset && npm run build
 
COPY packages/indexer/schema.graphql /app/schema.graphql
COPY packages/indexer/squid.yaml /app/squid.yaml
COPY packages/indexer/tsconfig.json /app/tsconfig.json

EXPOSE 3000

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
