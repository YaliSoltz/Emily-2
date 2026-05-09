# Lessons Learned — Emily Tal Portfolio

**Stack:** Next.js 14 App Router · Supabase · Tailwind CSS · Vercel  
**Total commits:** 83 | **Duration:** Full build from scaffolding to launch

---

## 1. BUGS FIXED

### Supabase Password Reset → Redirected to localhost in Production
**File:** `app/layout.tsx`, Supabase Dashboard → Authentication → URL Configuration  
**Symptom:** Reset email link opened localhost instead of the production domain.  
**Root cause:** Supabase validates the `redirectTo` parameter against its allowed-URL list. The production URL was never added, so Supabase fell back to the configured Site URL (localhost).  
**Fix:** Add the production URL to **Redirect URLs** in Supabase Dashboard, and set **Site URL** to the production domain. The code itself (`window.location.origin` as `redirectTo`) was always correct.

### After Password Reset, Redirected to Login Instead of Admin
**File:** `components/admin/AdminResetPasswordClient.tsx`  
**Symptom:** After setting a new password, user was signed out and sent to `/adminlogin`.  
**Root cause:** The handler called `supabase.auth.signOut()` before redirecting — unnecessarily destroying the session that `updateUser` had just established.  
**Fix:** Remove `signOut()` and navigate directly to `/admin`. The session is already active after `updateUser`.

```tsx
// WRONG
await supabase.auth.signOut()
router.push('/adminlogin')

// CORRECT
router.push('/admin')
```

### Password Reset PKCE Flow Broken When Called Server-Side
**Files:** `app/api/admin/reset-password/route.ts`, `components/admin/AdminLoginClient.tsx`  
**Symptom:** Reset email arrived but the link failed to exchange the code for a session.  
**Root cause:** `resetPasswordForEmail` must be called from the **browser** because the PKCE verifier is stored in `localStorage`. Calling it server-side loses the verifier.  
**Fix:** The API route validates that the user exists, then returns success. The client component makes the actual `resetPasswordForEmail` call so the PKCE verifier is stored correctly in the browser.

### Admin Panel Header Not Anchored to Viewport on Mobile
**Files:** `components/admin/AdminTabLayout.tsx`  
**Symptom:** The tab content header scrolled away with the page content on mobile.  
**Root cause:** The layout used a `calc(100svh - 3rem)` container with flex, but the inner `header` wasn't `flex-shrink-0`.  
**Fix:** Add `flex-shrink-0` to the header and `flex-1 min-h-0` to `<main>`. The outer div uses `h-[calc(100svh-3rem)]` on mobile and `h-screen` on desktop.

### Hero Section Jump on Mobile Scroll
**File:** `app/(public)/page.tsx` or hero component  
**Symptom:** The hero section resized/jumped when the mobile browser chrome (URL bar) collapsed on scroll.  
**Root cause:** `dvh` (dynamic viewport height) recalculates as the browser chrome changes size.  
**Fix:** Use `svh` (smallest viewport height) — it locks to the smallest possible viewport so the element never grows when the browser bar collapses.

### Back-to-Site Arrow Pointing Wrong Direction in RTL
**File:** Admin login page component  
**Symptom:** The arrow icon for "back to site" pointed right (→) but in RTL it should point left (←).  
**Fix:** Use `scale-x-[-1]` or swap the icon direction based on `dir`. In RTL, "back" is visually to the right, so the arrow should face left.

### ISR Broke Admin Auth (Middleware Skipped Public Routes Incorrectly)
**File:** `lib/supabase/middleware.ts`  
**Symptom:** Public pages with ISR were triggering Supabase auth checks on every request, causing latency.  
**Root cause:** Middleware was running `getUser()` for every route.  
**Fix:** Skip auth entirely for non-admin routes — exit early and return `NextResponse.next()` without touching Supabase.

```ts
if (!isAdminRoute && !isLoginPage) {
  return NextResponse.next({ request })
}
```

### Admin Middleware Incorrectly Blocked `/adminlogin`
**File:** `lib/supabase/middleware.ts`  
**Symptom:** `/adminlogin` triggered the admin auth guard and redirected to itself infinitely.  
**Root cause:** `isAdminRoute` check used `pathname.startsWith('/admin')`, which matched `/adminlogin`.  
**Fix:** Use `pathname.startsWith('/admin/')` (with trailing slash) or `pathname === '/admin'`.

```ts
const isAdminRoute = pathname.startsWith('/admin/') || pathname === '/admin'
```

