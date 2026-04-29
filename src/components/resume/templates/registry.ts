import type { TemplateMeta } from "@/types/resume";

// ─────────────────────────────────────────────────
// Template Registry — Code-driven, not DB-driven
// All templates are React components loaded lazily.
// ─────────────────────────────────────────────────

export const TEMPLATE_REGISTRY: TemplateMeta[] = [
  {
    slug: "minimalist",
    name: "Minimalist",
    description:
      "Clean single-column layout with elegant typography. Ideal for any industry.",
    category: "general",
    layout: "single-column",
    atsScore: 95,
    isPremium: false,
  },
  {
    slug: "tech-stack",
    name: "Tech Stack",
    description:
      "Two-column layout with a dedicated skills sidebar. Built for engineers.",
    category: "tech",
    layout: "two-column",
    atsScore: 90,
    isPremium: false,
  },
  {
    slug: "executive-pro",
    name: "Executive Pro",
    description:
      "Refined single-column with serif accents. Perfect for senior leadership roles.",
    category: "business",
    layout: "single-column",
    atsScore: 92,
    isPremium: false,
  },
  {
    slug: "creative-portfolio",
    name: "Creative Portfolio",
    description:
      "Vibrant layout with color accents and a portfolio section. For designers and marketers.",
    category: "creative",
    layout: "hybrid",
    atsScore: 82,
    isPremium: true,
  },
  {
    slug: "modern-split",
    name: "Modern Split",
    description:
      "Bold header with a sidebar layout. Great for consulting and strategy roles.",
    category: "business",
    layout: "sidebar",
    atsScore: 88,
    isPremium: true,
  },
];

/**
 * Look up a template by slug.
 */
export function getTemplateMeta(slug: string): TemplateMeta | undefined {
  return TEMPLATE_REGISTRY.find((t) => t.slug === slug);
}

/**
 * Get templates available for a given tier.
 * Free tier only sees non-premium templates.
 */
export function getAvailableTemplates(isPro: boolean): TemplateMeta[] {
  if (isPro) return TEMPLATE_REGISTRY;
  return TEMPLATE_REGISTRY.filter((t) => !t.isPremium);
}
