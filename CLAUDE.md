@AGENTS.md

# Emily Tal — Portfolio Website
**Stack: Next.js 14 (App Router) + Supabase + Tailwind CSS + Vercel**

## Project Overview
Portfolio website for Emily Tal, a textile design student. Showcases work from her degree:
textile design, knitting, and screen printing. Bilingual: Hebrew (primary) + English.

## Client Details
- **Name:** Emily Tal
- **Email:** emilytal22@gmail.com
- **Phone:** 0524825858
- **Instagram:** instagram.com/emily_kryzewski
- **Design:** Minimalist, beige (#F5F0E8), chocolate brown (#5C3D2E)

## Tech Stack
- Framework: Next.js 14 (App Router)
- Language: TypeScript (strict)
- Styling: Tailwind CSS
- Database + Auth + Storage: Supabase
- Deployment: Vercel
- Package manager: npm

## Pages
- `/` — Home
- `/about` — About
- `/gallery` — Gallery / Portfolio
- `/contact` — Contact
- `/adminlogin` — Admin login
- `/admin` — Protected admin panel

## Key Conventions
- Server Components by default; `"use client"` only where needed
- All data fetched from Supabase — no localStorage for content
- `lib/supabase/client.ts` for browser, `lib/supabase/server.ts` for server
- Tailwind only — no separate CSS files except `globals.css`
- RTL (`dir="rtl"`) for Hebrew, LTR for English — set on `<html>`
- Fonts: Heebo (Hebrew), Inter (English) via `next/font/google`
- Colors: `beige: #F5F0E8`, `brown: #5C3D2E`

## Common Commands
```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint check
```

## Supabase Migration Workflow
1. Write SQL in `supabase/migrations/`
2. Run in Supabase Dashboard → SQL Editor
3. Tables: pages, gallery_items, messages, contact_info, social_links

## Admin Panel
- URL: /adminlogin
- Language: Hebrew
- Inactivity timeout: 30 minutes
- Force password change on first login

## Deployment
1. Push to GitHub
2. Import to Vercel
3. Add env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
4. Deploy
