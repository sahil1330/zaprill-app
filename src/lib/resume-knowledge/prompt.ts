import {
  fieldGuidance,
  LAYOUT_RULES,
  maxPagesFor,
  regionGuidance,
  sectionOrderFor,
  stageGuidance,
} from "./catalog";
import type { ResumeAudience } from "./detect";
import { sourceById } from "./sources";
import { KNOWLEDGE_VERSION, RESUME_FIELDS, type ResumeField } from "./types";

export function guidanceFor(
  audience: ResumeAudience,
  fieldOverride?: ResumeField,
): string {
  const field = fieldOverride ?? audience.field;
  const fieldText = fieldGuidance(field);
  const stageText = stageGuidance(audience.stage);
  const regionText = regionGuidance(audience.region);
  const order = sectionOrderFor(audience.stage, field);
  const maxPages = maxPagesFor(field, audience.stage, audience.years);
  const ids = [
    ...new Set([
      ...fieldText.sourceIds,
      ...stageText.sourceIds,
      ...regionText.sourceIds,
    ]),
  ];
  const cites = ids
    .map((id) => sourceById(id))
    .filter((source) => source != null)
    .map((source) => `- ${source.title}, ${source.publisher}: ${source.url}`)
    .join("\n");

  return `Resume knowledge ${KNOWLEDGE_VERSION}. This is the slice for this person, not the full catalog.
Field: ${field}. Stage: ${audience.stage}. Region: ${audience.region}. Years on file: ${audience.years ?? "unknown"}.
${fieldText.summary}
${stageText.summary}
${regionText.summary}
Section order: ${order.join(" > ")}.
Length: ${maxPages} page maximum for this slice. Academic CVs are the exception and may run longer.
Template: ${fieldText.templateSlug}, single column. Font ${LAYOUT_RULES.preferredFont} ${LAYOUT_RULES.fontSizeMin}-${LAYOUT_RULES.fontSizeMax}pt. Margins at least ${LAYOUT_RULES.marginMmMin}mm.
Bullets: ${LAYOUT_RULES.bullet}
Dates: ${LAYOUT_RULES.dates}
Contact: ${LAYOUT_RULES.contact}
ATS: ${LAYOUT_RULES.ats}
Cite only these sources when you use this slice:
${cites}
Call lookupGuidance for a different field (${RESUME_FIELDS.join(", ")}). Call web_search only when this slice does not answer the question or the user needs a current, employer-specific fact. In the reply, name the source title and URL. Never invent a metric, an employer, or a URL.`;
}