### Supabase Realtime Channel Leak in Messages Page
**File:** `app/admin/messages/page.tsx`  
**Symptom:** Multiple Realtime subscriptions accumulating over time.  
**Fix:** Always return a cleanup function from `useEffect` that calls `supabase.removeChannel(channel)`.

### Language Flash on First Page Load
**File:** `app/layout.tsx`, `components/public/LangProvider.tsx`  
**Symptom:** Page briefly rendered in the wrong language (or default) before switching.  
**Root cause:** Language was read client-side from a cookie, causing a hydration mismatch.  
**Fix:** Read the `lang` cookie **server-side** in the root layout and set `lang` and `dir` on `<html>` before any JS runs.

### Email Notification Link Pointed to localhost in Production
**File:** `app/api/contact/route.ts`  
**Symptom:** Admin notification emails contained `localhost:3000/admin/messages` links.  
**Root cause:** URL was hardcoded or inferred from env incorrectly.  
**Fix:** Use `VERCEL_PROJECT_PRODUCTION_URL` env var (always the production domain on Vercel, not the preview URL).

### Floating Buttons (WhatsApp, ScrollToTop, TabNav) Colliding on Mobile
**Files:** `components/public/WhatsAppButton.tsx`, `components/public/ScrollToTop.tsx`, `app/layout.tsx`  
**Symptom:** In RTL mode, all three floating buttons landed in the same corner.  
**Root cause:** TabNav `widgetLocation` was hardcoded to `"right"`, while `start-6` in RTL also resolves to the right side.  
**Fix:**
- WhatsApp: `start-6` (RTL = right, LTR = left)
- ScrollToTop + TabNav: `end-6` and `widgetLocation` dynamic (`lang === 'he' ? 'left' : 'right'`)
- Vertical alignment: TabNav CSS is `bottom: 24px` + `translateY(-50%)` = effective bottom 44px. WhatsApp aligned to 44px (`bottom-11`). ScrollToTop at 92px (`bottom-[5.75rem]`) = 8px gap above TabNav.

### Gallery Cards Uneven Height
**File:** `components/public/GalleryClient.tsx`  
**Symptom:** Cards in the gallery grid had different heights depending on title/description length.  
**Fix:** Fix the text rows to a constant height using `line-clamp` and `h-[...]` on the text container.

### Lightbox Layout Shift on Image Navigation
**File:** `components/public/GalleryClient.tsx`  
**Symptom:** Lightbox panel jumped/reflowed when navigating between images of different sizes.  
**Fix:** Set explicit `height` and `width` on the image container so the panel doesn't resize on image change.

---

## 2. FEATURES ADDED

### Triple-Click Logo Easter Egg → Admin Login
**File:** `components/public/Header.tsx`  
Click the logo 3 times within 1.2 seconds to navigate to `/adminlogin`. Uses `sessionStorage` to track click timestamps. Avoids adding a visible admin link anywhere on the public site.

### Full PKCE Password Reset Flow
**Files:** `app/api/admin/reset-password/route.ts`, `components/admin/AdminLoginClient.tsx`, `app/auth/callback/route.ts`, `app/adminresetpassword/page.tsx`  
Server validates email exists → browser calls `resetPasswordForEmail` (preserves PKCE verifier) → Supabase emails link → `/auth/callback` exchanges code for session → `/adminresetpassword` lets user set new password → redirect to `/admin`.

### ISR Revalidation on All Public Pages
**Files:** All `app/(public)/*/page.tsx`  
`export const revalidate = 3600` on every public page. Combined with a public Supabase client (no auth), pages are served from cache with zero Supabase calls on most requests.

### NProgress Route Transition Bar
**File:** `components/public/NavigationProgress.tsx`, `components/public/NavLink.tsx`  
Thin progress bar at top of viewport on route changes. `NavLink` wraps Next.js `Link` and triggers NProgress on click.

### TabNav Third-Party Accessibility Widget
**File:** `app/layout.tsx`  
Replaced custom accessibility widget with TabNav (`tabnav.com`). Loaded via `next/script` with `strategy="afterInteractive"`. `widgetLocation` is dynamic based on `lang` to match the floating button side. The script token in the `src` URL must never be modified.

### Admin Mobile UX — Tab Title in Top Bar + Sticky Save/Cancel
**Files:** `components/admin/AdminSidebar.tsx`, `components/admin/AdminTabLayout.tsx`, `components/admin/AdminNavContext.tsx`  
- Mobile top bar shows current **tab title** (from `AdminNavContext.mobileTitle`) + hamburger on the left
- Admin header (`h-14`) is `hidden md:flex` — not shown on mobile
- Save/Cancel buttons moved to a `flex-shrink-0` sticky bottom bar (`md:hidden`) so they're always visible during scroll

