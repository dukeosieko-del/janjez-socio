# janjez.social

Pata Clout Chapchap — Social media growth services platform built with Next.js and Supabase.

Production site: https://janjez.social

## Repo

This repository is the single source of truth for the production site.  
Vercel deploys `https://github.com/dukeosieko-del/janjez-socio` → `main` branch automatically.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values.  
Vercel environment variables are configured separately in the Vercel dashboard.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional:
- `NEXT_PUBLIC_SITE_URL` (defaults to `https://janjez.social`)
- M-Pesa variables for payment integration

## Build

```bash
npm run build
npm start
```

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Supabase Auth + Database
- Tailwind CSS
- Vercel Deployment
