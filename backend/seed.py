"""Idempotent seed: one demo candidate with skills + several analyzed job descriptions.

Run: cd /app/backend && python seed.py
"""
import asyncio
from datetime import datetime, timedelta, timezone

from lib.auth import hash_password
from lib.db import db
from lib.engine import analyze, extract_skills
from lib.skills import label_of
from models.schemas import Analysis, _uid

DEMO_EMAIL = "demo@skillgap.ai"
DEMO_PASSWORD = "demo1234"

RESUME = """Associate Software Developer.
Built REST APIs with Java, Spring Boot and MySQL. Wrote SQL queries and stored procedures.
Frontend work in HTML, CSS, JavaScript and Bootstrap. Version control with Git, builds with Maven.
Wrote unit tests, worked in an Agile/Scrum team. 2 years experience."""

JOBS = [
    (
        "Associate Software Developer",
        "Infosys",
        """We are hiring an Associate Software Developer with 2+ years experience.
Requirements: Java, Spring Boot, Hibernate, JPA, Microservices, Docker, AWS, Kafka, SQL, REST API, JUnit.
Nice to have: Maven, Git, Agile.""",
    ),
    (
        "Backend Engineer (Java)",
        "Zeta Payments",
        """3+ years building backend services. Must have: Java, Spring Boot, Spring Security, Microservices,
REST API, PostgreSQL, Redis, Docker, Kubernetes, Kafka, JUnit, Mockito, CI/CD, Linux.
Exposure to system design and caching strategies is a plus.""",
    ),
    (
        "Cloud Native Engineer",
        "Enterprise SaaS Co",
        """Looking for 4+ years experience with AWS, Docker, Kubernetes, Terraform, Jenkins, CI/CD,
Linux, Python, Bash, Prometheus, Microservices and serverless architecture. SQL knowledge required.""",
    ),
    (
        "Full Stack Developer",
        "Nexturn Labs",
        """Requirements: Java, Spring Boot, REST API, MySQL, React, JavaScript, TypeScript, HTML, CSS,
Git, Docker, JUnit, Agile. Bonus: Microservices, AWS.""",
    ),
    (
        "Java Microservices Developer",
        "HCL",
        """5+ years. Java, Spring Boot, Hibernate, JPA, Microservices, Kafka, RabbitMQ, Docker,
Kubernetes, AWS, Oracle DB, SQL, REST API, design patterns, system design, JUnit.""",
    ),
]


async def main() -> None:
    user = await db.users.find_one({"email": DEMO_EMAIL})
    skills = extract_skills(RESUME)
    if not user:
        user = {
            "id": _uid(),
            "name": "Demo Candidate",
            "email": DEMO_EMAIL,
            "password_hash": hash_password(DEMO_PASSWORD),
            "skills": skills,
            "experience_years": 2,
            "resume_text": RESUME,
        }
        await db.users.insert_one(dict(user))
        print(f"created demo user {DEMO_EMAIL} / {DEMO_PASSWORD}")
    else:
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"skills": skills, "experience_years": 2, "resume_text": RESUME}},
        )
        print("demo user refreshed")

    print("profile skills:", ", ".join(label_of(s) for s in skills))

    for title, company, jd in JOBS:
        existing = await db.analyses.find_one({"user_id": user["id"], "role_title": title})
        if existing:
            continue
        result = analyze(jd, title, skills, 2)
        analysis = Analysis(user_id=user["id"], company=company, jd_text=jd, **result)
        await db.analyses.insert_one(analysis.model_dump())
        print(f"seeded analysis: {title} -> {result['match_score']}% match")

    await seed_progress(user["id"], skills)
    print("done")


async def seed_progress(user_id: str, skills: list[str]) -> None:
    """Demo readiness timeline: real engine averages for progressively larger skill sets,
    back-dated one week apart so the chart has history on first load."""
    if await db.progress.count_documents({"user_id": user_id}) > 0:
        print("progress history already present")
        return

    ramp = [6, 8, 10, 12, len(skills)]
    now = datetime.now(timezone.utc)
    for i, count in enumerate(ramp):
        subset = skills[:count]
        scores = [analyze(jd, title, subset, 2)["match_score"] for title, _c, jd in JOBS]
        avg = int(round(sum(scores) / len(scores)))
        await db.progress.insert_one(
            {
                "id": _uid(),
                "user_id": user_id,
                "at": now - timedelta(weeks=len(ramp) - 1 - i),
                "average_match": avg,
                "skills_count": len(subset),
                "jobs_count": len(JOBS),
                "event": "seed_snapshot",
            }
        )
        print(f"progress snapshot: {len(subset)} skills -> {avg}% average match")


if __name__ == "__main__":
    asyncio.run(main())
