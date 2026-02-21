# Phase 2 Implementation Plan: Authentication & Progress Tracking

## Goal
Implement user authentication (Google OAuth / Email Magic Link) and track user progress on lessons. We will use Astro in SSR mode with **Supabase** for both the Postgres database and Auth.

## User Review Required

> [!IMPORTANT]
> **Auth Decision**: The original plan suggested `Auth.js` or `Lucia`. Since you are prioritizing **Supabase**, I strongly recommend using **Supabase Auth natively** (via `@supabase/ssr`) rather than adding a third-party auth library. Supabase Auth has excellent built-in support for Google OAuth, Magic Links, and SSR in Astro, keeping the stack leaner. Is this acceptable?

> [!WARNING]
> **Environment Configuration**: We will need you to create a Supabase project and provide the `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` as environment variables for local testing.

## Proposed Changes

### Configuration
#### [MODIFY] [astro.config.ts](file:///Users/nguyen/Documents/Workspace/GitHub/cs4all-vn/astro.config.ts)
- Set `output: 'hybrid'` (or `'server'`) to enable SSR for auth API routes while keeping content pages static/pre-rendered where possible.
- Configure Vercel adapter for SSR.

#### [MODIFY] [package.json](file:///Users/nguyen/Documents/Workspace/GitHub/cs4all-vn/package.json)
- Add `@supabase/supabase-js`, `@supabase/ssr`, and `@supabase/auth-helpers-react` (if needed for client-side hooks).

---

### Supabase & Auth Setup (New Files)
#### [NEW] [src/lib/supabase.ts](file:///Users/nguyen/Documents/Workspace/GitHub/cs4all-vn/src/lib/supabase.ts)
- Initialize the Supabase client using environment variables.

#### [NEW] [src/middleware.ts](file:///Users/nguyen/Documents/Workspace/GitHub/cs4all-vn/src/middleware.ts)
- Implement Astro middleware to validate the Supabase session via cookies on every request.
- Attach the user object to `Astro.locals` for easy access in components and pages.

#### [NEW] [src/pages/api/auth/callback.ts](file:///Users/nguyen/Documents/Workspace/GitHub/cs4all-vn/src/pages/api/auth/callback.ts)
- SSR endpoint to exchange the auth code for a session cookie after Google OAuth or Magic Link login.

#### [NEW] [src/pages/api/auth/signout.ts](file:///Users/nguyen/Documents/Workspace/GitHub/cs4all-vn/src/pages/api/auth/signout.ts)
- SSR endpoint to clear cookies and sign the user out.

---

### Database Schema
We will use the schema defined in [docs/DATABASE.md](file:///Users/nguyen/Documents/Workspace/GitHub/cs4all-vn/docs/DATABASE.md) which consists of `public.profiles` and `public.user_progress`. You will need to run the SQL provided in [docs/DATABASE.md](file:///Users/nguyen/Documents/Workspace/GitHub/cs4all-vn/docs/DATABASE.md) within your Supabase SQL Editor.

---

### User Interface
#### [NEW] [src/components/AuthStatus.tsx](file:///Users/nguyen/Documents/Workspace/GitHub/cs4all-vn/src/components/AuthStatus.tsx)
- UI component for the navbar: "Sign In" button if logged out, or "Profile / Sign Out" if logged in.
- "Sign In" will trigger a modal or redirect to a login page.

#### [NEW] [src/pages/login.astro](file:///Users/nguyen/Documents/Workspace/GitHub/cs4all-vn/src/pages/login.astro)
- Simple login page allowing Google OAuth and Magic Link submission.

#### [MODIFY] Checkmark UI
- Hook the existing static checkmarks next to lessons to fetch completion status from Supabase (or inject via SSR from `Astro.locals`).

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure Astro still builds correctly with the SSR adapter.

### Manual Verification
1. Open the dev server (`npm run dev`).
2. Navigate to `/login` and submit an email for Magic Link OR click the Google OAuth button.
3. Assert that clicking the link/Google account successfully logs the user in and redirects to the homepage.
4. The Navbar should display the authenticated state.
5. Manually insert a completed lesson row into the `user_progress` table for this user in Supabase.
6. Verify that the checkmark UI shows "completed" (green) for that specific lesson.
