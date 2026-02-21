# Backend API Usage Guide

> **For frontend developers.** This document describes how the Astro frontend interacts with the FastAPI backend. Updated after every backend API change.
>
> **Last updated: 2026-02-22** — Phase 3 complete.

---

## Base URL

| Environment | URL |
|---|---|
| Local dev | `http://localhost:8000` |
| Production | Set via `PUBLIC_BACKEND_URL` env var |

---

## Authentication

The backend uses **Supabase JWT tokens** for admin endpoints. The frontend obtains these tokens from `@supabase/ssr` after user login.

```typescript
// Get the session token from Supabase
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Use it in API calls
const response = await fetch(`${BACKEND_URL}/api/v1/admin/submissions`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

> **Note**: Only users with `profiles.is_admin = true` can access admin endpoints. Regular users will receive a 403 Forbidden.

---

## Endpoints

### 1. Health Check

```
GET /api/v1/health
```

**Auth**: None required.

**Response** (`200 OK` or `503 Service Unavailable`):

```json
{
  "status": "healthy",
  "supabase": "connected",
  "redis": "connected",
  "environment": "development"
}
```

**Frontend usage**: Call this to verify the backend is reachable before showing grading-related UI.

---

### 2. Webhook — Grade Submission

```
POST /api/v1/grade
```

**Auth**: Optional HMAC via `X-Webhook-Secret` header.

> **⚠️ The frontend does NOT call this endpoint directly.** It is triggered automatically by a Supabase Database Webhook when a new row is inserted into `exercise_submissions`. The frontend's job is to INSERT the row into Supabase — the webhook handles the rest.

**Frontend submission flow:**

```typescript
// The frontend inserts the submission into Supabase (anon key + user JWT)
const { error } = await supabase
  .from('exercise_submissions')
  .insert({
    user_id: session.user.id,
    lesson_id: '1-1/intro',
    content: userSolution,       // Markdown/LaTeX string
    status: 'submitted',         // MUST be 'submitted'
  });
```

After insert, the Supabase webhook fires to `POST /api/v1/grade`, and the backend enqueues the submission for processing.

---

### 3. Admin — List Submissions

```
GET /api/v1/admin/submissions
```

**Auth**: Admin JWT required (`Authorization: Bearer <token>`).

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `submission_status` | string | (all) | Filter: `submitted`, `ai_graded`, `human_reviewed` |
| `page` | int | 1 | Page number (1-indexed) |
| `page_size` | int | 20 | Items per page (max 100) |

**Response** (`200 OK`):

```json
{
  "submissions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "lesson_id": "1-1/intro",
      "content": "User's solution text...",
      "llm_score": null,
      "llm_feedback": null,
      "reviewer_score": null,
      "final_score": null,
      "status": "submitted",
      "submitted_at": "2026-02-21T15:00:00Z",
      "reviewed_at": null
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20
}
```

**Error responses:**
- `401`: Missing or invalid JWT
- `403`: Valid JWT but user is not an admin

---

### 4. Admin — View Submission Detail

```
GET /api/v1/admin/submissions/{submission_id}
```

**Auth**: Admin JWT required.

**Response** (`200 OK`): Same shape as a single item in the list above.

**Error responses:**
- `401`/`403`: Auth failure
- `404`: Submission not found

---

### 5. Admin — Review Submission

```
POST /api/v1/admin/submissions/{submission_id}/review
```

**Auth**: Admin JWT required.

**Request body:**

```json
{
  "reviewer_score": 85,
  "reviewer_comment": "Optional notes for context"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `reviewer_score` | int | ✅ | 0–100 |
| `reviewer_comment` | string | ❌ | Max 5000 chars |

**Response** (`200 OK`):

```json
{
  "status": "reviewed",
  "submission_id": "uuid",
  "reviewer_score": 85,
  "final_score": 85
}
```

**Error responses:**
- `401`/`403`: Auth failure
- `404`: Submission not found
- `409`: Submission already reviewed
- `422`: Submission status is invalid for review

---

## Submission Status Flow

The `status` column on `exercise_submissions` follows a strict one-way flow:

```
Phase 3:    'submitted'  →  'human_reviewed'
Phase 3.5:  'submitted'  →  'ai_graded'  →  'human_reviewed'
```

**Frontend must handle all three statuses** in the UI:

| Status | Frontend displays |
|---|---|
| `submitted` | "Pending review" indicator |
| `ai_graded` | LLM preliminary score + feedback (Phase 3.5) |
| `human_reviewed` | Final score (`final_score` = `reviewer_score` if set, else `llm_score`) |

---

## Score Display Logic

The `final_score` is a computed column in Postgres:

```sql
final_score = COALESCE(reviewer_score, llm_score)
```

- If the human reviewer has scored: `final_score = reviewer_score`
- If only LLM has scored (Phase 3.5): `final_score = llm_score`
- If neither: `final_score = null`

**Frontend should always display `final_score`**, not the individual scores, for the grade badge.

---

## TypeScript Types (Suggested)

```typescript
interface Submission {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  llm_score: number | null;
  llm_feedback: Record<string, unknown>[] | null;
  reviewer_score: number | null;
  final_score: number | null;
  status: 'submitted' | 'ai_graded' | 'human_reviewed';
  submitted_at: string;
  reviewed_at: string | null;
}

interface SubmissionListResponse {
  submissions: Submission[];
  total: number;
  page: number;
  page_size: number;
}

interface ReviewRequest {
  reviewer_score: number; // 0-100
  reviewer_comment?: string;
}

interface ReviewResponse {
  status: 'reviewed';
  submission_id: string;
  reviewer_score: number;
  final_score: number | null;
}

interface HealthResponse {
  status: 'healthy' | 'degraded';
  supabase: 'connected' | 'error';
  redis: 'connected' | 'error';
  environment: string;
}
```
