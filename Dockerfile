# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime Stage ---
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/build ./build
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/scripts ./scripts
COPY start.sh ./
RUN chmod +x start.sh
EXPOSE 3000
CMD ["sh", "start.sh"]