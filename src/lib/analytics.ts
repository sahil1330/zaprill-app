/**
 * analytics.ts
 *
 * Single source of truth for all GA4 telemetry in Zaprill.
 * NO component should call gtag() directly — always use these typed helpers.
 *
 * Architecture:
 *  - All events are named + fully typed
 *  - debug_mode is automatically injected in development
 *  - SSR-safe: every call guards against window being undefined
 *
 * GA4 Measurement ID is read from NEXT_PUBLIC_GA4_MEASUREMENT_ID.
 */

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";

/** True in development — routes events to GA4 DebugView */
const IS_DEBUG = process.env.NODE_ENV === "development";

// ─────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────

type GtagCommand = "config" | "event" | "set" | "js" | "consent";

/** Type-safe wrapper around the global gtag() injected by @next/third-parties */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function gtag(
  command: GtagCommand,
  target: string,
  params?: Record<string, any>,
): void {
  const payload = IS_DEBUG ? { ...params, debug_mode: true } : params;

  if (IS_DEBUG) {
    console.log(`[Analytics] ${command} ${target}`, payload);
  }

  if (typeof window === "undefined" || typeof window.gtag !== "function")
    return;
  if (!GA_MEASUREMENT_ID) return;

  window.gtag(command, target, payload);
}

// ─────────────────────────────────────────────────────────
// Generic dispatcher (escape hatch for one-off events)
// ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function track(eventName: string, params?: Record<string, any>): void {
  gtag("event", eventName, params);
}

// ─────────────────────────────────────────────────────────
// User identity & properties
// ─────────────────────────────────────────────────────────

/**
 * Associate the current session with an internal user ID.
 * NEVER pass raw email — use the opaque DB UUID.
 * Must be called after the user authenticates.
 */
export function setUserId(userId: string): void {
  gtag("config", GA_MEASUREMENT_ID, { user_id: userId });
  gtag("set", "user_properties", { user_id: userId });
}

/** Clear user identity (called on sign-out) */
export function clearUserId(): void {
  gtag("config", GA_MEASUREMENT_ID, { user_id: undefined });
  gtag("set", "user_properties", { user_id: undefined });
}

/**
 * Fire a manual page_view event.
 * Required for Next.js App Router — client-side navigations don't
 * automatically trigger gtag page views.
 */
export function trackPageView(url: string, title?: string): void {
  gtag("event", "page_view", {
    page_location: url,
    page_title: title ?? document.title,
    send_to: GA_MEASUREMENT_ID,
  });
}

// ─────────────────────────────────────────────────────────
// Live user / Realtime tracking
// ─────────────────────────────────────────────────────────

/**
 * Heartbeat event — fires every 30 seconds to keep the user
 * appearing in GA4 Realtime "active users" report.
 * Returns a cleanup function to stop the interval.
 */
export function startHeartbeat(): () => void {
  const INTERVAL_MS = 30_000;

  const fire = () => {
    gtag("event", "user_engagement", {
      engagement_time_msec: INTERVAL_MS,
    });
  };

  fire(); // fire immediately on mount
  const id = window.setInterval(fire, INTERVAL_MS);
  return () => window.clearInterval(id);
}

// ─────────────────────────────────────────────────────────
// Authentication events
// ─────────────────────────────────────────────────────────

export function trackSignUpStart(): void {
  gtag("event", "sign_up_start");
}

/**
 * GA4 recommended event: sign_up
 * @param method  'email' | 'github' | 'google'
 */
export function trackSignUp(method: "email" | "github" | "google"): void {
  gtag("event", "sign_up", { method });
}

export function trackLoginStart(): void {
  gtag("event", "login_start");
}

/**
 * GA4 recommended event: login
 * @param method  'email' | 'github' | 'google'
 */
export function trackLogin(method: "email" | "github" | "google"): void {
  gtag("event", "login", { method });
}

export function trackOAuthProviderSelected(
  provider: "github" | "google",
): void {
  gtag("event", "select_content", {
    content_type: "oauth_provider",
    item_id: provider,
  });
}

export function trackSessionExpired(): void {
  gtag("event", "session_expired");
}

// ─────────────────────────────────────────────────────────
// Resume upload & parsing events
// ─────────────────────────────────────────────────────────

export interface ResumeFileParams {
  file_type: string; // 'pdf' | 'docx' | 'txt'
  file_size_kb: number;
}

export function trackResumeFileSelected(params: ResumeFileParams): void {
  gtag("event", "resume_file_selected", params);
}

export function trackResumeUploadStart(params: ResumeFileParams): void {
  gtag("event", "resume_upload_start", params);
}

export interface ResumeParseSuccessParams extends ResumeFileParams {
  skill_count: number;
  has_location: boolean;
  experience_count: number;
  duration_ms: number;
}

export function trackResumeParseSuccess(
  params: ResumeParseSuccessParams,
): void {
  gtag("event", "resume_parse_success", params);
}

export function trackResumeParseFailure(params: {
  error_message: string;
  file_type?: string;
}): void {
  gtag("event", "resume_parse_failure", params);
}

export function trackSavedProfileUsed(): void {
  gtag("event", "saved_profile_used");
}

export function trackResumeReplaced(): void {
  gtag("event", "resume_replaced");
}

// ─────────────────────────────────────────────────────────
// Analysis pipeline events
// ─────────────────────────────────────────────────────────

