export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  skills: string[];
  experience: WorkExperience[];
  projects: Project[];
  education: Education[];
  inferredJobTitles: string[];
  summary?: string;
  totalYearsOfExperience?: number;
  socialProfiles: SocialProfile[];
}

export interface SocialProfile {
  platform: string;
  url: string;
}

export interface WorkExperience {
  role: string;
  company: string;
  duration?: string;
  description: string;
  skillsUsed: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year?: number;
  field?: string;
}

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
  | "error";

export interface AnalysisState {
  step: AnalysisStep;
  error?: string;
  resume?: ParsedResume;
  jobs?: JobMatch[];
  skillGaps?: SkillGap[];
  roadmap?: RoadmapItem[];
  topMissingSkills?: string[];
}
