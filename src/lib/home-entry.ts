export type HomeEntry = "loading" | "sign-in" | "home";

export function resolveHomeEntry(input: {
  sessionLoading: boolean;
  hasSession: boolean;
  profilePending: boolean;
}): HomeEntry {
  if (input.sessionLoading) return "loading";
  if (!input.hasSession) return "sign-in";
  if (input.profilePending) return "loading";
  return "home";
}
