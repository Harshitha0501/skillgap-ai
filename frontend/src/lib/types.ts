// Hand-written mirrors of the Pydantic models in backend/models/schemas.py.
// Change one, change the other in the same edit.

export interface User {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience_years: number;
  resume_text: string;
}

export interface SkillRow {
  key: string;
  label: string;
  category: string;
}

export interface SkillCatalog {
  categories: Record<string, SkillRow[]>;
  category_labels: Record<string, string>;
}

export interface ResumeParseResult {
  skills: SkillRow[];
  resume_text: string;
}

export const APP_STATUS_LABELS: Record<string, string> = {
  not_applied: "Not applied",
  applied: "Applied",
  interviewing: "Interviewing",
  rejected: "Rejected",
  offer: "Offer",
};

export interface LearningResource {
  label: string;
  url: string;
}

export interface RoadmapStep {
  order: number;
  skill: string;
  skill_key: string;
  category: string;
  priority: string;
  reason: string;
  days: number;
  depends_on: string[];
  resources: LearningResource[];
}

export interface ProgressPoint {
  week: string;
  label: string;
  average_match: number;
  skills_count: number;
  jobs_count: number;
}

export interface ProgressData {
  points: ProgressPoint[];
  first_average: number | null;
  latest_average: number | null;
  delta: number;
  skills_added: number;
  weeks_tracked: number;
  headline: string;
}

export interface InterviewQuestion {
  tier: string;
  skill: string;
  question: string;
  hint: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  role_title: string;
  company: string;
  jd_text: string;
  created_at: string;
  match_score: number;
  technical_score: number;
  tooling_score: number;
  experience_match: number;
  project_score: number;
  keyword_coverage: number;
  readiness: number;
  verdict: string;
  verdict_note: string;
  jd_years_required: number | null;
  required_skills: SkillRow[];
  strong_skills: SkillRow[];
  partial_skills: SkillRow[];
  missing_skills: SkillRow[];
  roadmap: RoadmapStep[];
  questions: InterviewQuestion[];
  app_status: string;
  applied_date: string | null;
  notes: string;
}

export interface AnalysisSummary {
  id: string;
  role_title: string;
  company: string;
  created_at: string;
  match_score: number;
  readiness: number;
  verdict: string;
  missing_count: number;
  strong_count: number;
  app_status: string;
  applied_date: string | null;
  notes: string;
}

export interface DemandRow {
  key: string;
  label: string;
  category: string;
  requested_in: number;
  total_jobs: number;
  you_have: boolean;
}

export interface Insights {
  total_jobs: number;
  average_match: number;
  demand: DemandRow[];
  top_recurring_gaps: DemandRow[];
  biggest_blocker: DemandRow | null;
  unlock_message: string;
  status_counts: Record<string, number>;
  outcome_insight: string;
  rejected_avg_match: number | null;
  progressed_avg_match: number | null;
}

export interface CompareRow {
  key: string;
  label: string;
  in_a: boolean;
  in_b: boolean;
  you_have: boolean;
}

export interface CompareResult {
  a: AnalysisSummary;
  b: AnalysisSummary;
  rows: CompareRow[];
  winner: string;
  recommendation: string;
}
