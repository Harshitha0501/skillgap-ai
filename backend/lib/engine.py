"""Rule-based skill extraction, gap scoring and roadmap generation. No AI involved."""
import re

from lib.questions import build_questions
from lib.resources import resources_for
from lib.skills import (
    ALIAS_INDEX,
    CATEGORY_WEIGHTS,
    adjacent_of,
    category_of,
    days_of,
    deps_of,
    label_of,
)

_YEARS_RE = re.compile(r"(\d+)\s*\+?\s*(?:to\s*\d+\s*)?year", re.I)


def extract_skills(text: str) -> list[str]:
    """Longest-alias-first word-boundary scan; returns canonical keys in first-seen order."""
    low = f" {text.lower()} "
    low = re.sub(r"[^a-z0-9+#./\- ]+", " ", low)
    found: list[str] = []
    for alias, key in ALIAS_INDEX:
        if key in found:
            continue
        pattern = r"(?<![a-z0-9])" + re.escape(alias).replace(r"\ ", r"[\s\-_/]+") + r"(?![a-z0-9])"
        if re.search(pattern, low):
            found.append(key)
    order = {k: i for i, k in enumerate(found)}
    return sorted(found, key=lambda k: (-CATEGORY_WEIGHTS.get(category_of(k), 0.03), order[k]))


def extract_years(text: str) -> int | None:
    matches = [int(m) for m in _YEARS_RE.findall(text)]
    plausible = [m for m in matches if 0 < m <= 25]
    return min(plausible) if plausible else None


def _pct(part: float, whole: float) -> int:
    return int(round((part / whole) * 100)) if whole else 0


def _coverage(keys: list[str], strong: set[str], partial: set[str]) -> int:
    if not keys:
        return 0
    score = sum(1.0 if k in strong else 0.5 if k in partial else 0.0 for k in keys)
    return _pct(score, len(keys))


def analyze(
    jd_text: str,
    role_title: str,
    candidate_skills: list[str],
    candidate_years: float = 0,
) -> dict:
    required = extract_skills(jd_text)
    have = set(candidate_skills)

    strong = [k for k in required if k in have]
    gaps = [k for k in required if k not in have]
    partial = [k for k in gaps if set(adjacent_of(k)) & have]
    missing = [k for k in gaps if k not in partial]

    strong_set, partial_set = set(strong), set(partial)

    # weighted match score across the categories the JD actually asks for
    num = den = 0.0
    for key in required:
        w = CATEGORY_WEIGHTS.get(category_of(key), 0.03)
        den += w
        if key in strong_set:
            num += w
        elif key in partial_set:
            num += w * 0.5
    match_score = _pct(num, den)

    core = [k for k in required if category_of(k) in ("language", "framework")]
    infra = [k for k in required if category_of(k) in ("cloud_devops", "database", "tooling")]
    arch = [k for k in required if category_of(k) in ("architecture", "testing")]

    jd_years = extract_years(jd_text)
    if jd_years:
        experience_match = min(100, _pct(candidate_years, jd_years))
    else:
        experience_match = min(100, 60 + int(candidate_years * 8))

    technical_score = _coverage(core, strong_set, partial_set)
    tooling_score = _coverage(infra, strong_set, partial_set)
    project_score = _coverage(arch, strong_set, partial_set) if arch else technical_score
    keyword_coverage = _coverage(required, strong_set, partial_set)

    readiness = int(
        round(
            match_score * 0.45
            + technical_score * 0.2
            + experience_match * 0.15
            + project_score * 0.1
            + keyword_coverage * 0.1
        )
    )

    if readiness >= 80:
        verdict, verdict_note = "STRONG CANDIDATE", "Ready to interview — polish the JD-specific answers."
    elif readiness >= 65:
        verdict, verdict_note = "READY WITH IMPROVEMENT", "Solid potential — close the HIGH priority gaps first."
    else:
        verdict, verdict_note = "SIGNIFICANT SKILL GAP", "Complete the roadmap before applying to this role."

    return {
        "role_title": role_title,
        "required_skills": [_skill_row(k) for k in required],
        "strong_skills": [_skill_row(k) for k in strong],
        "partial_skills": [_skill_row(k) for k in partial],
        "missing_skills": [_skill_row(k) for k in missing],
        "match_score": match_score,
        "technical_score": technical_score,
        "tooling_score": tooling_score,
        "experience_match": experience_match,
        "project_score": project_score,
        "keyword_coverage": keyword_coverage,
        "readiness": readiness,
        "verdict": verdict,
        "verdict_note": verdict_note,
        "jd_years_required": jd_years,
        "roadmap": build_roadmap(missing, partial, have),
        "questions": build_questions(required, strong, missing + partial, role_title),
    }


def _skill_row(key: str) -> dict:
    return {"key": key, "label": label_of(key), "category": category_of(key)}


def build_roadmap(missing: list[str], partial: list[str], have: set[str]) -> list[dict]:
    gaps = [(k, "missing") for k in missing] + [(k, "partial") for k in partial]

    def rank(item: tuple[str, str]) -> tuple:
        key, kind = item
        weight = CATEGORY_WEIGHTS.get(category_of(key), 0.03)
        unblocked = 0 if all(d in have for d in deps_of(key)) else 1
        return (unblocked, -weight, 0 if kind == "partial" else 1, days_of(key))

    ordered = sorted(gaps, key=rank)
    steps: list[dict] = []
    for i, (key, kind) in enumerate(ordered[:8]):
        weight = CATEGORY_WEIGHTS.get(category_of(key), 0.03)
        priority = "HIGH" if weight >= 0.15 and kind == "missing" else "MEDIUM" if weight >= 0.08 else "LOW"
        if kind == "partial" and priority == "HIGH":
            priority = "MEDIUM"
        deps = [label_of(d) for d in deps_of(key)]
        met = [label_of(d) for d in deps_of(key) if d in have]
        if kind == "partial":
            reason = "Adjacent skill — you have related experience, formalise it fast"
        elif met:
            reason = f"Required directly in JD; builds on your {', '.join(met)}"
        else:
            reason = "Required directly in JD"
        steps.append(
            {
                "order": i + 1,
                "skill": label_of(key),
                "skill_key": key,
                "category": category_of(key),
                "priority": priority,
                "reason": reason,
                "days": days_of(key),
                "depends_on": deps,
                "resources": resources_for(key, label_of(key)),
            }
        )
    return steps
