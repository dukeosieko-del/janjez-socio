FROM node:22-alpine AS base
RUN apk add --no-cache curl ca-certificates
WORKDIR /app

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm ci && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -u 1001 -S nextjs -S group
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone:./ ./
COPY --from=builder /app/.next/static:./.next/static ./

USER nextjs
EXPOSE 3000
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.scripts={start:'node server.js'};fs.writeFileSync('package.json',JSON.stringify(p,null,2))"
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD curl -f http://localhost:3000 || exit 1
CMD ["node", "server.js"]