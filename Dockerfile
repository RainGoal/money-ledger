FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5173

RUN apt-get update \
  && apt-get install -y --no-install-recommends gosu \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY public ./public
COPY docker-entrypoint.sh ./

RUN mkdir -p /app/data \
  && sed -i 's/\r$//' /app/docker-entrypoint.sh \
  && chmod +x /app/docker-entrypoint.sh

EXPOSE 5173

VOLUME ["/app/data"]

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
