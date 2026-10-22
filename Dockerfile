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

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so
# they must be present during "next build" (env files are excluded from the
# build context by .dockerignore).
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_MPESA_ENV
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_MPESA_ENV=$NEXT_PUBLIC_MPESA_ENV
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID

# Cap the V8 heap so an out-of-memory condition surfaces as a catchable JS
# error instead of the kernel OOM-killing the build (this host has 3.7 GB RAM
# and BuildKit will otherwise commit a partial layer to its cache).
ENV NODE_OPTIONS=--max-old-space-size=1024

RUN npm ci && npm run build

# Inherit from base so the runner has curl (required by HEALTHCHECK) and
# ca-certificates. Building the runner from a bare node:22-alpine leaves the
# healthcheck permanently failing with "curl: executable file not found".
FROM base AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -u 1001 -S nextjs -S group
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.scripts={start:'node server.js'};fs.writeFileSync('package.json',JSON.stringify(p,null,2))"
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD curl -f http://localhost:3000 || exit 1
CMD ["node", "server.js"]