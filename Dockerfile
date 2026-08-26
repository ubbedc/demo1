FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
RUN apk add --no-cache python3 make g++

ENV NODE_ENV=production
ENV PORT=10000

COPY --from=builder /app ./

EXPOSE 10000

CMD ["npm", "start"]
