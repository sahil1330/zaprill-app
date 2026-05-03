"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

/**
 * Auto-save hook — debounces saves to localStorage (fast) and server (slower).
 *
 * - Saves to localStorage every `localDelayMs` (default 2s) on dirty state
 * - Saves to server every `serverDelayMs` (default 15s) on dirty state
 * - Saves immediately on beforeunload if dirty
 */
export function useAutoSave({
  localDelayMs = 2000,
  serverDelayMs = 5000,
  onServerSave,
}: {
  localDelayMs?: number;
  serverDelayMs?: number;
  onServerSave: () => Promise<void>;
}) {
  const isDirty = useSelector((s: RootState) => s.resume.isDirty);
  const isSaving = useSelector((s: RootState) => s.resume.isSaving);
  const resumeId = useSelector((s: RootState) => s.resume.resumeId);
  const data = useSelector((s: RootState) => s.resume.data);
  const metadata = useSelector((s: RootState) => s.resume.metadata);
  const title = useSelector((s: RootState) => s.resume.title);

  const localTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save to localStorage (fast, non-blocking)
  const saveToLocal = useCallback(() => {
    if (!resumeId) return;
    try {
      const snapshot = JSON.stringify({ data, metadata, title, resumeId });
      localStorage.setItem(`resume_draft_${resumeId}`, snapshot);
    } catch {
      // localStorage full or unavailable — ignore
    }
  }, [data, metadata, title, resumeId]);

  // Debounced local save
  useEffect(() => {
    if (!isDirty) return;

    if (localTimerRef.current) clearTimeout(localTimerRef.current);
    localTimerRef.current = setTimeout(saveToLocal, localDelayMs);

    return () => {
      if (localTimerRef.current) clearTimeout(localTimerRef.current);
    };
  }, [isDirty, saveToLocal, localDelayMs]);

  // Debounced server save
  useEffect(() => {
    if (!isDirty || isSaving) return;

    if (serverTimerRef.current) clearTimeout(serverTimerRef.current);
    serverTimerRef.current = setTimeout(() => {
      onServerSave();
    }, serverDelayMs);

    return () => {
      if (serverTimerRef.current) clearTimeout(serverTimerRef.current);
    };
  }, [isDirty, isSaving, onServerSave, serverDelayMs]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty) saveToLocal();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, saveToLocal]);

  return { isDirty, isSaving };
}
