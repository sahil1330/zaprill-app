import type { LearningResource, SkillCategory } from "@/types";

/**
 * A registry of "Golden Links" for the most common technical skills.
 * These are verified, high-quality, and stable.
 */
const GOLDEN_LINKS: Record<string, string> = {
  // Languages
  javascript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  typescript: "https://www.typescriptlang.org/docs/",
  python: "https://docs.python.org/3/",
  java: "https://docs.oracle.com/en/java/",
  go: "https://go.dev/doc/",
  rust: "https://doc.rust-lang.org/book/",
  cpp: "https://en.cppreference.com/w/",
  sql: "https://mode.com/sql-tutorial/",
  html: "https://developer.mozilla.org/en-US/docs/Web/HTML",
  css: "https://developer.mozilla.org/en-US/docs/Web/CSS",

  // Frameworks & Libraries
  react: "https://react.dev/learn",
  nextjs: "https://nextjs.org/docs",
  vue: "https://vuejs.org/guide/introduction.html",
  angular: "https://angular.io/docs",
  node: "https://nodejs.org/en/docs/",
  express: "https://expressjs.com/",
  nestjs: "https://docs.nestjs.com/",
  django: "https://docs.djangoproject.com/",
  flask: "https://flask.palletsprojects.com/",
  spring: "https://spring.io/projects/spring-framework",
  laravel: "https://laravel.com/docs",
  tailwindcss: "https://tailwindcss.com/docs",
  redux: "https://redux.js.org/introduction/getting-started",
  trpc: "https://trpc.io/docs",

  // Databases
  postgresql: "https://www.postgresql.org/docs/",
  mongodb: "https://www.mongodb.com/docs/",
  mysql: "https://dev.mysql.com/doc/",
  redis: "https://redis.io/documentation",
  sqlite: "https://www.sqlite.org/docs.html",
  prisma: "https://www.prisma.io/docs",
  drizzle: "https://orm.drizzle.team/docs/overview",

  // Cloud & DevOps
  aws: "https://docs.aws.amazon.com/",
  docker: "https://docs.docker.com/get-started/",
  kubernetes: "https://kubernetes.io/docs/home/",
  terraform: "https://developer.hashicorp.com/terraform/docs",
  github: "https://docs.github.com/en",
  jenkins: "https://www.jenkins.io/doc/",
  nginx: "https://nginx.org/en/docs/",
  firebase: "https://firebase.google.com/docs",

  // Utilities & Tools
  git: "https://git-scm.com/doc",
  npm: "https://docs.npmjs.com/",
  yarn: "https://yarnpkg.com/getting-started",
  vite: "https://vitejs.dev/guide/",
  webpack: "https://webpack.js.org/concepts/",
};

/**
 * Enhances a learning resource with reliable links or search fallbacks.
 */
export function enhanceRoadmapResource(
  resource: LearningResource,
  skillName: string,
): LearningResource {
  const normalizedSkill = skillName.toLowerCase().trim();
  const goldenLink = GOLDEN_LINKS[normalizedSkill];

  // 1. If it's documentation and we have a golden link, use it
  if (resource.type === "documentation" && goldenLink) {
    return {
      ...resource,
      url: goldenLink,
      name: `Official ${skillName} Documentation`,
    };
  }

  // 2. If the URL is missing or looks hallucinated (doesn't start with http/https)
  if (!resource.url || !resource.url.startsWith("http")) {
    const query = encodeURIComponent(`learn ${skillName} ${resource.type}`);
    return {
      ...resource,
      url: `https://www.google.com/search?q=${query}`,
      name: `${resource.name} (Search Result)`,
    };
  }

  // 3. Fallback for common high-authority sites that might have changed paths
  // If the LLM generates a dead-looking Udemy or Coursera link, we can sometimes normalize it,
  // but for now, we'll trust it if it looks valid, or the prompt will fix it.

  return resource;
}
