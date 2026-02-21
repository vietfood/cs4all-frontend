This document serves as the single source of truth for both human contributors and AI agents working on this project. It must be updated at the end of every working session.

## 1. Current Phase

**Currently in: Phase 2 — Authentication & Progress Tracking**

**Completed in Phase 1 (Separate Content from Frontend):**
- [x] Designed strict frontmatter schema (`subject`, `chapter`, `order`, `exercise`, `author`, `last_updated`, etc.)
- [x] Enforced schema in `src/content.config.ts` using Astro's `zod` collections.
- [x] Created custom Astro Content Layer loader `createGithubLoader` to fetch MDX from the external GitHub repository (`vietfood/cs4all-content`).
- [x] Cleaned up local content directories (`src/content/note`, `src/content/subject`, `src/content/authors`). Let repository build independently using the custom GitHub loader.

**Remaining to complete Phase 2:**
- Configure Astro for SSR/Hybrid mode.
- Setup Auth via Supabase Auth (`@supabase/ssr`) with Google OAuth/Email Magic Link.
- Initialize database: Supabase (Postgres). Create tables `public.profiles` and `public.user_progress` per `DATABASE.md`.
- Connect the existing static checkmark UI to the database table so completion marks update dynamically.

---

## 2. Current State of the Codebase

- **Frontend**: Astro (v5) + React (v19) in SSR / Hybrid mode.
- **Backend**: FastAPI + SGLang (grading) + Supabase Postgres.
- **Styling**: Tailwind CSS (v4) + Shadcn/UI
- **Content**: Content Collections now fetched from `vietfood/cs4all-content` using a custom loader. Strict schema validation is applied via `src/content.config.ts`. Locally cached in `.content/` during build or fetched via `process.env.CONTENT_DIR`.
- **Package Manager**: Use bun strictly

**Directory Structure (High-Level)**:
```text
.
├── AGENTS.md                # This file (Single Source of Truth)
├── docs/                    # Architecture, Backend, Database, and Dev guidelines
├── package.json             # Dependencies and build scripts
├── src/
│   ├── components/          # Astro & React (Shadcn) Components
│   ├── layouts/             # Astro Layouts
│   ├── pages/               # Astro Routing Pages ([...slug].astro, etc)
│   └── content.config.ts    # Defined schemas and loaders (updated for strict validation & remote fetch)
```

**Key Technical Guidelines**:
1.  **Architecture Context**: Read `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, and `docs/BACKEND.md` before making sweeping decisions.
2.  **Build Verification**: Always run `npm run build` (which runs `astro check` and `astro build`). Since there are no unit tests, strict type-checking and schema validation are our primary defense.
3.  **Aliases**: Use `@/components`, `@/lib`, `@/ui`, `@/hooks`.
4.  **Styling**: Use Tailwind utility classes via `className` or `class`. Use `cn(...)` from `@/lib/utils` for merging.
5.  **Content Annotations**: When reviewing/editing notes for correctness or style, do not modify raw text. Use the `<Annotate type="..." note="...">Text</Annotate>` MDX component.

---

## 3. Phased Plan

### Phase 1 — Separate Content from Frontend (COMPLETED)
**Goal:** Decouple the content repo from the frontend repo.
- Ensure strict frontmatter schema exists.
- Create custom Astro Content Layer loader to fetch MDX from external GitHub repo.
- Setup GitHub Actions on content repo to trigger frontend rebuilds.

### Phase 2 — Authentication & Progress Tracking (ACTIVE)
**Goal:** Let users sign in and track which lessons/exercises they've completed.
- Backend Integration: Astro in SSR mode.
- Auth using native Supabase Auth (`@supabase/ssr`).
- Database: Supabase Postgres. Create `public.profiles` and `public.user_progress`.
- Connect the existing checkmark UI to the database table.
- Progress for exercises is only updated after completion of LLM/Human review grading flow (to be built in Phase 3).

### Phase 3 — Exercise Submission & LLM-Assisted Grading
**Goal:** Users attempt exercises, get fast LLM feedback, and a final human-reviewed score that feeds a leaderboard.
- Exercise submission flow via Frontend -> Supabase `exercise_submissions`.
- Supabase Webhook triggers FastAPI backend.
- FastAPI formats prompt with rubric, invokes SGLang, writes score/feedback back to Supabase.
- Human review flow: Side-by-side diff in `/admin/review` panel.

### Phase 4 — Leaderboard & Community Features
**Goal:** Recognize learners and contributors, foster community engagement.
- Leaderboard ranking average final score across completed human-reviewed exercises.
- Discussion threads per lesson.
- LLM-assisted hints using the problem rubric.

---

## 4. Agent Mistake Log

*(No entries yet. Append below as mistakes occur.)*

---

## 5. Session Log

**2026-02-21**
- **What was worked on**: Initialized Phase 1 to decouple content. Defined and enforced the strict frontmatter schema across all local MDX files.
- **Decisions made**: We temporarily deferred the implementation of the `customGithubLoader` to pull from the external `cs4all-content` repo. The decision was made to modify the local MDX files first and verify stability with Astro `glob` and `astro check` before offloading the finalized content to the external repository.

**2026-02-21**
- **What was worked on**: Finalized Phase 1 by confirming that the remote `vietfood/cs4all-content` loader successfully fetches, parses, and type-checks the content. The build was successful. Cleaned up the file system. Proceeded to prepare the foundation and documentation for Phase 2: Authentication and Progress Tracking.
- **Decisions made**: Drafted `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, and `docs/BACKEND.md` to formally document the architectural boundaries between the Astro frontend, Supabase database, and the FastAPI/SGLang Python backend. Elected to use Supabase Auth natively rather than Auth.js. Updated `docs/DEVELOPMENT.md` to reflect these major architectural strides.
