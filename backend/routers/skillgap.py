from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from lib.auth import current_user
from lib.db import db
from lib.engine import analyze, extract_skills
from lib.progress import recompute_user_analyses, record_progress
from lib.skills import CATEGORY_LABELS, SKILLS, all_skills_grouped, category_of, label_of
from models.schemas import (
    Analysis,
    AnalysisSummary,
    AnalyzeRequest,
    APPLICATION_STATUSES,
    ApplicationUpdate,
    CompareOut,
    CompareRequest,
    CompareRow,
    DemandRow,
    InsightsOut,
    LearnSkillRequest,
    ProgressOut,
    ProgressPoint,
    ResumeParseRequest,
    ResumeParseResult,
    SkillCatalog,
    SkillRow,
    UserOut,
)

router = APIRouter(tags=["skillgap"])


@router.get("/skills", response_model=SkillCatalog)
async def skill_catalog():
    grouped = all_skills_grouped()
    return SkillCatalog(
        categories={
            cat: [SkillRow(key=i["key"], label=i["label"], category=cat) for i in items]
            for cat, items in grouped.items()
        },
        category_labels=CATEGORY_LABELS,
    )


@router.post("/resume/parse", response_model=ResumeParseResult)
async def parse_resume(payload: ResumeParseRequest):
    keys = extract_skills(payload.resume_text)
    return ResumeParseResult(
        skills=[SkillRow(key=k, label=label_of(k), category=category_of(k)) for k in keys]
    )


def _summary(doc: dict) -> AnalysisSummary:
    return AnalysisSummary(
        id=doc["id"],
        role_title=doc.get("role_title") or "Untitled role",
        company=doc.get("company", ""),
        created_at=doc["created_at"],
        match_score=doc["match_score"],
        readiness=doc["readiness"],
        verdict=doc["verdict"],
        missing_count=len(doc.get("missing_skills", [])),
        strong_count=len(doc.get("strong_skills", [])),
        app_status=doc.get("app_status", "not_applied"),
        applied_date=doc.get("applied_date"),
        notes=doc.get("notes", ""),
    )


async def _recompute_user_analyses(user: dict) -> int:
    return await recompute_user_analyses(user)


@router.post("/resume/upload", response_model=ResumeParseResult)
async def upload_resume(file: UploadFile = File(...)):
    """Accept a PDF (or plain-text) resume and extract known skills from its text."""
    raw = await file.read()
    if len(raw) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Resume file must be under 5 MB")
    name = (file.filename or "").lower()
    text = ""
    if name.endswith(".pdf") or raw[:4] == b"%PDF":
        from io import BytesIO

        from pypdf import PdfReader

        try:
            reader = PdfReader(BytesIO(raw))
            text = "\n".join((page.extract_text() or "") for page in reader.pages)
        except Exception:
            raise HTTPException(status_code=422, detail="Could not read that PDF — try a text-based export")
    else:
        text = raw.decode("utf-8", errors="ignore")

    if len(text.strip()) < 20:
        raise HTTPException(
            status_code=422,
            detail="No readable text found in that file (scanned image PDFs are not supported)",
        )
    keys = extract_skills(text)
    return ResumeParseResult(
        skills=[SkillRow(key=k, label=label_of(k), category=category_of(k)) for k in keys],
        resume_text=text.strip()[:20000],
    )


@router.post("/skills/learn", response_model=UserOut)
async def mark_skill_learned(payload: LearnSkillRequest, user: dict = Depends(current_user)):
    """Tick a roadmap step: add/remove the skill, then recompute every saved analysis."""
    if payload.skill_key not in SKILLS:
        raise HTTPException(status_code=404, detail="Unknown skill")
    skills = list(user.get("skills", []))
    if payload.learned and payload.skill_key not in skills:
        skills.append(payload.skill_key)
    elif not payload.learned:
        skills = [s for s in skills if s != payload.skill_key]
    await db.users.update_one({"id": user["id"]}, {"$set": {"skills": skills}})
    fresh = await db.users.find_one({"id": user["id"]}) or {**user, "skills": skills}
    await _recompute_user_analyses(fresh)
    await _record_progress(fresh, f"learned:{payload.skill_key}" if payload.learned else f"removed:{payload.skill_key}")
    return UserOut(
        id=fresh["id"],
        name=fresh.get("name", ""),
        email=fresh.get("email", ""),
        skills=fresh.get("skills", []),
        experience_years=fresh.get("experience_years", 0),
        resume_text=fresh.get("resume_text", ""),
    )


