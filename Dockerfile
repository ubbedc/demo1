FROM node:20-bookworm-slim

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies with fast flags
RUN npm install --no-audit --no-fund

# Copy source code and build React & TypeScript
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["npx", "tsx", "server/src/server.ts"]
