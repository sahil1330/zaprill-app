import type { ResumeData } from "./resume";

export type { ResumeData };

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requiredSkills: string[];
  url: string;
  salary?: string;
  postedAt?: string;
  employmentType?: string;
  isRemote?: boolean;
  publisher?: string;
}

export interface JobMatch extends JobListing {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface SkillGap {
  skill: string;
  frequency: number; // how many jobs require it
  priority: "high" | "medium" | "low";
  category: SkillCategory;
  roadmap?: LearningResource[];
}

export type SkillCategory =
  | "language"
  | "framework"
  | "database"
  | "cloud"
  | "tool"
  | "soft"
  | "other";

export interface LearningResource {
  type: "course" | "book" | "tutorial" | "documentation" | "practice";
  name: string;
  url?: string;
  free: boolean;
  estimatedTime?: string;
}

export interface RoadmapItem {
  skill: string;
  priority: "high" | "medium" | "low";
  estimatedTime: string;
  why: string;
  resources: LearningResource[];
  category: SkillCategory;
}

export type AnalysisStep =
  | "idle"
  | "uploading"
  | "parsing"
  | "reviewing"
  | "searching"
  | "analyzing"
  | "done"
  | "error"
  | "needs_resume";

export interface AnalysisState {
  step: AnalysisStep;
  error?: string;
  resume?: ResumeData;
  jobs?: JobMatch[];
  skillGaps?: SkillGap[];
  roadmap?: RoadmapItem[];
  topMissingSkills?: string[];
}