@router.patch("/analyses/{analysis_id}/application", response_model=AnalysisSummary)
async def update_application(
    analysis_id: str, payload: ApplicationUpdate, user: dict = Depends(current_user)
):
    if payload.app_status not in APPLICATION_STATUSES:
        raise HTTPException(status_code=422, detail="Unknown application status")
    res = await db.analyses.update_one(
        {"id": analysis_id, "user_id": user["id"]},
        {
            "$set": {
                "app_status": payload.app_status,
                "applied_date": payload.applied_date,
                "notes": payload.notes,
            }
        },
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
    doc = await db.analyses.find_one({"id": analysis_id, "user_id": user["id"]})
    return _summary(doc or {})


async def _record_progress(user: dict, event: str) -> None:
    await record_progress(user, event)


@router.get("/progress", response_model=ProgressOut)
async def progress(user: dict = Depends(current_user)):
    docs = await db.progress.find({"user_id": user["id"]}).sort("at", 1).to_list(2000)
    if not docs:
        return ProgressOut(headline="Analyze a job and tick off a roadmap skill to start your timeline.")

    buckets: dict[str, list[dict]] = {}
    for doc in docs:
        at = doc["at"]
        if at.tzinfo is None:
            at = at.replace(tzinfo=timezone.utc)
        year, week, _ = at.isocalendar()
        buckets.setdefault(f"{year}-W{week:02d}", []).append(doc)

    points: list[ProgressPoint] = []
    for week in sorted(buckets):
        rows = buckets[week]
        last = rows[-1]
        at = last["at"]
        if at.tzinfo is None:
            at = at.replace(tzinfo=timezone.utc)
        points.append(
            ProgressPoint(
                week=week,
                label=at.strftime("%d %b"),
                average_match=int(round(sum(r["average_match"] for r in rows) / len(rows))),
                skills_count=last.get("skills_count", 0),
                jobs_count=last.get("jobs_count", 0),
            )
        )

    first, latest = points[0], points[-1]
    delta = latest.average_match - first.average_match
    skills_added = max(0, latest.skills_count - first.skills_count)
    if len(points) < 2:
        headline = (
            f"Baseline set at {latest.average_match}% average match across {latest.jobs_count} jobs — "
            f"tick a roadmap skill to see this climb."
        )
    elif delta > 0:
        headline = (
            f"Your average match climbed {delta} points (from {first.average_match}% to "
            f"{latest.average_match}%) over {len(points)} weeks, after adding {skills_added} skills."
        )
    elif delta == 0:
        headline = (
            f"Your average match has held at {latest.average_match}% — close a HIGH priority roadmap gap to move it."
        )
    else:
        headline = (
            f"Your average match dropped {abs(delta)} points to {latest.average_match}%, usually because you "
            f"analyzed tougher roles. Work the roadmap on the lowest scoring ones."
        )

    return ProgressOut(
        points=points,
        first_average=first.average_match,
        latest_average=latest.average_match,
        delta=delta,
        skills_added=skills_added,
        weeks_tracked=len(points),
        headline=headline,
    )


@router.post("/analyses", response_model=Analysis)
async def create_analysis(payload: AnalyzeRequest, user: dict = Depends(current_user)):
    result = analyze(
        payload.jd_text,
        payload.role_title.strip(),
        user.get("skills", []),
        float(user.get("experience_years", 0) or 0),
    )
    if not result["required_skills"]:
        raise HTTPException(
            status_code=422,
            detail="No known technical skills detected in that job description. Paste the requirements section.",
        )
    analysis = Analysis(
        user_id=user["id"],
        company=payload.company.strip(),
        jd_text=payload.jd_text,
        **{k: v for k, v in result.items()},
    )
    await db.analyses.insert_one(analysis.model_dump())
    await _record_progress(user, "analysis_created")
    return analysis


@router.get("/analyses", response_model=list[AnalysisSummary])
async def list_analyses(user: dict = Depends(current_user)):
    docs = await db.analyses.find({"user_id": user["id"]}).sort("created_at", -1).to_list(200)
    return [_summary(d) for d in docs]


@router.get("/analyses/{analysis_id}", response_model=Analysis)
async def get_analysis(analysis_id: str, user: dict = Depends(current_user)):
    doc = await db.analyses.find_one({"id": analysis_id, "user_id": user["id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
    # Backfill answer hints / learning links for analyses stored before those fields existed.
    questions = doc.get("questions", [])
    roadmap = doc.get("roadmap", [])
    needs_hints = bool(questions) and not any(q.get("hint") for q in questions)
    needs_links = bool(roadmap) and not any(s.get("resources") for s in roadmap)
    if needs_hints or needs_links:
        rebuilt = analyze(
            doc.get("jd_text", ""),
            doc.get("role_title", ""),
            user.get("skills", []),
            float(user.get("experience_years", 0) or 0),
        )
        patch = {"questions": rebuilt["questions"], "roadmap": rebuilt["roadmap"]}
        await db.analyses.update_one({"id": doc["id"]}, {"$set": patch})
        doc.update(patch)
    return Analysis(**doc)


@router.delete("/analyses/{analysis_id}")
async def delete_analysis(analysis_id: str, user: dict = Depends(current_user)):
    res = await db.analyses.delete_one({"id": analysis_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"ok": True}


@router.get("/insights", response_model=InsightsOut)
async def insights(user: dict = Depends(current_user)):
    docs = await db.analyses.find({"user_id": user["id"]}).to_list(500)
    have = set(user.get("skills", []))
    total = len(docs)
    if total == 0:
        return InsightsOut(total_jobs=0, average_match=0, unlock_message="Analyze a few jobs to unlock market insights.")

    counts: dict[str, int] = {}
    for doc in docs:
        for row in doc.get("required_skills", []):
            counts[row["key"]] = counts.get(row["key"], 0) + 1

    def row(key: str) -> DemandRow:
        return DemandRow(
            key=key,
            label=label_of(key),
            category=category_of(key),
            requested_in=counts[key],
            total_jobs=total,
            you_have=key in have,
        )

    demand = sorted((row(k) for k in counts), key=lambda r: (-r.requested_in, r.label))
    gaps = [r for r in demand if not r.you_have]
    avg = int(round(sum(d["match_score"] for d in docs) / total))
    blocker = gaps[0] if gaps else None
    if blocker:
        top2 = gaps[:2]
        names = " + ".join(g.label for g in top2)
        reach = max(g.requested_in for g in top2)
        unlock = (
            f"Your biggest recurring skill gap is {blocker.label}. Adding {names} to your profile "
            f"could improve your match with {reach} of the {total} analyzed jobs."
        )
    else:
        unlock = f"You cover every skill requested across all {total} analyzed jobs. Focus on interview delivery."

    return InsightsOut(
        total_jobs=total,
        average_match=avg,
        demand=demand[:20],
        top_recurring_gaps=gaps[:8],
        biggest_blocker=blocker,
        unlock_message=unlock,
        **_outcome_stats(docs),
    )


def _outcome_stats(docs: list[dict]) -> dict:
    """Correlate application outcomes with match score."""
    counts: dict[str, int] = {s: 0 for s in APPLICATION_STATUSES}
    for doc in docs:
        status = doc.get("app_status", "not_applied")
        counts[status] = counts.get(status, 0) + 1

    rejected = [d["match_score"] for d in docs if d.get("app_status") == "rejected"]
    progressed = [
        d["match_score"] for d in docs if d.get("app_status") in ("interviewing", "offer")
    ]
    rej_avg = int(round(sum(rejected) / len(rejected))) if rejected else None
    prog_avg = int(round(sum(progressed) / len(progressed))) if progressed else None

    if rej_avg is not None and prog_avg is not None:
        insight = (
            f"Your rejections cluster around {rej_avg}% match while interviews and offers average "
            f"{prog_avg}%. Treat {max(rej_avg, prog_avg - 5)}% as your apply threshold and close the "
            f"roadmap gaps before applying below it."
        )
    elif rej_avg is not None:
        insight = (
            f"Your {len(rejected)} rejection(s) cluster around {rej_avg}% match. Roles below that score "
            f"are the ones to fix with the roadmap before applying again."
        )
    elif prog_avg is not None:
        insight = (
            f"Every application that progressed averaged {prog_avg}% match — keep applying at or above that level."
        )
    else:
        insight = "Log the outcome of your applications to see how match score correlates with rejections."

    return {
        "status_counts": counts,
        "outcome_insight": insight,
        "rejected_avg_match": rej_avg,
        "progressed_avg_match": prog_avg,
    }


@router.post("/compare", response_model=CompareOut)
async def compare(payload: CompareRequest, user: dict = Depends(current_user)):
    if payload.analysis_a_id == payload.analysis_b_id:
        raise HTTPException(status_code=422, detail="Pick two different analyses to compare")
    a = await db.analyses.find_one({"id": payload.analysis_a_id, "user_id": user["id"]})
    b = await db.analyses.find_one({"id": payload.analysis_b_id, "user_id": user["id"]})
    if not a or not b:
        raise HTTPException(status_code=404, detail="Analysis not found")

    have = set(user.get("skills", []))
    keys_a = [r["key"] for r in a.get("required_skills", [])]
    keys_b = [r["key"] for r in b.get("required_skills", [])]
    union = sorted(
        set(keys_a) | set(keys_b),
        key=lambda k: (-(SKILLS.get(k, {}).get("days", 0)), label_of(k)),
    )
    rows = [
        CompareRow(key=k, label=label_of(k), in_a=k in keys_a, in_b=k in keys_b, you_have=k in have)
        for k in union
    ]
    winner = "a" if a["match_score"] >= b["match_score"] else "b"
    win_doc = a if winner == "a" else b
    lose_doc = b if winner == "a" else a
    rec = (
        f"{win_doc.get('role_title') or 'Job A'} is your stronger bet at {win_doc['match_score']}% "
        f"versus {lose_doc['match_score']}% — fewer gaps means a shorter path to interview-ready."
    )
    return CompareOut(a=_summary(a), b=_summary(b), rows=rows, winner=winner, recommendation=rec)
