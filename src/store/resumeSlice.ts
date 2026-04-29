import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ResumeAwardItem,
  ResumeBasics,
  ResumeCertificationItem,
  ResumeCustomSection,
  ResumeData,
  ResumeEducationItem,
  ResumeLanguageItem,
  ResumeMetadata,
  ResumeProjectItem,
  ResumePublicationItem,
  ResumeReferenceItem,
  ResumeSkillItem,
  ResumeVolunteerItem,
  ResumeWorkItem,
} from "@/types/resume";
import { DEFAULT_RESUME_DATA, DEFAULT_RESUME_METADATA } from "@/types/resume";

// ─────────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────────

interface ResumeEditorState {
  // Core data
  resumeId: string | null;
  data: ResumeData;
  metadata: ResumeMetadata;

  // Editor state
  title: string;
  templateSlug: string;
  industry: string;
  targetRole: string;
  status: "draft" | "complete" | "archived";
  version: number;

  // UI state
  activeSection: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
}

const initialState: ResumeEditorState = {
  resumeId: null,
  data: DEFAULT_RESUME_DATA,
  metadata: DEFAULT_RESUME_METADATA,
  title: "Untitled Resume",
  templateSlug: "minimalist",
  industry: "technology",
  targetRole: "",
  status: "draft",
  version: 1,
  activeSection: "basics",
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
};

// ─────────────────────────────────────────────────
// Helper: reorder array items
// ─────────────────────────────────────────────────

function reorderArray<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...arr];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

