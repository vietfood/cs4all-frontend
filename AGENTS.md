# AGENTS.md — cs4all-frontend
# Location: `cs4all-frontend/AGENTS.md`
#
# MANDATORY: Read `docs/AGENTS.md` (one level up, at the monorepo root) FIRST
# before reading this file. This file only covers frontend-specific conventions.
# Cross-repo contracts, shared prohibitions, and global state live in `docs/AGENTS.md`.

---

## 0. Mandatory Reading Order

1. `../docs/AGENTS.md` — global prohibitions, shared contracts, current phase
2. `../docs/DATABASE.md` — full schema and RLS definitions
3. `../docs/ARCHITECTURE.md` — system interaction flow (read before sweeping changes)
4. `docs/BACKEND_USAGE.md` — how the frontend interacts with the backend API
5. This file — frontend-specific structure and conventions

---

## 1. Current Phase

**Currently in: Phase 3.5 — LLM-Assisted Grading Integration (PENDING)**

**Completed in Phase 1 (Separate Content from Frontend):**
- [x] Designed strict frontmatter schema.
- [x] Enforced schema in `src/content.config.ts`.
- [x] Created custom Astro Content Layer loader `createGithubLoader`.
- [x] Cleaned up local content directories.

**Completed in Phase 2 (Frontend Auth):**
- [x] Configure Astro for SSR mode (Vercel adapter installed).
- [x] Setup Auth via Supabase Auth (`@supabase/ssr`) with Magic Link logic and API Endpoint setup.
- [x] Initialize database: Human executed migrations successfully.
- [x] Connect the static checkmark UI to the database table dynamically on the curriculum page.

**Completed in Phase 3 (Frontend Exercise Submission):**
- [x] Implement the `ExerciseSubmission` UI to push solutions to `exercise_submissions`.
- [x] Implement the `admin/review` panel utilizing the Phase 3 backend APIs for side-by-side diff human grading.

---

## 2. Current State of the Codebase

- **Frontend**: Astro (v5) + React (v19) in SSR / Hybrid mode.
- **Backend**: Async grading and structured LLM inference. (Separate repo: `cs4all-backend` - treat as a black box).
- **Styling**: Tailwind CSS (v4) + Shadcn/UI
- **Content**: Content Collections fetched from `vietfood/cs4all-content` using a custom loader. Strict schema validation applied via `src/content.config.ts`. Locally cached in `.content/` — auto-clones from GitHub if missing, pulls latest in production builds.
- **Package Manager**: Use `bun` strictly. Do not use `npm`, `yarn`, or `pnpm`.

**Directory Structure (High-Level)**:
```text
cs4all-frontend/
├── AGENTS.md                # This file (frontend-local)
├── .content/                # Local clone of cs4all-content (git-ignored)
├── src/
│   ├── components/
│   │   ├── blog/            # MDX-facing Astro components (Callout, ExerciseBlock, Question, Solution, etc.)
│   │   └── ui/              # React components (exercise-block, mark-as-read, login-dialog, profile-stats, etc.)
│   ├── layouts/             # Astro Layouts
│   ├── pages/               # Astro Routing Pages ([...slug].astro, profile.astro, admin/review.astro, etc.)
│   └── content.config.ts    # Schemas and loaders — source of truth for MDX frontmatter schema
├── patches/                 # Patch files for dependency fixes
├── public/                  # Static assets
├── astro.config.ts
├── package.json
└── tsconfig.json

../docs/                     # Cross-repo architecture documentation (read-only for agents)
├── AGENTS.md                # Master orchestration file — READ FIRST
├── ARCHITECTURE.md
├── BACKEND.md
├── DATABASE.md
├── DEVELOPMENT.md
└── FRONTEND_PLAN.md
```

> **Backend API reference**: See `docs/BACKEND_USAGE.md` for endpoints, auth, TypeScript types, and code examples.

---

## 3. Frontend-Specific Technical Guidelines

