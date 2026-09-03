import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, EmailStr, Field


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uid() -> str:
    return str(uuid.uuid4())


# ---------- auth ----------
class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    skills: list[str] = []
    experience_years: float = 0
    resume_text: str = ""


# ---------- profile ----------
class ProfileUpdate(BaseModel):
    name: str | None = None
    skills: list[str] | None = None
    experience_years: float | None = None
    resume_text: str | None = None


class ResumeParseRequest(BaseModel):
    resume_text: str


class SkillRow(BaseModel):
    key: str
    label: str
    category: str


class ResumeParseResult(BaseModel):
    skills: list[SkillRow]
    resume_text: str = ""


class SkillCatalog(BaseModel):
    categories: dict[str, list[SkillRow]]
    category_labels: dict[str, str]


# ---------- analysis ----------
class AnalyzeRequest(BaseModel):
    role_title: str = Field(default="", max_length=120)
    company: str = Field(default="", max_length=120)
    jd_text: str = Field(min_length=20)


class LearningResource(BaseModel):
    label: str
    url: str


class RoadmapStep(BaseModel):
    order: int
    skill: str
    skill_key: str
    category: str
    priority: str
    reason: str
    days: int
    depends_on: list[str] = []
    resources: list[LearningResource] = []


class ProgressPoint(BaseModel):
    week: str
    label: str
    average_match: int
    skills_count: int
    jobs_count: int


class ProgressOut(BaseModel):
    points: list[ProgressPoint] = []
    first_average: int | None = None
    latest_average: int | None = None
    delta: int = 0
    skills_added: int = 0
    weeks_tracked: int = 0
    headline: str = ""


class InterviewQuestion(BaseModel):
    tier: str
    skill: str
    question: str
    hint: str = ""


APPLICATION_STATUSES = ["not_applied", "applied", "interviewing", "rejected", "offer"]


class ApplicationUpdate(BaseModel):
    app_status: str = Field(default="not_applied")
    applied_date: str | None = None
    notes: str = Field(default="", max_length=2000)


class LearnSkillRequest(BaseModel):
    skill_key: str
    learned: bool = True


class Analysis(BaseModel):
    id: str = Field(default_factory=_uid)
    user_id: str
    role_title: str
    company: str = ""
    jd_text: str
    created_at: datetime = Field(default_factory=_now)
    match_score: int
    technical_score: int
    tooling_score: int
    experience_match: int
    project_score: int
    keyword_coverage: int
    readiness: int
    verdict: str
    verdict_note: str
    jd_years_required: int | None = None
    required_skills: list[SkillRow] = []
    strong_skills: list[SkillRow] = []
    partial_skills: list[SkillRow] = []
    missing_skills: list[SkillRow] = []
    roadmap: list[RoadmapStep] = []
    questions: list[InterviewQuestion] = []
    app_status: str = "not_applied"
    applied_date: str | None = None
    notes: str = ""


class AnalysisSummary(BaseModel):
    id: str
    role_title: str
    company: str = ""
    created_at: datetime
    match_score: int
    readiness: int
    verdict: str
    missing_count: int
    strong_count: int
    app_status: str = "not_applied"
    applied_date: str | None = None
    notes: str = ""


# ---------- insights ----------
class DemandRow(BaseModel):
    key: str
    label: str
    category: str
    requested_in: int
    total_jobs: int
    you_have: bool


class InsightsOut(BaseModel):
    total_jobs: int
    average_match: int
    demand: list[DemandRow] = []
    top_recurring_gaps: list[DemandRow] = []
    biggest_blocker: DemandRow | None = None
    unlock_message: str = ""
    status_counts: dict[str, int] = {}
    outcome_insight: str = ""
    rejected_avg_match: int | None = None
    progressed_avg_match: int | None = None


# ---------- comparison ----------
class CompareRequest(BaseModel):
    analysis_a_id: str
    analysis_b_id: str


class CompareRow(BaseModel):
    key: str
    label: str
    in_a: bool
    in_b: bool
    you_have: bool


class CompareOut(BaseModel):
    a: AnalysisSummary
    b: AnalysisSummary
    rows: list[CompareRow]
    winner: str
    recommendation: str
