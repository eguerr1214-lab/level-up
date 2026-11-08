# LEVEL UP — production image
FROM node:24-bookworm-slim AS base

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Apply the distributor's fixed OS packages in the same layer.
RUN apt-get update \
 && apt-get upgrade -y --no-install-recommends \
 && rm -rf /var/lib/apt/lists/*

# Dependencies first for layer caching.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
 && npm cache clean --force

COPY server.js ./
COPY public ./public

# Writable data dir for the JSON account store, owned by the runtime user.
RUN mkdir -p /app/data && chown -R node:node /app/data

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