### Admin Inactivity Timeout
**File:** `components/admin/InactivityGuard.tsx`  
Signs out after 30 minutes of inactivity. Resets on any mouse/keyboard/touch event.

### UnsavedChanges Dialog
**File:** `components/admin/UnsavedDialog.tsx`, `components/admin/AdminNavContext.tsx`  
`AdminNavContext` holds a `registerNavigateAway` callback. When a tab has unsaved changes, it registers a handler. Clicking a sidebar link calls `requestNavigate`, which triggers the dialog if the handler is set. Guards against accidental navigation.

### Bilingual Legal Pages
**Files:** `app/(public)/privacy/page.tsx`, `app/(public)/terms/page.tsx`, `app/(public)/accessibility/page.tsx`  
GDPR / Israeli Privacy Law Amendment 13 compliant. Privacy policy documents: data collected, retention periods, third-party processors (Supabase, Resend, TabNav, Vercel). Terms of use bilingual. Accessibility statement references TabNav as the certified provider.

---

## 3. THINGS THAT WORKED WELL

### `@supabase/ssr` for Clean Server/Client Separation
`lib/supabase/server.ts` (uses `cookies()`) for Server Components and API routes. `lib/supabase/client.ts` (uses `createBrowserClient`) for Client Components. Never mix them. Middleware uses its own `createServerClient` with request/response cookies.

### Tailwind Logical Properties for RTL/LTR
Using `start-*` / `end-*` / `ps-*` / `pe-*` instead of `left-*` / `right-*` / `pl-*` / `pr-*` automatically handles RTL/LTR switching without any conditional logic in component code. Apply it from day one.

```tsx
// Good — RTL-aware
className="fixed bottom-11 start-6"

// Bad — hardcoded direction
className="fixed bottom-11 right-6"
```

### AdminTabLayout as a Consistent Wrapper
Every admin tab uses `<AdminTabLayout title="..." hasChanges={...} onSave={...} onCancel={...}>`. This gives all tabs the same header, save/cancel UX, unsaved dialog, and mobile bottom bar for free. Adding a new tab requires zero layout work.

### AdminNavContext for Cross-Component State
Using React Context to share `mobileTitle` and `registerNavigateAway` between `AdminSidebar` (which renders the top bar) and `AdminTabLayout` (which knows the current title and unsaved state) avoids prop drilling through the entire admin shell.

### ISR + Public Supabase Client = Fast Public Pages with Zero Auth Overhead
Public pages use `createClient` (public, no auth) + `revalidate = 3600`. Content updates in the admin panel revalidate via `revalidatePath`. Pages load from edge cache most of the time.

### Supabase RLS Policies: Public Read, Authenticated Write
Every table has:
- `FOR SELECT USING (true)` — anyone can read
- `FOR ALL USING (auth.uid() IS NOT NULL)` — only authenticated users can write

Simple, effective. No service role key needed on public routes.

### Server Components by Default
Only 9 of 26 component files use `"use client"`. Most data fetching happens in Server Components. This keeps the JS bundle small and makes pages fast by default.

### `window.location.origin` for Dynamic Redirect URLs
Instead of hardcoding the domain in the password reset flow, using `window.location.origin` makes the code work correctly in both dev and production. The only requirement is that both URLs are in Supabase's allowed redirect list.

---

## 4. THINGS TO AVOID

### Setting Supabase Site URL to localhost and Forgetting Production
**What happened:** Password reset emails in production redirected to localhost.  
**Rule:** The moment you connect Supabase to a production deployment, add the production URL to:
1. Authentication → URL Configuration → Site URL
2. Authentication → URL Configuration → Redirect URLs

### `dvh` for Full-Height Sections on Mobile
**What happened:** Hero section jumped when the mobile browser URL bar collapsed.  
**Rule:** Always use `svh` (or `min-svh`) for full-height mobile sections. `dvh` changes continuously as the browser chrome moves; `svh` is locked to the smallest viewport.

### Calling `resetPasswordForEmail` Server-Side
**What happened:** Password reset links arrived but failed to create sessions.  
**Rule:** Any Supabase Auth method that uses PKCE (`signInWithOtp`, `resetPasswordForEmail`, `signInWithOAuth`) **must** be called from the browser. The PKCE `code_verifier` is stored in `localStorage` on the browser that initiates the call, and the callback must arrive on the same browser.

