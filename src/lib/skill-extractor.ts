import type { SkillCategory } from "@/types";

// Master skills taxonomy with categories
export const SKILLS_TAXONOMY: Record<string, SkillCategory> = {
  // ─── Programming Languages ───────────────────────────────────────────────
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
  lua: "language",
  perl: "language",
  groovy: "language",
  "c language": "language",
  solidity: "language",
  vba: "language",
  cobol: "language",
  fortran: "language",
  assembly: "language",
  "objective-c": "language",

  // ─── Web Frameworks & Libraries ──────────────────────────────────────────
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
  restful: "framework",
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
  "asp.net": "framework",
  ".net": "framework",
  dotnet: "framework",
  "spring mvc": "framework",
  hibernate: "framework",
  jquery: "framework",
  nuxtjs: "framework",
  "nuxt.js": "framework",
  "three.js": "framework",
  "d3.js": "framework",
  "socket.io": "tool",
  websockets: "tool",
  grpc: "framework",
  "micro services": "framework",
  microservices: "framework",
  "web components": "framework",

  // ─── Databases ────────────────────────────────────────────────────────────
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
  oracle: "database",
  "ms sql": "database",
  "sql server": "database",
  mssql: "database",
  "oracle database": "database",
  mariadb: "database",
  hbase: "database",
  snowflake: "database",
  bigquery: "database",
  redshift: "database",
  "azure sql": "database",
  "cosmos db": "database",
  "cloud firestore": "database",

  // ─── Cloud & DevOps ───────────────────────────────────────────────────────
  aws: "cloud",
  azure: "cloud",
  gcp: "cloud",
  "google cloud": "cloud",
  "aws lambda": "cloud",
  ec2: "cloud",
  s3: "cloud",
  "azure devops": "cloud",
  cloudflare: "cloud",
  heroku: "cloud",
  vercel: "cloud",
  netlify: "cloud",
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
  unix: "tool",
  "gitlab ci": "tool",
  "circle ci": "tool",
  circleci: "tool",
  helm: "tool",
  prometheus: "tool",
  grafana: "tool",
  "new relic": "tool",
  datadog: "tool",
  splunk: "tool",
  pulumi: "tool",
  vagrant: "tool",

  // ─── Developer Tools ─────────────────────────────────────────────────────
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
  bitbucket: "tool",
  confluence: "tool",
  notion: "tool",
  trello: "tool",
  slack: "tool",
  "vs code": "tool",
  intellij: "tool",
  "visual studio": "tool",

  // ─── AI & Machine Learning ───────────────────────────────────────────────
  "machine learning": "other",
  "deep learning": "other",
  nlp: "other",
  "natural language processing": "other",
  "computer vision": "other",
  openai: "other",
  langchain: "other",
  "llm fine-tuning": "other",
  huggingface: "other",
  "data science": "other",
  "generative ai": "other",
  "large language models": "other",
  llm: "other",
  "prompt engineering": "other",
  "reinforcement learning": "other",
  "neural networks": "other",
  "data analysis": "other",
  "data visualization": "other",
  "feature engineering": "other",
  "model deployment": "other",
  mlops: "other",
  "a/b testing": "other",
  statistics: "other",
  pandas: "other",
  numpy: "other",
  scipy: "other",
  matplotlib: "other",
  seaborn: "other",
  "power bi": "other",
  tableau: "other",
  "looker studio": "other",
  excel: "other",
  "google sheets": "other",
  "data mining": "other",
  etl: "other",
  "data warehousing": "other",
  "business intelligence": "other",

  // ─── Design & Creative ───────────────────────────────────────────────────
  "graphic design": "other",
  "ui design": "other",
  "ux design": "other",
  "ui/ux": "other",
  "user interface": "other",
  "user experience": "other",
  photoshop: "tool",
  illustrator: "tool",
  "adobe illustrator": "tool",
  "adobe photoshop": "tool",
  "adobe xd": "tool",
  "adobe indesign": "tool",
  "adobe premiere": "tool",
  "adobe after effects": "tool",
  "adobe creative suite": "tool",
  "adobe creative cloud": "tool",
  indesign: "tool",
  "after effects": "tool",
  "premiere pro": "tool",
  canva: "tool",
  sketch: "tool",
  invision: "tool",
  zeplin: "tool",
  framer: "tool",
  "motion graphics": "other",
  "video editing": "other",
  "3d modeling": "other",
  "3d animation": "other",
  blender: "tool",
  "cinema 4d": "tool",
  "final cut pro": "tool",
  davinci: "tool",
  typography: "other",
  branding: "other",
  "visual design": "other",
  "logo design": "other",
  illustration: "other",
  "color theory": "other",
  wireframing: "other",
  prototyping: "other",
  "user research": "other",
  "usability testing": "other",
  "information architecture": "other",
  "design thinking": "other",
  "design systems": "other",

  // ─── Digital Marketing ───────────────────────────────────────────────────
  seo: "other",
  "search engine optimization": "other",
  sem: "other",
  "search engine marketing": "other",
  ppc: "other",
  "pay per click": "other",
  "google ads": "other",
  "facebook ads": "other",
  "meta ads": "other",
  "instagram ads": "other",
  "linkedin ads": "other",
  "social media marketing": "other",
  "social media management": "other",
  "content marketing": "other",
  "content creation": "other",
  "content strategy": "other",
  "email marketing": "other",
  "affiliate marketing": "other",
  "influencer marketing": "other",
  "growth hacking": "other",
  "digital marketing": "other",
  "performance marketing": "other",
  "lead generation": "other",
  crm: "tool",
  hubspot: "tool",
  salesforce: "tool",
  mailchimp: "tool",
  "google analytics": "tool",
  "google tag manager": "tool",
  "meta pixel": "tool",
  "facebook pixel": "tool",
  semrush: "tool",
  ahrefs: "tool",
  moz: "tool",
  "screaming frog": "tool",
  "marketing automation": "other",
  "conversion rate optimization": "other",
  cro: "other",
  "landing page optimization": "other",
  copywriting: "other",
  "blog writing": "other",
  "technical writing": "other",
  wordpress: "tool",
  shopify: "tool",
  woocommerce: "tool",
  "e-commerce": "other",

  // ─── Finance & Accounting ────────────────────────────────────────────────
  accounting: "other",
  "financial analysis": "other",
  "financial modeling": "other",
  "financial reporting": "other",
  "financial planning": "other",
  budgeting: "other",
  forecasting: "other",
  auditing: "other",
  taxation: "other",
  gst: "other",
  tds: "other",
  tally: "tool",
  "tally erp": "tool",
  quickbooks: "tool",
  sap: "tool",
  "sap fico": "tool",
  "sap mm": "tool",
  "sap sd": "tool",
  "ms excel": "tool",
  "advanced excel": "tool",
  "pivot tables": "other",
  vlookup: "other",
  "balance sheet": "other",
  "cash flow": "other",
  "profit and loss": "other",
  "p&l": "other",
  investment: "other",
  "equity research": "other",
  valuation: "other",
  "risk management": "other",
  compliance: "other",
  "internal audit": "other",
  ifrs: "other",
  "ind as": "other",
  gaap: "other",
  "cost accounting": "other",
  "management accounting": "other",
  treasury: "other",

  // ─── HR & Recruitment ─────────────────────────────────────────────────────
  recruitment: "other",
  "talent acquisition": "other",
  "hr management": "other",
  "human resources": "other",
  onboarding: "other",
  "payroll management": "other",
  "performance management": "other",
  "employee relations": "other",
  "learning and development": "other",
  "compensation and benefits": "other",
  "hr policies": "other",
  "labor law": "other",
  "workforce planning": "other",
  "hr analytics": "other",
  "applicant tracking": "other",
  "talent management": "other",

  // ─── Sales & Business Development ────────────────────────────────────────
  "business development": "other",
  "sales management": "other",
  "account management": "other",
  "client management": "other",
  "customer acquisition": "other",
  "customer retention": "other",
  "b2b sales": "other",
  "b2c sales": "other",
  negotiation: "other",
  "pipeline management": "other",
  "cold calling": "other",
  "market research": "other",
  "competitor analysis": "other",
  "product marketing": "other",
  "go-to-market": "other",

  // ─── Project & Operations Management ────────────────────────────────────
  "project management": "other",
  "product management": "other",
  "operations management": "other",
  "supply chain": "other",
  logistics: "other",
  procurement: "other",
  "vendor management": "other",
  "stakeholder management": "other",
  "change management": "other",
  "process improvement": "other",
  "lean management": "other",
  "six sigma": "other",
  "quality assurance": "other",
  qa: "other",
  "quality control": "other",
  erp: "tool",
  "ms project": "tool",
  asana: "tool",
  monday: "tool",
  "monday.com": "tool",
  basecamp: "tool",
  smartsheet: "tool",

  // ─── Soft Skills ─────────────────────────────────────────────────────────
  agile: "soft",
  scrum: "soft",
  kanban: "soft",
  "team leadership": "soft",
  communication: "soft",
  "problem solving": "soft",
  "critical thinking": "soft",
  "time management": "soft",
  "attention to detail": "soft",
  collaboration: "soft",
  adaptability: "soft",
  creativity: "soft",
  "analytical skills": "soft",
  "presentation skills": "soft",
  multitasking: "soft",
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
  "ui/ux design": "ui/ux",
  "ux/ui": "ui/ux",
  "search engine optimisation": "seo",
  "ms excel": "excel",
  "advanced excel": "excel",
  "microsoft excel": "excel",
  "google workspace": "google sheets",
  "g suite": "google sheets",
  "adobe cc": "adobe creative cloud",
  "adobe cs": "adobe creative suite",
  "after effect": "after effects",
  pr: "premiere pro",
  "adobe premiere pro": "premiere pro",
  "restful api": "rest api",
  "rest apis": "rest api",
  "graphql api": "graphql",
  "micro-services": "microservices",
  dotnet: ".net",
  "asp.net core": "asp.net",
  "dot net": ".net",
  "c lang": "c language",
  golang: "go",
  "google adwords": "google ads",
  "fb ads": "facebook ads",
  "insta ads": "instagram ads",
  "sem/ppc": "ppc",
  "quality control": "quality assurance",
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
 * Contextual patterns: capture skills listed after signal phrases like
 * "proficiency in X", "experience with X", "skills: X, Y, Z"
 * Works even on truncated descriptions.
 */
const CONTEXT_PATTERNS: RegExp[] = [
  // "proficiency in React, TypeScript and Node.js"
  /proficien(?:t|cy)\s+(?:in|with)\s+([\w\s./#,+]+?)(?:\.|,\s*(?:and|or)\s*[\w]+\s*\.|\n|$)/gi,
  // "experience with / in Python, FastAPI"
  /experience\s+(?:in|with)\s+([\w\s./#,+]+?)(?:\.|,\s*(?:and|or)\s*[\w]+\s*\.|\n|$)/gi,
  // "expertise in / with"
  /expertise\s+(?:in|with)\s+([\w\s./#,+]+?)(?:\.|,\s*(?:and|or)\s*[\w]+\s*\.|\n|$)/gi,
  // "hands-on experience with"
  /hands[-\s]on\s+(?:experience|knowledge)?\s*(?:in|with)\s+([\w\s./#,+]+?)(?:\.|,\s*(?:and|or)|\n|$)/gi,
  // "knowledge of React, Redux"
  /knowledge\s+of\s+([\w\s./#,+]+?)(?:\.|,\s*(?:and|or)|\n|$)/gi,
  // "familiarity with"
  /familiar(?:ity)?\s+with\s+([\w\s./#,+]+?)(?:\.|,\s*(?:and|or)|\n|$)/gi,
  // "skills: React, TypeScript, Node.js"
  /skills?\s*:\s*([\w\s./#,+]+?)(?:\.|,\s*(?:and|or)|\n|$)/gi,
  // "tools: Figma, Sketch, Adobe XD"
  /tools?\s*:\s*([\w\s./#,+]+?)(?:\.|,\s*(?:and|or)|\n|$)/gi,
  // "requirements: ..."
  /requirements?\s*:\s*([\w\s./#,+]+?)(?:\.|,\s*(?:and|or)|\n|$)/gi,
  // "tech stack: ..."
  /(?:tech|technology)\s+stack\s*:\s*([\w\s./#,+]+?)(?:\.|,\s*(?:and|or)|\n|$)/gi,
  // "working knowledge of"
  /working\s+knowledge\s+of\s+([\w\s./#,+]+?)(?:\.|,\s*(?:and|or)|\n|$)/gi,
  // "must know / must have"
  /must\s+(?:know|have|possess)\s+([\w\s./#,+]+?)(?:\.|,\s*(?:and|or)|\n|$)/gi,
];

/**
 * Extract skill mentions from free-form text (job descriptions, resumes).
 * Uses both direct taxonomy matching and contextual pattern extraction.
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];

  const lower = text.toLowerCase();
  const found = new Set<string>();

  // 1-2 letter tokens collide with English ("go", "r", "c", "qa").
  // Skip them in taxonomy pass 1; pass 2 still picks them up from skill lists.
  const ambiguousShort = new Set(["r", "c", "go", "qa", "pr"]);

  // ── Pass 1: Direct taxonomy matching ──────────────────────────────────────
  for (const skill of Object.keys(SKILLS_TAXONOMY)) {
    if (skill.length <= 1) continue;
    // Escape regex special chars in skill name
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Word-boundary aware: don't match "java" inside "javascript" etc.
    const regex = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
    if (ambiguousShort.has(skill)) continue;
    if (regex.test(lower)) {
      found.add(skill);
    }
  }

  // ── Pass 2: Contextual extraction from signal phrases ─────────────────────
  // Even if the description is truncated, these phrases often appear early.
  for (const pattern of CONTEXT_PATTERNS) {
    pattern.lastIndex = 0; // reset stateful regex
    for (
      let match = pattern.exec(text);
      match !== null;
      match = pattern.exec(text)
    ) {
      const raw = match[1] ?? "";
      // Split on commas, "and", "or", "/"
      const candidates = raw
        .split(/,|\band\b|\bor\b|\//i)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 1 && s.length < 40);

      for (const candidate of candidates) {
        const normalized = normalizeSkill(candidate);
        if (SKILLS_TAXONOMY[normalized]) {
          found.add(normalized);
        }
      }
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
