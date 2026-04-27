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

---

## ⚖️ Legal & Compliance — MANDATORY for every change

These rules apply to **every** code change, no exceptions.

### 🔒 GDPR / Israeli Privacy Law (Amendment 13, effective 14.8.2025)

- **NO external font/script/image requests from HTML or SVG files.** All fonts are self-hosted via `next/font/google` (downloaded at build time). Never add `@import url('https://fonts.googleapis.com/...')` anywhere — not in CSS, not in SVG files, not in `<style>` tags. This sends the visitor's IP to Google without consent.
- **NO third-party analytics, pixels, or tracking scripts** (no Google Analytics, Meta Pixel, Hotjar, etc.) without a proper cookie consent banner and privacy policy update.
- **Any new form that collects personal data** must display a privacy notice near the submit button: what the data is used for, how long it is retained, and a link to `/privacy`.
- **Any new data stored in Supabase** must be documented in `/privacy` (what, why, retention period).
- **No new cookies** beyond the existing `lang` preference cookie without updating `/privacy` and adding a consent mechanism if the cookie is non-functional.

### ♿ Accessibility — WCAG 2.2 AA + Israeli Standard 5568

- Every **interactive element** (button, link, input, select) must have a visible `:focus-visible` style. The global ring in `globals.css` handles this — do not use `outline: none` or `focus:outline-none` on interactive elements without replacing it with an equivalent visible indicator.
- Every `<img>` and `<Image>` must have a meaningful `alt` attribute. Decorative images use `alt=""` and `aria-hidden="true"`.
- Every icon-only button must have `aria-label`.
- Modals/dialogs must have `role="dialog"` `aria-modal="true"` and a focus trap.
- Dynamic status changes (form success/error) must use `role="alert"` or `aria-live="polite"`.
- Minimum touch target: 44×44px for primary actions, 24×24px minimum for any interactive element.
- Color contrast: text on background must meet 4.5:1 (normal text) or 3:1 (large text ≥18px / bold ≥14px). Never use opacity below `/60` for informational text on light backgrounds, or below `/70` on dark backgrounds.

### 📜 Copyright & Intellectual Property

- **No third-party SVG logos** (brand icons) copied from unofficial sources. Use lucide-react icons or official brand kits only.
- **No stock images** without a license that explicitly permits use on a commercial website.
- **All content on the site belongs to Emily Tal.** Do not add placeholder or sample content from other creators.
- **No npm packages with GPL/LGPL/AGPL licenses** — only MIT, ISC, Apache 2.0, or BSD licenses are permitted.

### 📄 Legal Pages — Keep Updated

The following pages must stay accurate. Update them whenever the relevant behavior changes:
- `/privacy` — update if: new data is collected, new third-party processors added, retention periods change, new cookies added.
- `/terms` — update if: permitted/prohibited uses change.
- `/accessibility` — update if: new assistive technology is supported or a known limitation is resolved.

### ✅ Pre-commit Checklist

Before every commit, verify:
1. No `@import url('https://fonts.google...')` anywhere in the codebase
2. No new external CDN requests added (check `<link>`, `<script>`, `<img src="http...">`)
3. All new interactive elements have `aria-label` or visible text
4. All new `<img>` / `<Image>` have `alt`
5. No hardcoded personal data (emails, phones) outside of authorized locations (`/contact`, `/privacy`, footer)
6. `npm run build` passes with zero errors
