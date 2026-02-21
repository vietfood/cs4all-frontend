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
4. This file — frontend-specific structure and conventions

---

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
- Initialize database: Supabase (Postgres). Create tables `public.profiles` and `public.user_progress` per `../docs/DATABASE.md`.
- Connect the existing static checkmark UI to the database table so completion marks update dynamically.

---

## 2. Current State of the Codebase

- **Frontend**: Astro (v5) + React (v19) in SSR / Hybrid mode.
- **Backend**: Async grading and structured LLM inference. (Separate repo: `cs4all-backend` - treat as a black box).
- **Styling**: Tailwind CSS (v4) + Shadcn/UI
- **Content**: Content Collections fetched from `vietfood/cs4all-content` using a custom loader. Strict schema validation applied via `src/content.config.ts`. Locally cached in `.content/` during build or fetched via `process.env.CONTENT_DIR`.
- **Package Manager**: Use `bun` strictly. Do not use `npm`, `yarn`, or `pnpm`.

**Directory Structure (High-Level)**:
```text
cs4all-frontend/
├── AGENTS.md                # This file (frontend-local)
├── src/
│   ├── components/          # Astro & React (Shadcn) Components
│   ├── layouts/             # Astro Layouts
│   ├── pages/               # Astro Routing Pages ([...slug].astro, etc.)
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
- Backend handles formatting the prompt, invoking the LLM, and writing the score/feedback back to Supabase. Frontend waits for `status` to change.
- Human review flow: Side-by-side diff in `/admin/review` panel.

### Phase 4 — Leaderboard & Community Features
**Goal:** Recognize learners and contributors, foster community engagement.
- Leaderboard ranking average final score across completed human-reviewed exercises.
- Discussion threads per lesson.
- LLM-assisted hints using the problem rubric.

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