1. **Architecture Context**: Read `../docs/ARCHITECTURE.md`, `../docs/DATABASE.md`, and `../docs/BACKEND.md` before making sweeping decisions.
2. **Build Verification**: Always run `bun run build` (which runs `astro check` and `astro build`). Since there are no unit tests, strict type-checking and schema validation are our primary defense. A passing build is required before considering any task complete.
3. **Aliases**: Use `@/components`, `@/lib`, `@/ui`, `@/hooks` for imports.
4. **Styling**: Use Tailwind utility classes via `className` or `class`. Use `cn(...)` from `@/lib/utils` for conditional merging.
5. **Content Annotations**: When reviewing or editing notes for correctness or style, do not modify raw MDX text directly. Use the `<Annotate type="..." note="...">Text</Annotate>` MDX component.
6. **Supabase Client**: Always use the anon key + user JWT in frontend code. The `SERVICE_ROLE_KEY` must never appear here — see `../docs/AGENTS.md` Section 2.3.
7. **Exercise Submissions**: The frontend may only INSERT rows with `status = 'submitted'`. It must never UPDATE `llm_score`, `llm_feedback`, `reviewer_score`, or `final_score` — see `../docs/AGENTS.md` Section 2.4.
8. **Frontmatter Schema**: `src/content.config.ts` is the source of truth for the MDX frontmatter schema. Any change here must be flagged in `../docs/AGENTS.md` Section 4.4, as it affects the backend's rubric-parsing logic.

---

## 4. Phased Plan

### Phase 1 — Separate Content from Frontend (COMPLETED)
**Goal:** Decouple the content repo from the frontend repo.
- Ensure strict frontmatter schema exists.
- Create custom Astro Content Layer loader to fetch MDX from external GitHub repo.
- Setup GitHub Actions on content repo to trigger frontend rebuilds.

### Phase 2 — Auth, Progress Tracking & Backend MVP Setup
**Goal:** Let users sign in and track which lessons/exercises they've completed.
- Backend Integration: Astro in SSR mode.
- Auth using native Supabase Auth (`@supabase/ssr`).
- Database: Supabase Postgres. Run migrations from `cs4all-backend/supabase/migrations/`.
- Connect the existing checkmark UI to the database table.
- Progress for exercises is only updated after completion of Human review grading flow.
- Backend MVP: ✅ COMPLETE (Phases 2 & 3 done in `cs4all-backend`).

### Phase 3 — Exercise Submission & Human Review Workflow
**Goal:** Users attempt exercises and submit them for manual human review.
- Exercise submission flow via Frontend -> Supabase `exercise_submissions`.
- Supabase Webhook triggers FastAPI backend.
- Human review flow: Side-by-side diff in `/admin/review` panel. Frontend waits for `status` to change to `human_reviewed`.

### Phase 3.5 — LLM-Assisted Grading Integration
**Goal:** Users attempt exercises, get fast LLM feedback before human review.
- Backend handles formatting the prompt, invoking the LLM, and writing the score/feedback back to Supabase. 
- Frontend waits for `status` to change to `ai_graded` and renders initial `llm_score` and `llm_feedback`.

### Phase 4 — Profile, Leaderboard & Community Features
**Goal:** Personal dashboard, progress tracking, community engagement.
- Profile page (`/profile`): user stats, per-subject progress, recent submissions.
- Exercise decomposition: Astro wrappers (`ExerciseBlock.astro`, `Question.astro`, `Solution.astro`) + React interactive component.
- Per-exercise submissions using `lessonId#exerciseId` pattern.
- `MarkAsRead` button for lesson completion tracking.
- Draft banner for `draft: true` content.
- `LoginDialog` with shadcn Dialog + Sonner toasts.
- `ProgressOverlay` client-side island for prerendered syllabus pages.
- ✅ Profile, exercise decomposition, progress, login, draft indicators: COMPLETE.
- ⏳ Leaderboard, discussion threads, LLM hints: PENDING.

---

## 5. Agent Mistake Log

*(No entries yet. Append below as mistakes occur.)*

---

## 6. Session Log

**2026-02-21**
- **What was worked on**: Initialized Phase 1 to decouple content. Defined and enforced the strict frontmatter schema across all local MDX files.
- **Decisions made**: We temporarily deferred the implementation of the `customGithubLoader` to pull from the external `cs4all-content` repo. The decision was made to modify the local MDX files first and verify stability with Astro `glob` and `astro check` before offloading the finalized content to the external repository.

