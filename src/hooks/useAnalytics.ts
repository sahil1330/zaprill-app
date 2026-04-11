"use client";

/**
 * useAnalytics.ts
 *
 * React hook that exposes all analytics tracking functions.
 * Also syncs user identity from the auth session automatically.
 *
 * Usage:
 *   const { trackJobApplied } = useAnalytics();
 *   trackJobApplied({ job_id: '...', ... });
 */

import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  setUserId,
  clearUserId,
  track,
  trackPageView,
  trackSignUpStart,
  trackSignUp,
  trackLoginStart,
  trackLogin,
  trackOAuthProviderSelected,
  trackSessionExpired,
  trackResumeFileSelected,
  trackResumeUploadStart,
  trackResumeParseSuccess,
  trackResumeParseFailure,
  trackSavedProfileUsed,
  trackResumeReplaced,
  trackAnalysisStart,
  trackJobSearchComplete,
  trackGapAnalysisComplete,
  trackAnalysisComplete,
  trackAnalysisError,
  trackLocationSearch,
  trackJobListViewed,
  trackJobCardImpression,
  trackJobCardClicked,
  trackJobApplied,
  trackFilterPanelOpen,
  trackFilterApplied,
  trackFilterCleared,
  trackSortChanged,
  trackTabViewed,
  trackRoadmapItemExpanded,
  trackResourceLinkClicked,
  trackAnalysisSaved,
  trackHistoryPageViewed,
  trackHistoryItemClicked,
  trackException,
} from "@/lib/analytics";

export function useAnalytics() {
  const { data: session } = useSession();

  // Sync user identity whenever session changes
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    } else {
      clearUserId();
    }
  }, [session?.user?.id]);

  return {
    // Generic
    track,
    trackPageView,

    // Auth
    trackSignUpStart,
    trackSignUp,
    trackLoginStart,
    trackLogin,
    trackOAuthProviderSelected,
    trackSessionExpired,

    // Resume
    trackResumeFileSelected,
    trackResumeUploadStart,
    trackResumeParseSuccess,
    trackResumeParseFailure,
    trackSavedProfileUsed,
    trackResumeReplaced,

    // Analysis
    trackAnalysisStart,
    trackJobSearchComplete,
    trackGapAnalysisComplete,
    trackAnalysisComplete,
    trackAnalysisError,
    trackLocationSearch,

    // Job interactions
    trackJobListViewed,
    trackJobCardImpression,
    trackJobCardClicked,
    trackJobApplied,

    // Filters
    trackFilterPanelOpen,
    trackFilterApplied,
    trackFilterCleared,
    trackSortChanged,

    // Content
    trackTabViewed,
    trackRoadmapItemExpanded,
    trackResourceLinkClicked,

    // Save & history
    trackAnalysisSaved,
    trackHistoryPageViewed,
    trackHistoryItemClicked,

    // Errors
    trackException,
  };
}
