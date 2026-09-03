"""Shared write-side helpers: recompute saved analyses and snapshot readiness over time."""
import uuid
from datetime import datetime, timezone

from lib.db import db
from lib.engine import analyze


async def recompute_user_analyses(user: dict) -> int:
    """Re-run the engine over every saved analysis after the skill profile changes."""
    docs = await db.analyses.find({"user_id": user["id"]}).to_list(500)
    years = float(user.get("experience_years", 0) or 0)
    skills = user.get("skills", [])
    for doc in docs:
        result = analyze(doc.get("jd_text", ""), doc.get("role_title", ""), skills, years)
        await db.analyses.update_one({"id": doc["id"]}, {"$set": result})
    return len(docs)


async def record_progress(user: dict, event: str) -> None:
    """Snapshot average match + skill count so the readiness timeline has real history."""
    docs = await db.analyses.find({"user_id": user["id"]}).to_list(500)
    if not docs:
        return
    avg = int(round(sum(d["match_score"] for d in docs) / len(docs)))
    await db.progress.insert_one(
        {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "at": datetime.now(timezone.utc),
            "average_match": avg,
            "skills_count": len(user.get("skills", [])),
            "jobs_count": len(docs),
            "event": event,
        }
    )
