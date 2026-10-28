const ON = new Set(["1", "true", "yes"]);

export function isCoachLiveEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const raw = env.COACH_LIVE_ENABLED?.trim().toLowerCase() ?? "";
  return ON.has(raw);
}
