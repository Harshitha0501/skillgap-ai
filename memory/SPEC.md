# SkillGap AI — living spec

## What it does
Paste a job description → deterministic rule engine (no AI) extracts required skills, compares them
against the candidate's saved skill profile, and produces: match score, strong/partial/missing skills,
a prioritised learning roadmap, tiered interview questions, and a printable recruiter scorecard.
Plus cross-job market insights ("Why am I not getting shortlisted?") and job-to-job comparison.

## Stack
FastAPI + motor/MongoDB backend (`/api`), Vite + React 19 + TS frontend. Auth = JWT in an httpOnly
cookie (`skillgap_session`), bcrypt password hashes.

## Data model (Mongo collections)
- `users`: id, name, email, password_hash, skills[] (canonical skill keys), experience_years, resume_text
- `analyses`: id, user_id, role_title, company, jd_text, created_at, match_score, technical_score,
  tooling_score, experience_match, project_score, keyword_coverage, readiness, verdict, verdict_note,
  jd_years_required, required_skills[], strong_skills[], partial_skills[], missing_skills[],
  roadmap[], questions[]

## Rule engine (backend/lib)
- `skills.py` — ~90-skill dictionary: label, category, aliases, learning days, deps, adjacent skills.
  Category weights: language .30, framework .25, database .15, cloud_devops .15, architecture .08,
  testing .04, tooling .03.
- `engine.py` — longest-alias-first regex extraction; weighted match score (adjacent skill = 0.5);
  sub-scores; readiness = 0.45*match + 0.2*technical + 0.15*experience + 0.1*project + 0.1*keywords;
  verdict thresholds 80 / 65; roadmap ordered by dependency-unblocked → category weight → days.
- `questions.py` — static per-skill bank (basic/intermediate) + project templates + JD-specific generators.

## API (all on api_router, prefix /api)
- POST `/auth/signup`, POST `/auth/login`, POST `/auth/logout`, GET `/auth/me`, PUT `/auth/me`
- GET `/skills` (catalog), POST `/resume/parse`, POST `/resume/upload` (multipart PDF/txt → pypdf text extraction)
- POST `/skills/learn` `{skill_key, learned}` — roadmap tick-box: adds/removes the skill then
  re-runs the engine over every saved analysis so all match scores update
- POST `/analyses`, GET `/analyses`, GET `/analyses/{id}` (backfills answer hints), DELETE `/analyses/{id}`
- PATCH `/analyses/{id}/application` `{app_status, applied_date, notes}` — statuses:
  not_applied | applied | interviewing | rejected | offer
- GET `/insights` (skill demand + recurring gaps + status_counts + outcome_insight correlating
  rejections vs interviews/offers by match score), POST `/compare`
- GET `/progress` — weekly readiness timeline built from `progress` snapshots (avg match, skill count,
  job count per ISO week) + headline delta. Snapshots are written on analysis creation, roadmap
  tick-box, and profile save.

## Learning resources
`backend/lib/resources.py` — curated free links (official docs / free courses) for ~80 skills, with a
freeCodeCamp + YouTube search fallback so every roadmap step always has links. Exposed as
`RoadmapStep.resources[{label,url}]`; old analyses are backfilled on open.

## Routes
`/` landing (public), `/login`, `/signup`, `/analyze`, `/report/:id`, `/profile`, `/history`,
`/insights`, `/compare`, `/applications`, `/progress` (all authenticated via `RequireAuth`).

## Feature notes
- Interview questions carry an `hint` (model-answer pointers) toggled inline in the vault.
- Roadmap steps have an "I have learned X" checkbox → profile update + global recompute.
- Application tracker page: per-job status/date/notes + status counts + outcome insight.

## Seed facts (`cd /app/backend && python seed.py`, idempotent)
Demo user `demo@skillgap.ai` / `demo1234`, 2 years experience, 14 skills extracted from a resume
(Java, Spring Boot, Spring, MySQL, SQL, REST API, JavaScript, HTML, CSS, Bootstrap, Git, Maven,
Agile/Scrum, Unit Testing) and 5 pre-analyzed jobs:
Associate Software Developer 67%, Backend Engineer (Java) 50%, Cloud Native Engineer 15%,
Full Stack Developer 80%, Java Microservices Developer 56%.
One demo application is logged as "Interviewing" (Associate Software Developer, 2026-08-28) so the
tracker and the outcome insight have data on first load.

## Notes
- Theme: dark by default, toggle persists to localStorage (`skillgap-theme`).
- PDF export = `window.print()` against `@media print` styles on the recruiter card.
