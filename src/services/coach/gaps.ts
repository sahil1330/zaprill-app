import { createHash } from "node:crypto";
import { normalizeCareerKey } from "@/lib/career/derive";
import { categorizeSkill } from "@/lib/skill-extractor";
import {
  type CoachTechnicalCategory,
  isTechnicalCategory,
} from "@/services/coach/limits";
import type { LearningResource, RoadmapItem, SkillGap } from "@/types";

export interface CoachOutlineModule {
  key: string;
  title: string;
  objective: string;
  estimatedMinutes: number;
  resources: LearningResource[];
}

export interface CoachOutline {
  why: string;
  estimatedTime: string;
  modules: CoachOutlineModule[];
}

export interface PreparedCoachGap {
  skillKey: string;
  displayName: string;
  priority: "high" | "medium" | "low";
  category: CoachTechnicalCategory;
  outline: CoachOutline;
  gapEvidence: { frequency?: number; source: "job_match" };
}

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const;

function moduleKey(title: string, index: number): string {
  const slug = normalizeCareerKey(title).replace(/[^a-z0-9]+/g, "-");
  return slug ? `${slug}-${index + 1}` : `module-${index + 1}`;
}

export function shellOutline(displayName: string): CoachOutline {
  return {
    why: "",
    estimatedTime: "",
    modules: [
      {
        key: "start",
        title: displayName,
        objective: "",
        estimatedMinutes: 0,
        resources: [],
      },
    ],
  };
}

export function outlineFromRoadmap(item: RoadmapItem): CoachOutline {
  return {
    why: item.why,
    estimatedTime: item.estimatedTime,
    modules: [
      {
        key: moduleKey(item.skill, 0),
        title: item.skill,
        objective: item.why,
        estimatedMinutes: 0,
        resources: item.resources ?? [],
      },
    ],
  };
}

export function isShellOutline(outline: CoachOutline): boolean {
  return outline.modules.every(
    (module) => module.objective.trim() === "" && module.resources.length === 0,
  );
}

/**
 * Match-engine gaps, re-keyed with normalizeCareerKey.
 * Drops skills the profile already has, and drops soft / other.
 */
export function prepareCoachGaps(input: {
  skillGaps: SkillGap[];
  roadmap: RoadmapItem[];
  ownedNormalizedNames: ReadonlySet<string>;
}): PreparedCoachGap[] {
  const roadmapByKey = new Map<string, RoadmapItem>();
  for (const item of input.roadmap) {
    const key = normalizeCareerKey(item.skill);
    if (key) roadmapByKey.set(key, item);
  }

  const byKey = new Map<string, PreparedCoachGap>();
  for (const gap of input.skillGaps) {
    const displayName = gap.skill.trim();
    const skillKey = normalizeCareerKey(displayName);
    if (!skillKey || input.ownedNormalizedNames.has(skillKey)) continue;

    const category = gap.category || categorizeSkill(displayName);
    if (!isTechnicalCategory(category)) continue;

    const roadmapItem = roadmapByKey.get(skillKey);
    const prepared: PreparedCoachGap = {
      skillKey,
      displayName,
      priority: gap.priority,
      category,
      outline: roadmapItem
        ? outlineFromRoadmap(roadmapItem)
        : shellOutline(displayName),
      gapEvidence: { frequency: gap.frequency, source: "job_match" },
    };

    const existing = byKey.get(skillKey);
    if (
      !existing ||
      PRIORITY_RANK[prepared.priority] < PRIORITY_RANK[existing.priority]
    ) {
      byKey.set(skillKey, prepared);
    }
  }

  return [...byKey.values()].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  );
}

export function gapFingerprint(skillKeys: string[]): string {
  const sorted = [...new Set(skillKeys)].sort();
  return createHash("sha256").update(sorted.join("|")).digest("hex");
}