export function trackAnalysisStart(params: {
  skill_count: number;
  search_location?: string;
  is_location_override: boolean;
}): void {
  gtag("event", "analysis_start", params);
}

export function trackJobSearchComplete(params: {
  job_count: number;
  search_location?: string;
  duration_ms: number;
}): void {
  gtag("event", "job_search_complete", params);
}

export function trackGapAnalysisComplete(params: {
  skill_gaps_count: number;
  roadmap_items_count: number;
  duration_ms: number;
}): void {
  gtag("event", "gap_analysis_complete", params);
}

export function trackAnalysisComplete(params: {
  job_count: number;
  top_match_score: number;
  avg_match_score: number;
  skill_gaps_count: number;
  roadmap_items_count: number;
  analysis_duration_ms: number;
  search_location?: string;
}): void {
  gtag("event", "analysis_complete", params);
}

export function trackAnalysisError(params: {
  error_message: string;
  step: string;
}): void {
  gtag("event", "analysis_error", params);
}

export function trackLocationSearch(params: {
  city: string;
  triggered_by: "combobox_change" | "search_button";
}): void {
  gtag("event", "location_search", params);
}

// ─────────────────────────────────────────────────────────
// Job results interaction events
// ─────────────────────────────────────────────────────────

export interface JobEventParams {
  job_id: string;
  job_title: string;
  company_name: string;
  match_score: number;
  is_remote: boolean;
  job_rank: number;
}

/**
 * GA4 e-commerce recommended event: view_item_list
 * Fired when the jobs tab renders with results.
 */
export function trackJobListViewed(params: {
  job_count: number;
  filtered_count: number;
  search_location?: string;
}): void {
  gtag("event", "view_item_list", {
    item_list_id: "job_results",
    item_list_name: "Job Matches",
    ...params,
  });
}

/**
 * GA4 e-commerce recommended event: view_item
 * Fired when a job card enters the viewport (Intersection Observer).
 */
export function trackJobCardImpression(params: JobEventParams): void {
  gtag("event", "view_item", {
    item_list_id: "job_results",
    items: [
      {
        item_id: params.job_id,
        item_name: params.job_title,
        item_brand: params.company_name,
        item_variant: params.is_remote ? "remote" : "onsite",
        index: params.job_rank,
        quantity: 1,
      },
    ],
    match_score: params.match_score,
  });
}

/**
 * GA4 e-commerce recommended event: select_item
 * Fired when a job card link is clicked.
 */
export function trackJobCardClicked(params: JobEventParams): void {
  gtag("event", "select_item", {
    item_list_id: "job_results",
    items: [
      {
        item_id: params.job_id,
        item_name: params.job_title,
        item_brand: params.company_name,
        index: params.job_rank,
      },
    ],
  });
}

/**
 * High-value conversion event: user clicked "Apply" → external job URL opened.
 */
export function trackJobApplied(params: JobEventParams): void {
  gtag("event", "job_applied", {
    ...params,
    event_category: "conversion",
  });
}

// ─────────────────────────────────────────────────────────
// Filter & sort events
// ─────────────────────────────────────────────────────────

export function trackFilterPanelOpen(): void {
  gtag("event", "filter_panel_open");
}

export function trackFilterApplied(params: {
  filter_type:
    | "title"
    | "location"
    | "work_type"
    | "employment_type"
    | "min_match"
    | "require_salary";
  filter_value: string | number | boolean;
}): void {
  gtag("event", "filter_applied", params);
}

export function trackFilterCleared(params: { filter_type: string }): void {
  gtag("event", "filter_cleared", params);
}

export function trackSortChanged(params: {
  sort_by: "match" | "recent";
}): void {
  gtag("event", "sort_changed", params);
}

// ─────────────────────────────────────────────────────────
// Tab & content navigation events
// ─────────────────────────────────────────────────────────

export function trackTabViewed(params: {
  tab_id: "jobs" | "gaps" | "roadmap";
}): void {
  gtag("event", "tab_view", params);
}

export function trackRoadmapItemExpanded(params: {
  skill_name: string;
  priority: "high" | "medium" | "low";
  item_index: number;
}): void {
  gtag("event", "roadmap_item_expanded", params);
}

export function trackResourceLinkClicked(params: {
  skill_name: string;
  resource_name: string;
  resource_type: string;
  resource_url: string;
  is_free: boolean;
}): void {
  gtag("event", "resource_link_click", params);
}

// ─────────────────────────────────────────────────────────
// Save & history events
// ─────────────────────────────────────────────────────────

export function trackAnalysisSaved(params: {
  analysis_id: string;
  job_count: number;
  top_match_score: number;
}): void {
  gtag("event", "analysis_saved", params);
}

export function trackHistoryPageViewed(params: {
  history_item_count: number;
}): void {
  gtag("event", "history_page_view", params);
}

export function trackHistoryItemClicked(params: {
  analysis_id: string;
  top_match_score: number | null;
  total_jobs_found: number | null;
}): void {
  gtag("event", "history_item_click", params);
}

// ─────────────────────────────────────────────────────────
// Error tracking
// ─────────────────────────────────────────────────────────

/**
 * GA4 recommended event: exception
 * @param fatal  true if the error caused the app to crash
 */
export function trackException(description: string, fatal = false): void {
  gtag("event", "exception", { description, fatal });
}

// ─────────────────────────────────────────────────────────
// Window type augmentation for gtag global
// ─────────────────────────────────────────────────────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
  }
}