**2026-02-21**
- **What was worked on**: Finalized Phase 1 by confirming that the remote `vietfood/cs4all-content` loader successfully fetches, parses, and type-checks the content. The build was successful. Cleaned up the file system. Proceeded to prepare the foundation and documentation for Phase 2: Authentication and Progress Tracking.
- **Decisions made**: Drafted `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, and `docs/BACKEND.md` to formally document the architectural boundaries between the Astro frontend, Supabase database, and the FastAPI/SGLang Python backend. Elected to use Supabase Auth natively rather than Auth.js. Updated `docs/DEVELOPMENT.md` to reflect these major architectural strides.

**2026-02-21**
- **What was worked on**: Rewrote the architectural plan to replace SGLang and local LLM inference with Langchain orchestrating commercial LLM APIs. Updated all documentation references including `DEVELOPMENT.md`, `BACKEND.md`, `ARCHITECTURE.md`, and the `AGENTS.md` orchestration files.
- **Decisions made**: Transitioned from a locally-hosted SGLang model to commercial LLM APIs via Langchain for structured output scoring, reducing infrastructure overhead while maintaining deterministic JSON grading.

**2026-02-21**
- **What was worked on**: Rewrote the Phased breakdown to split Phase 3 into Human Review (Phase 3) and LLM-Grading (Phase 3.5), allowing progress to start on scaffolding the MVP backend in Phase 2.
- **Decisions made**: Backend MVP will happen in Phase 2, establishing core structure before LLM complexities are introduced.

**2026-02-22**
- **What was worked on**: Updated all documentation to reflect Phase 2+3 backend completion.
- **Files updated**: `docs/ARCHITECTURE.md` (rewritten with current tech stack, mermaid diagrams), `docs/BACKEND.md` (rewritten with all 5 endpoints and maintenance rules), `docs/DEVELOPMENT.md` (Phase 2+3 marked complete), `cs4all-frontend/AGENTS.md` (phase status, reading order, session log).
- **Files created**: `docs/BACKEND_USAGE.md` (comprehensive frontend API guide with TypeScript types).
**2026-02-22**
- **What was worked on**: Implemented Phase 2 Authentication and Phase 3 Exercise Submission flow in the frontend. 
- **Files updated**: `astro.config.ts`, `src/pages/[subject]/index.astro`, `src/components/Header.astro`, `ts`, `AGENTS.md`.
- **Files created**: `src/lib/supabase.ts`, `src/lib/supabase-client.ts`, `src/pages/api/auth/*`, `src/components/AuthButton.astro`, `src/components/ui/exercise-submission.tsx`, `src/components/admin/review-form.tsx`, `src/pages/admin/review.astro`.
- **Decisions made**: Selected Vercel adapter for SSR due to app routing requirements. Handled both server-side Astro API endpoints and client-side database interactions natively rather than introducing intermediaries. Both Phase 2 and 3 frontend requirements are complete.

**2026-02-22**
- **What was worked on**: Phase 4 frontend features — exercise decomposition, profile page, progress tracking, login UX, draft indicators, content loader cleanup.
- **Files created**: `src/components/blog/ExerciseBlock.astro`, `src/components/blog/Question.astro`, `src/components/blog/Solution.astro`, `src/components/ui/exercise-block.tsx`, `src/components/ui/exercise-question.tsx`, `src/components/ui/exercise-solution.tsx`, `src/components/ui/login-dialog.tsx`, `src/components/ui/progress-overlay.tsx`, `src/components/ui/mark-as-read.tsx`, `src/components/ui/profile-stats.tsx`, `src/pages/profile.astro`.
- **Files updated**: `src/content.config.ts` (simplified loader — `.content/` dir, auto-clone), `src/pages/[subject]/[...slug].astro` (ExerciseSubmission conditional, MarkAsRead button, draft banner), `src/components/AuthButton.astro` (LoginDialog, getSession→getUser), `src/components/ui/exercise-submission.tsx` (.single()→.maybeSingle()), `src/layouts/Layout.astro` (Toaster), `src/pages/admin/review.astro` (getUser+getSession pattern), `.content/note/prml/1-exercise/index.mdx` (ExerciseBlock/Question/Solution wrappers).
- **Decisions made**: Exercise components use Astro wrapper pattern (MDX imports .astro which handles `client:load` to React). Per-exercise submission via `lessonId#exerciseId`. Content loader simplified to always use `.content/` dir. Profile page uses prerenderable lesson metadata + client-side Supabase queries.