// ─────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    // ── Load / Reset ──────────────────────────────
    /**
     * Load a resume into the editor (e.g. from API fetch).
     * Resets all editor state.
     */
    loadResume(
      state,
      action: PayloadAction<{
        id: string;
        data: ResumeData;
        metadata: ResumeMetadata;
        title: string;
        templateSlug: string;
        industry: string;
        targetRole: string | null;
        status: "draft" | "complete" | "archived";
        version: number;
      }>,
    ) {
      const p = action.payload;
      state.resumeId = p.id;
      state.data = p.data;
      state.metadata = p.metadata;
      state.title = p.title;
      state.templateSlug = p.templateSlug;
      state.industry = p.industry;
      state.targetRole = p.targetRole ?? "";
      state.status = p.status;
      state.version = p.version;
      state.isDirty = false;
      state.isSaving = false;
      state.activeSection = "basics";
    },

    resetEditor() {
      return initialState;
    },

    // ── Editor meta ───────────────────────────────
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
      state.isDirty = true;
    },
    setTemplateSluq(state, action: PayloadAction<string>) {
      state.templateSlug = action.payload;
      state.isDirty = true;
    },
    setIndustry(state, action: PayloadAction<string>) {
      state.industry = action.payload;
      state.isDirty = true;
    },
    setTargetRole(state, action: PayloadAction<string>) {
      state.targetRole = action.payload;
      state.isDirty = true;
    },
    setStatus(state, action: PayloadAction<"draft" | "complete" | "archived">) {
      state.status = action.payload;
      state.isDirty = true;
    },
    setActiveSection(state, action: PayloadAction<string>) {
      state.activeSection = action.payload;
    },

    // ── Save state tracking ───────────────────────
    markSaving(state) {
      state.isSaving = true;
    },
    markSaved(state, action: PayloadAction<{ version: number }>) {
      state.isSaving = false;
      state.isDirty = false;
      state.version = action.payload.version;
      state.lastSavedAt = new Date().toISOString();
    },
    markSaveFailed(state) {
      state.isSaving = false;
    },

    // ── Basics ────────────────────────────────────
    setBasics(state, action: PayloadAction<Partial<ResumeBasics>>) {
      state.data.basics = { ...state.data.basics, ...action.payload };
      state.isDirty = true;
    },

    // ── Work Experience ───────────────────────────
    addWorkItem(state, action: PayloadAction<ResumeWorkItem>) {
      state.data.work.push(action.payload);
      state.isDirty = true;
    },
    updateWorkItem(
      state,
      action: PayloadAction<{ id: string; data: Partial<ResumeWorkItem> }>,
    ) {
      const idx = state.data.work.findIndex((w) => w.id === action.payload.id);
      if (idx !== -1) {
        state.data.work[idx] = {
          ...state.data.work[idx],
          ...action.payload.data,
        };
        state.isDirty = true;
      }
    },
    removeWorkItem(state, action: PayloadAction<string>) {
      state.data.work = state.data.work.filter((w) => w.id !== action.payload);
      state.isDirty = true;
    },
    reorderWorkItems(
      state,
      action: PayloadAction<{ from: number; to: number }>,
    ) {
      state.data.work = reorderArray(
        state.data.work,
        action.payload.from,
        action.payload.to,
      );
      state.isDirty = true;
    },

    // ── Education ─────────────────────────────────
    addEducationItem(state, action: PayloadAction<ResumeEducationItem>) {
      state.data.education.push(action.payload);
      state.isDirty = true;
    },
    updateEducationItem(
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<ResumeEducationItem>;
      }>,
    ) {
      const idx = state.data.education.findIndex(
        (e) => e.id === action.payload.id,
      );
      if (idx !== -1) {
        state.data.education[idx] = {
          ...state.data.education[idx],
          ...action.payload.data,
        };
        state.isDirty = true;
      }
    },
    removeEducationItem(state, action: PayloadAction<string>) {
      state.data.education = state.data.education.filter(
        (e) => e.id !== action.payload,
      );
      state.isDirty = true;
    },
    reorderEducationItems(
      state,
      action: PayloadAction<{ from: number; to: number }>,
    ) {
      state.data.education = reorderArray(
        state.data.education,
        action.payload.from,
        action.payload.to,
      );
      state.isDirty = true;
    },

    // ── Skills ─────────────────────────────────────
    addSkillItem(state, action: PayloadAction<ResumeSkillItem>) {
      state.data.skills.push(action.payload);
      state.isDirty = true;
    },
    updateSkillItem(
      state,
      action: PayloadAction<{ id: string; data: Partial<ResumeSkillItem> }>,
    ) {
      const idx = state.data.skills.findIndex(
        (s) => s.id === action.payload.id,
      );
      if (idx !== -1) {
        state.data.skills[idx] = {
          ...state.data.skills[idx],
          ...action.payload.data,
        };
        state.isDirty = true;
      }
    },
    removeSkillItem(state, action: PayloadAction<string>) {
      state.data.skills = state.data.skills.filter(
        (s) => s.id !== action.payload,
      );
      state.isDirty = true;
    },
    reorderSkillItems(
      state,
      action: PayloadAction<{ from: number; to: number }>,
    ) {
      state.data.skills = reorderArray(
        state.data.skills,
        action.payload.from,
        action.payload.to,
      );
      state.isDirty = true;
    },

    // ── Projects ───────────────────────────────────
    addProjectItem(state, action: PayloadAction<ResumeProjectItem>) {
      state.data.projects.push(action.payload);
      state.isDirty = true;
    },
    updateProjectItem(
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<ResumeProjectItem>;
      }>,
    ) {
      const idx = state.data.projects.findIndex(
        (p) => p.id === action.payload.id,
      );
      if (idx !== -1) {
        state.data.projects[idx] = {
          ...state.data.projects[idx],
          ...action.payload.data,
        };
        state.isDirty = true;
      }
    },
    removeProjectItem(state, action: PayloadAction<string>) {
      state.data.projects = state.data.projects.filter(
        (p) => p.id !== action.payload,
      );
      state.isDirty = true;
    },
    reorderProjectItems(
      state,
      action: PayloadAction<{ from: number; to: number }>,
    ) {
      state.data.projects = reorderArray(
        state.data.projects,
        action.payload.from,
        action.payload.to,
      );
      state.isDirty = true;
    },

    // ── Certifications ─────────────────────────────
    addCertificationItem(
      state,
      action: PayloadAction<ResumeCertificationItem>,
    ) {
      state.data.certifications.push(action.payload);
      state.isDirty = true;
    },
    updateCertificationItem(
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<ResumeCertificationItem>;
      }>,
    ) {
      const idx = state.data.certifications.findIndex(
        (c) => c.id === action.payload.id,
      );
      if (idx !== -1) {
        state.data.certifications[idx] = {
          ...state.data.certifications[idx],
          ...action.payload.data,
        };
        state.isDirty = true;
      }
    },
    removeCertificationItem(state, action: PayloadAction<string>) {
      state.data.certifications = state.data.certifications.filter(
        (c) => c.id !== action.payload,
      );
      state.isDirty = true;
    },

    // ── Languages ──────────────────────────────────
    addLanguageItem(state, action: PayloadAction<ResumeLanguageItem>) {
      state.data.languages.push(action.payload);
      state.isDirty = true;
    },
    updateLanguageItem(
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<ResumeLanguageItem>;
      }>,
    ) {
      const idx = state.data.languages.findIndex(
        (l) => l.id === action.payload.id,
      );
      if (idx !== -1) {
        state.data.languages[idx] = {
          ...state.data.languages[idx],
          ...action.payload.data,
        };
        state.isDirty = true;
      }
    },
    removeLanguageItem(state, action: PayloadAction<string>) {
      state.data.languages = state.data.languages.filter(
        (l) => l.id !== action.payload,
      );
      state.isDirty = true;
    },

    // ── Volunteer ──────────────────────────────────
    addVolunteerItem(state, action: PayloadAction<ResumeVolunteerItem>) {
      state.data.volunteer.push(action.payload);
      state.isDirty = true;
    },
    updateVolunteerItem(
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<ResumeVolunteerItem>;
      }>,
    ) {
      const idx = state.data.volunteer.findIndex(
        (v) => v.id === action.payload.id,
      );
      if (idx !== -1) {
        state.data.volunteer[idx] = {
          ...state.data.volunteer[idx],
          ...action.payload.data,
        };
        state.isDirty = true;
      }
    },
    removeVolunteerItem(state, action: PayloadAction<string>) {
      state.data.volunteer = state.data.volunteer.filter(
        (v) => v.id !== action.payload,
      );
      state.isDirty = true;
    },

    // ── Awards ─────────────────────────────────────
    addAwardItem(state, action: PayloadAction<ResumeAwardItem>) {
      state.data.awards.push(action.payload);
      state.isDirty = true;
    },
    updateAwardItem(
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<ResumeAwardItem>;
      }>,
    ) {
      const idx = state.data.awards.findIndex(
        (a) => a.id === action.payload.id,
      );
      if (idx !== -1) {
        state.data.awards[idx] = {
          ...state.data.awards[idx],
          ...action.payload.data,
        };
        state.isDirty = true;
      }
    },
    removeAwardItem(state, action: PayloadAction<string>) {
      state.data.awards = state.data.awards.filter(
        (a) => a.id !== action.payload,
      );
      state.isDirty = true;
    },

    // ── Publications ───────────────────────────────
    addPublicationItem(state, action: PayloadAction<ResumePublicationItem>) {
      state.data.publications.push(action.payload);
      state.isDirty = true;
    },
    updatePublicationItem(
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<ResumePublicationItem>;
      }>,
    ) {
      const idx = state.data.publications.findIndex(
        (p) => p.id === action.payload.id,
      );
      if (idx !== -1) {
        state.data.publications[idx] = {
          ...state.data.publications[idx],
          ...action.payload.data,
        };
        state.isDirty = true;
      }
    },
    removePublicationItem(state, action: PayloadAction<string>) {
      state.data.publications = state.data.publications.filter(
        (p) => p.id !== action.payload,
      );
      state.isDirty = true;
    },

    // ── References ─────────────────────────────────
    addReferenceItem(state, action: PayloadAction<ResumeReferenceItem>) {
      state.data.references.push(action.payload);
      state.isDirty = true;
    },
    updateReferenceItem(
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<ResumeReferenceItem>;
      }>,
    ) {
      const idx = state.data.references.findIndex(
        (r) => r.id === action.payload.id,
      );
      if (idx !== -1) {
        state.data.references[idx] = {
          ...state.data.references[idx],
          ...action.payload.data,
        };
        state.isDirty = true;
      }
    },
    removeReferenceItem(state, action: PayloadAction<string>) {
      state.data.references = state.data.references.filter(
        (r) => r.id !== action.payload,
      );
      state.isDirty = true;
    },

    // ── Custom Sections ────────────────────────────
    addCustomSection(state, action: PayloadAction<ResumeCustomSection>) {
      state.data.customSections.push(action.payload);
      state.isDirty = true;
    },
    updateCustomSection(
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<ResumeCustomSection>;
      }>,
    ) {
      const idx = state.data.customSections.findIndex(
        (s) => s.id === action.payload.id,
      );
      if (idx !== -1) {
        state.data.customSections[idx] = {
          ...state.data.customSections[idx],
          ...action.payload.data,
        };
        state.isDirty = true;
      }
    },
    removeCustomSection(state, action: PayloadAction<string>) {
      state.data.customSections = state.data.customSections.filter(
        (s) => s.id !== action.payload,
      );
      state.isDirty = true;
    },

    // ── Metadata (theme, typography, page, sections) ─
    setMetadata(state, action: PayloadAction<Partial<ResumeMetadata>>) {
      state.metadata = { ...state.metadata, ...action.payload };
      state.isDirty = true;
    },
    setSectionOrder(state, action: PayloadAction<string[]>) {
      state.metadata.sectionOrder = action.payload;
      state.isDirty = true;
    },
    toggleSectionVisibility(state, action: PayloadAction<string>) {
      const key =
        action.payload as keyof typeof state.metadata.sectionVisibility;
      if (key in state.metadata.sectionVisibility) {
        state.metadata.sectionVisibility[key] =
          !state.metadata.sectionVisibility[key];
        state.isDirty = true;
      }
    },

    // ── Bulk operations (AI rewrites) ─────────────
    /**
     * Replace the entire data blob (e.g. after AI tailoring).
     * The caller should create a version snapshot before calling this.
     */
    replaceData(state, action: PayloadAction<ResumeData>) {
      state.data = action.payload;
      state.isDirty = true;
    },
  },
});

export const resumeActions = resumeSlice.actions;
export default resumeSlice.reducer;
