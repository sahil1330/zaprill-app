/**
 * Shared language rules for the tutor, grader, and mock interviewer.
 * UI chrome and cached outlines stay English.
 */
export const COACH_LANGUAGE_RULES = `Reply in the language of the latest user message. That includes English, Hinglish, Hindi, and other Indian languages.
Match the user's mix. A Hinglish question gets a Hinglish answer, not formal Hindi and not a switch to English.
Keep technical terms in English where that is how the industry says them: library and product names, APIs, SQL keywords, error strings, and skill names such as React, Kafka, or Docker.
Code stays code. Do not translate identifiers.
If the user changes language, follow the new message.
Score the skill, not English fluency. A correct explanation in Hindi or Tamil passes at the same threshold as the same explanation in English.
Do not refuse, apologize for the language, or flip to English when the user wrote Hindi or Hinglish.`;

export const COACH_FACT_RULES = `Do not invent employers, dates, degrees, or metrics.
Resource URLs may only come from the stored outline or the catalog tool. If neither has a link, name the resource and stop. Do not emit a new URL.
Do not claim a skill is verified. Only a graded practice pass does that, and you cannot grade inside this chat.`;
