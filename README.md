# Emily Tal — Portfolio Website

A minimalist bilingual portfolio website (Hebrew + English) for textile designer Emily Tal.
Built with Next.js 14, Supabase, and Tailwind CSS.

## Setup

### 1. Clone and install
```bash
git clone <repo-url>
cd emily
npm install
```

### 2. Environment variables
```bash
cp .env.example .env.local
```
Fill in `.env.local` with your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL from Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon/Public key
- `SUPABASE_SERVICE_ROLE_KEY` — Service Role key (keep secret, server-side only)

### 3. Supabase setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/migrations/0001_initial_schema.sql`
3. Go to Storage → Create bucket named `public-images` (set to public)
4. Go to Authentication → Users → Add User → enter admin email + password

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Admin Panel
- URL: `/adminlogin`
- Login with the admin user created in Supabase Auth
- First login will require a password change

## Deployment (Vercel)
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Add environment variables (same as `.env.local`)
4. Click Deploy
5. (Optional) Connect custom domain in Vercel → Domains

## Commands
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Lint check
```
