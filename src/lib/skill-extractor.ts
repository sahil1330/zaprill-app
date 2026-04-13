import type { SkillCategory } from "@/types";

// Master skills taxonomy with categories
export const SKILLS_TAXONOMY: Record<string, SkillCategory> = {
  // Languages
  javascript: "language",
  typescript: "language",
  python: "language",
  java: "language",
  "c++": "language",
  "c#": "language",
  go: "language",
  rust: "language",
  ruby: "language",
  php: "language",
  swift: "language",
  kotlin: "language",
  scala: "language",
  r: "language",
  matlab: "language",
  html: "language",
  css: "language",
  sql: "language",
  bash: "language",
  shell: "language",
  dart: "language",
  elixir: "language",
  haskell: "language",
  // Frameworks & Libraries
  react: "framework",
  "next.js": "framework",
  nextjs: "framework",
  "vue.js": "framework",
  vuejs: "framework",
  angular: "framework",
  svelte: "framework",
  "node.js": "framework",
  nodejs: "framework",
  express: "framework",
  fastapi: "framework",
  django: "framework",
  flask: "framework",
  "spring boot": "framework",
  springboot: "framework",
  laravel: "framework",
  rails: "framework",
  "ruby on rails": "framework",
  tensorflow: "framework",
  pytorch: "framework",
  "scikit-learn": "framework",
  tailwindcss: "framework",
  tailwind: "framework",
  bootstrap: "framework",
  graphql: "framework",
  "rest api": "framework",
  trpc: "framework",
  redux: "framework",
  zustand: "framework",
  "react query": "framework",
  tanstack: "framework",
  prisma: "framework",
  drizzle: "framework",
  nestjs: "framework",
  "nest.js": "framework",
  astro: "framework",
  remix: "framework",
  gatsby: "framework",
  vite: "framework",
  // Databases
  postgresql: "database",
  postgres: "database",
  mysql: "database",
  mongodb: "database",
  redis: "database",
  sqlite: "database",
  cassandra: "database",
  dynamodb: "database",
  elasticsearch: "database",
  supabase: "database",
  firebase: "database",
  planetscale: "database",
  cockroachdb: "database",
  neo4j: "database",
  influxdb: "database",
  // Cloud & DevOps
  aws: "cloud",
  azure: "cloud",
  gcp: "cloud",
  "google cloud": "cloud",
  docker: "tool",
  kubernetes: "tool",
  k8s: "tool",
  terraform: "tool",
  ansible: "tool",
  jenkins: "tool",
  "github actions": "tool",
  "ci/cd": "tool",
  gitlab: "tool",
  nginx: "tool",
  linux: "tool",
  // Tools
  git: "tool",
  github: "tool",
  jira: "tool",
  figma: "tool",
  webpack: "tool",
  babel: "tool",
  eslint: "tool",
  jest: "tool",
  vitest: "tool",
  playwright: "tool",
  cypress: "tool",
  storybook: "tool",
  postman: "tool",
  swagger: "tool",
  openapi: "tool",
  kafka: "tool",
  rabbitmq: "tool",
  "socket.io": "tool",
  websockets: "tool",
  // AI/ML
  "machine learning": "other",
  "deep learning": "other",
  nlp: "other",
  "computer vision": "other",
  openai: "other",
  langchain: "other",
  "llm fine-tuning": "other",
  huggingface: "other",
  "data science": "other",
  // Soft skills
  agile: "soft",
  scrum: "soft",
  "team leadership": "soft",
  communication: "soft",
  "problem solving": "soft",
};

const SKILL_ALIASES: Record<string, string> = {
  nodejs: "node.js",
  nextjs: "next.js",
  reactjs: "react",
  vuejs: "vue.js",
  springboot: "spring boot",
  postgres: "postgresql",
  k8s: "kubernetes",
  gcp: "google cloud",
  tailwind: "tailwindcss",
  es6: "javascript",
  es2015: "javascript",
  "git/github": "git",
  "html/css": "html",
  "rest/graphql": "rest api",
  "nodejs/express": "node.js",
  expressjs: "express",
  "express.js": "express",
};

export function normalizeSkill(skill: string): string {
  const lower = skill.toLowerCase().trim();
  return SKILL_ALIASES[lower] ?? lower;
}

export function categorizeSkill(skill: string): SkillCategory {
  const normalized = normalizeSkill(skill);
  return SKILLS_TAXONOMY[normalized] ?? "other";
}

/**
 * Extract skill mentions from free-form text (job descriptions, resumes)
 */
export function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  for (const skill of Object.keys(SKILLS_TAXONOMY)) {
    // Match whole word boundaries (handle special chars in skill names)
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
    if (regex.test(lower)) {
      found.add(skill);
    }
  }

  return Array.from(found);
}

/**
 * Normalize an array of skills — deduplicate and canonicalize
 */
export function normalizeSkillList(skills: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const s of skills) {
    const n = normalizeSkill(s);
    if (n && !seen.has(n)) {
      seen.add(n);
      result.push(n);
    }
  }
  return result;
}