### Multiple Floating Buttons Without a Layout Plan
**What happened:** WhatsApp, ScrollToTop, and TabNav all landed in the same corner on mobile (RTL).  
**Rule:** Before adding any floating button, decide:
- Which corner(s) are used (use `start`/`end` for RTL/LTR awareness)
- The exact `bottom` values (calculate from actual widget CSS, not guesses)
- How third-party widgets configure their position (read their CSS before choosing your offsets)

### Supabase Realtime Without Cleanup
**What happened:** Channel subscriptions accumulated across re-renders.  
**Rule:** Always clean up:
```tsx
useEffect(() => {
  const channel = supabase.channel('...').on(...).subscribe()
  return () => { supabase.removeChannel(channel) }
}, [])
```

### Hardcoding URLs in Email Templates
**What happened:** Admin notification emails linked to `localhost:3000`.  
**Rule:** Always use `VERCEL_PROJECT_PRODUCTION_URL` (not `VERCEL_URL`, which is the preview deployment URL) for links in emails.

### Using `startsWith('/admin')` to Detect Admin Routes
**What happened:** `/adminlogin` matched the admin route guard and caused an infinite redirect.  
**Rule:** Always use `pathname.startsWith('/admin/')` (with trailing slash) `|| pathname === '/admin'`.

### `outline: none` Without a Visible Focus Replacement
**Rule:** The CLAUDE.md compliance checklist requires every interactive element to have a `:focus-visible` style. The global ring in `globals.css` handles this — never override it with `focus:outline-none` unless you add an equivalent visible indicator.

---

## 5. IMPROVEMENTS FOR NEXT PROJECT

### From Day One: Supabase URL Configuration
Before writing a single line of code, open Supabase Dashboard → Authentication → URL Configuration and add:
- **Site URL:** production domain
- **Redirect URLs:** `https://your-domain.com/auth/callback`, `http://localhost:3000/auth/callback`

### From Day One: Use `svh` Not `dvh`
Set a global convention: all full-height mobile containers use `svh`. Never `dvh`. Add a comment in `globals.css` as a reminder.

### From Day One: Define the Floating Button Zone
Before building any floating button, sketch both RTL and LTR:
- Left/end side: accessibility widget + scroll-to-top (stacked)
- Right/start side: WhatsApp
- Use `start-*` / `end-*` throughout — zero conditional direction logic needed

### From Day One: Use Tailwind Logical Properties Everywhere
Add a note to CLAUDE.md: **never use `left-*`, `right-*`, `pl-*`, `pr-*`, `ml-*`, `mr-*`** — use `start-*`, `end-*`, `ps-*`, `pe-*`, `ms-*`, `me-*`. This avoids a whole class of RTL bugs.

### From Day One: Admin Mobile UX Architecture
Decide before building:
- Mobile top bar = tab title + hamburger (title on start/right in RTL, hamburger on end/left)
- Save/cancel buttons = sticky bottom bar on mobile, in header on desktop
- Drawer header = logo (start) + subtitle + X (end) — matching the public site pattern
- Use `AdminNavContext` to pass `mobileTitle` from tabs to the sidebar

This avoids multiple rounds of refactoring the admin layout.

### From Day One: ISR on Public Pages
Add `export const revalidate = 3600` to every public page from the first commit. Pair with `revalidatePath` calls in admin save handlers. Don't add it as an afterthought.

### From Day One: CLAUDE.md Compliance Rules
The legal and accessibility rules in CLAUDE.md (GDPR, Amendment 13, WCAG 2.2) should be present from the very first commit, not added mid-project. They shape decisions like font loading (no Google Fonts CDN), analytics (none without consent), and form design (privacy notices).

### Prefer `AdminTabLayout` Pattern for Any Admin-Like Interface
The `registerNavigateAway` / `UnsavedDialog` / sticky save bar pattern is reusable and should be scaffolded from the first admin tab. Don't build one-off save/cancel UIs per tab.

### Read Third-Party Widget CSS Before Positioning Your Own Buttons
TabNav's effective rendered position required reading its actual CSS (`bottom: 24px` + `translateY(-50%)` = effective 44px bottom, 40px height). Always inspect the widget's rendered output before hardcoding `bottom` values for nearby elements.

### Test RTL and LTR from the First Page
Every page should be tested in both directions before moving on. Direction bugs compound — a `left-*` that slips through on page 1 creates a pattern that propagates to all subsequent pages.
