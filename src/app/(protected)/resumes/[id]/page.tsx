"use client";

import {
  AlertCircle,
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Check,
  Download,
  Eye,
  EyeOff,
  FolderKanban,
  GraduationCap,
  Heart,
  Languages,
  Loader2,
  Palette,
  Save,
  Search,
  Shield,
  SlidersHorizontal,
  Trophy,
  User,
  UserCheck,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AtsIcon from "@/components/resume/editor/AtsIcon";
import { AtsScoreStickyBar } from "@/components/resume/editor/AtsScoreCta";
import PreviewPanel from "@/components/resume/editor/PreviewPanel";
import { ResumeEditorErrorFallback } from "@/components/resume/editor/ResumeEditorErrorFallback";
import RoastDialog from "@/components/resume/editor/RoastDialog";
import AtsScorePanel from "@/components/resume/editor/sections/AtsScorePanel";
import AwardsForm from "@/components/resume/editor/sections/AwardsForm";
import BasicsForm from "@/components/resume/editor/sections/BasicsForm";
import CertificationsForm from "@/components/resume/editor/sections/CertificationsForm";
import EducationForm from "@/components/resume/editor/sections/EducationForm";
import LanguagesForm from "@/components/resume/editor/sections/LanguagesForm";
import ProjectsForm from "@/components/resume/editor/sections/ProjectsForm";
import PublicationsForm from "@/components/resume/editor/sections/PublicationsForm";
import ReferencesForm from "@/components/resume/editor/sections/ReferencesForm";
import SettingsForm from "@/components/resume/editor/sections/SettingsForm";
import SkillsForm from "@/components/resume/editor/sections/SkillsForm";
import VolunteerForm from "@/components/resume/editor/sections/VolunteerForm";
import WorkForm from "@/components/resume/editor/sections/WorkForm";
import TailorDialog from "@/components/resume/editor/TailorDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAutoSave } from "@/hooks/use-auto-save";
import { normalizeResumeData, normalizeResumeMetadata } from "@/lib/resume";
import { loadResumeDraft } from "@/lib/resume/draft-recovery";
import { prepareResumeDataForSave } from "@/lib/resume/sanitize";
import { patchResumeWithVersionRetry } from "@/lib/resume/save-with-retry";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeMetadata } from "@/types/resume";
import "@/components/resume/templates/resume-templates.css";

// ─── Section Navigation Items (content-only — no tools mixed in) ─────────────────────
const SECTIONS = [
  { key: "basics", label: "Contact Info", icon: User },
  { key: "work", label: "Experience", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "certifications", label: "Certifications", icon: Award },
  { key: "languages", label: "Languages", icon: Languages },
  { key: "volunteer", label: "Volunteer", icon: Heart },
  { key: "awards", label: "Awards", icon: Trophy },
  { key: "publications", label: "Publications", icon: BookOpen },
  { key: "references", label: "References", icon: UserCheck },
] as const;

const TOOLS = [
  { key: "settings", label: "Design", icon: Palette },
  { key: "ats-score", label: "ATS Score", icon: Shield },
] as const;

export default function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const activeSection = useSelector((s: RootState) => s.resume.activeSection);
  const resumeTitle = useSelector((s: RootState) => s.resume.title);
  const version = useSelector((s: RootState) => s.resume.version);
  const data = useSelector((s: RootState) => s.resume.data);
  const metadata = useSelector((s: RootState) => s.resume.metadata);
  const templateSlug = useSelector((s: RootState) => s.resume.templateSlug);
  const industry = useSelector((s: RootState) => s.resume.industry);
  const status = useSelector((s: RootState) => s.resume.status);

  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [validationErrors, setValidationErrors] = useState<any>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [atsOpen, setAtsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftRecoveryOffered, setDraftRecoveryOffered] = useState(false);
  const formBoundaryRef = useRef<ErrorBoundary>(null);
  const previewBoundaryRef = useRef<ErrorBoundary>(null);

  const applyDraftRecovery = useCallback(() => {
    const draft = loadResumeDraft(id);
    if (!draft) return false;

    try {
      dispatch(
        resumeActions.loadResume({
          id,
          data: normalizeResumeData(draft.data),
          metadata: normalizeResumeMetadata(draft.metadata),
          title: draft.title,
          templateSlug: draft.templateSlug ?? "minimalist",
          industry: draft.industry ?? "technology",
          targetRole: "",
          status: "draft",
          version: draft.version ?? 1,
        }),
      );
      setLoadError(null);
      setDraftRecoveryOffered(false);
      setIsLoadingResume(false);
      return true;
    } catch (err) {
      console.error("Draft recovery failed:", err);
      return false;
    }
  }, [id, dispatch]);

  // ─── Fetch resume on mount ──────────────────────
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        if (!res.ok) {
          const recovered = applyDraftRecovery();
          setLoadError(
            recovered
              ? null
              : res.status === 404
                ? "Resume not found"
                : "Failed to load resume",
          );
          if (!recovered && loadResumeDraft(id)) {
            setDraftRecoveryOffered(true);
          }
          return;
        }
        const { resume: fetchedResume } = await res.json();

        let normalizedData;
        let normalizedMetadata;
        try {
          normalizedData = normalizeResumeData(fetchedResume.data);
          normalizedMetadata = normalizeResumeMetadata(fetchedResume.metadata);
        } catch (normalizeErr) {
          console.error("Resume normalization error:", normalizeErr);
          const recovered = applyDraftRecovery();
          if (recovered) return;

          setLoadError("This resume has data we couldn't read");
          if (loadResumeDraft(id)) setDraftRecoveryOffered(true);
          return;
        }

        dispatch(
          resumeActions.loadResume({
            id: fetchedResume.id,
            data: normalizedData,
            metadata: normalizedMetadata,
            title: fetchedResume.title,
            templateSlug: fetchedResume.templateSlug,
            industry: fetchedResume.industry,
            targetRole: fetchedResume.targetRole,
            status: fetchedResume.status,
            version: fetchedResume.version,
          }),
        );
        setLoadError(null);
        setDraftRecoveryOffered(false);
      } catch (err) {
        console.error("Load resume error:", err);
        const recovered = applyDraftRecovery();
        if (!recovered) {
          setLoadError("Failed to load resume");
          if (loadResumeDraft(id)) setDraftRecoveryOffered(true);
        }
      } finally {
        setIsLoadingResume(false);
      }
    };

    fetchResume();
  }, [id, dispatch, applyDraftRecovery]);

  // ─── Server save function ───────────────────────
  const handleServerSave = useCallback(
    async (options: { stripBlankItems?: boolean } = {}) => {
      dispatch(resumeActions.markSaving());
      try {
        const payloadData = prepareResumeDataForSave(data, {
          stripBlankItems: options.stripBlankItems ?? false,
        });
        const res = await patchResumeWithVersionRetry({
          resumeId: id,
          version,
          body: {
            title: resumeTitle,
            data: payloadData,
            metadata,
            templateSlug,
            industry,
            status,
          },
        });
        if (res.ok) {
          const { resume } = await res.json();
          dispatch(resumeActions.markSaved({ version: resume.version }));
          setValidationErrors(null);
        } else if (res.status === 400) {
          const result = await res.json();

          // Build a flat error map by section
          const errorsBySection: Record<string, Record<string, string[]>> = {};

          if (result.issues && Array.isArray(result.issues)) {
            result.issues.forEach((issue: any) => {
              const path = issue.path; // e.g. ["data", "basics", "profiles", 0, "url"]
              if (
                (path[0] === "data" || path[0] === "metadata") &&
                path.length >= 2
              ) {
                const root = path[0];
                const section = root === "metadata" ? "settings" : path[1];

                // Determine the relative path for RHF
                // Forms like WorkForm expect "work.0.website"
                // BasicsForm expects "profiles.0.url"
                // SettingsForm expects "template"
                let relativePath;
                if (root === "metadata") {
                  relativePath = path.slice(1).join(".");
                } else if (
                  [
                    "work",
                    "education",
                    "skills",
                    "projects",
                    "certifications",
                    "languages",
                    "volunteer",
                    "awards",
                    "publications",
                    "references",
                  ].includes(section)
                ) {
                  relativePath = path.slice(1).join(".");
                } else {
                  relativePath = path.slice(2).join(".");
                }

                if (!errorsBySection[section]) errorsBySection[section] = {};
                if (!errorsBySection[section][relativePath])
                  errorsBySection[section][relativePath] = [];
                errorsBySection[section][relativePath].push(issue.message);
              }
            });
          }

          setValidationErrors(errorsBySection);
          setShowErrorDialog(true);
          dispatch(resumeActions.markSaveFailed());
        } else if (res.status === 409) {
          toast.error(
            "Couldn't sync this tab. Refresh to keep your latest edits.",
          );
          dispatch(resumeActions.markSaveFailed());
        } else {
          toast.error(
            "Couldn't save your changes. They're backed up locally — try again shortly.",
          );
          dispatch(resumeActions.markSaveFailed());
        }
      } catch {
        toast.error(
          "Couldn't reach the server. Your edits are saved locally on this device.",
        );
        dispatch(resumeActions.markSaveFailed());
      }
    },
    [
      id,
      resumeTitle,
      data,
      metadata,
      templateSlug,
      industry,
      status,
      version,
      dispatch,
    ],
  );

  // ─── Auto-save ──────────────────────────────────
  const { isDirty, isSaving } = useAutoSave({
    onServerSave: () => handleServerSave({ stripBlankItems: true }),
  });

  // ─── Manual save ────────────────────────────────
  const handleManualSave = () => {
    if (!isDirty && !isSaving) return;
    handleServerSave();
  };

  // ─── Loading state ──────────────────────────────
  if (isLoadingResume) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="font-medium text-muted-foreground text-sm">
            Loading resume...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex max-w-md flex-col items-center gap-4 px-6 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="font-bold text-lg">{loadError}</p>
          {draftRecoveryOffered && (
            <p className="text-muted-foreground text-sm">
              We found a local copy of your recent edits on this device.
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {draftRecoveryOffered && (
              <Button onClick={applyDraftRecovery}>Restore local draft</Button>
            )}
            <Button variant="outline" onClick={() => router.push("/resumes")}>
              Back to Resumes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render active section form ─────────────────
  // Sections with visibility toggles
  const VISIBILITY_SECTIONS = new Set([
    "summary",
    "work",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
    "volunteer",
    "awards",
    "publications",
    "references",
  ]);

  const renderSectionForm = () => {
    const sectionVisibility =
      metadata?.sectionVisibility ??
      ({} as ResumeMetadata["sectionVisibility"]);

    // Check if this section has a visibility toggle and is hidden
    const isHidden =
      VISIBILITY_SECTIONS.has(activeSection) &&
      sectionVisibility[activeSection as keyof typeof sectionVisibility] ===
        false;

    const formContent = (() => {
      switch (activeSection) {
        case "basics":
          return <BasicsForm serverErrors={validationErrors?.basics} />;
        case "work":
          return <WorkForm serverErrors={validationErrors?.work} />;
        case "education":
          return <EducationForm serverErrors={validationErrors?.education} />;
        case "skills":
          return <SkillsForm serverErrors={validationErrors?.skills} />;
        case "projects":
          return <ProjectsForm serverErrors={validationErrors?.projects} />;
        case "certifications":
          return (
            <CertificationsForm
              serverErrors={validationErrors?.certifications}
            />
          );
        case "languages":
          return <LanguagesForm serverErrors={validationErrors?.languages} />;
        case "volunteer":
          return <VolunteerForm serverErrors={validationErrors?.volunteer} />;
        case "awards":
          return <AwardsForm serverErrors={validationErrors?.awards} />;
        case "publications":
          return (
            <PublicationsForm serverErrors={validationErrors?.publications} />
          );
        case "references":
          return <ReferencesForm serverErrors={validationErrors?.references} />;
        case "ats-score":
          return <AtsScorePanel />;
        case "settings":
          return <SettingsForm serverErrors={validationErrors?.settings} />;
        default:
          return null;
      }
    })();

    return (
      <>
        {isHidden && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-score-low-fg/20 bg-score-low/50 p-3 text-sm">
            <EyeOff className="h-4 w-4 shrink-0 text-score-low-fg" />
            <span className="flex-1 text-muted-foreground">
              This section is hidden from your resume.
            </span>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 border-score-low-fg/30 text-score-low-fg hover:bg-score-low"
              onClick={() =>
                dispatch(resumeActions.toggleSectionVisibility(activeSection))
              }
            >
              <Eye className="h-3.5 w-3.5" />
              Show
            </Button>
          </div>
        )}
        {formContent}
      </>
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* ─── Top Bar ──────────────────────────────── */}
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-border border-b bg-background/95 px-4 backdrop-blur-sm">
        {/* Left: navigation + title */}
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/resumes")}
            className="shrink-0 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Input
            value={resumeTitle}
            onChange={(e) => dispatch(resumeActions.setTitle(e.target.value))}
            className="h-8 w-36 border-none bg-transparent px-2 font-bold text-sm focus-visible:ring-1 focus-visible:ring-ring sm:w-56"
          />

          {/* Autosave status — compact, right of title */}
          <div className="hidden items-center gap-1.5 text-xs sm:flex">
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            ) : isDirty ? (
              <span className="font-medium text-achievement">Unsaved</span>
            ) : (
              <Check className="h-3.5 w-3.5 text-score-high-fg" />
            )}
          </div>
        </div>

        {/* Right: action group */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sessionStorage.setItem("ai_job_god_resume", JSON.stringify(data));
              router.push("/analyze");
            }}
            className="hidden gap-1.5 text-primary hover:bg-primary/10 hover:text-primary sm:inline-flex"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search Jobs</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="hidden gap-1.5 lg:inline-flex"
          >
            {showPreview ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="hidden xl:inline">
              {showPreview ? "Hide" : "Show"} Preview
            </span>
          </Button>

          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          <TailorDialog />
          <RoastDialog />

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={isSaving || !isDirty}
            className="gap-1.5"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>

          <Button
            size="sm"
            className="gap-1.5"
            disabled={isExporting}
            onClick={async () => {
              setIsExporting(true);
              try {
                if (isDirty) await handleServerSave();
                window.open(
                  `/resumes/${id}/export`,
                  "_blank",
                  "noopener,noreferrer",
                );
              } catch (err) {
                console.error("Export error:", err);
              } finally {
                setIsExporting(false);
              }
            }}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Export</span>
          </Button>

          {/* Settings gear — opens right drawer */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="Resume settings"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* ─── Three-panel Layout ────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Section Navigation (content sections only) */}
        <nav className="flex w-12 shrink-0 flex-col border-border border-r bg-muted/20 lg:w-44">
          <ScrollArea className="flex-1 py-2">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                type="button"
                key={key}
                onClick={() => dispatch(resumeActions.setActiveSection(key))}
                className={`relative flex w-full items-center gap-3 px-2.5 py-2.5 font-medium text-sm transition-colors lg:px-3 ${
                  activeSection === key
                    ? "border-primary border-r-2 bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden truncate lg:inline">{label}</span>
                {validationErrors?.[key] && (
                  <span className="-translate-y-1/2 absolute top-1/2 right-2 h-1.5 w-1.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                )}
              </button>
            ))}
            <div className="mx-2 my-2 hidden border-border border-t lg:block" />
            {TOOLS.map(({ key, label, icon: Icon }) => (
              <button
                type="button"
                key={key}
                onClick={() => {
                  if (key === "settings") setSettingsOpen(true);
                  if (key === "ats-score") setAtsOpen(true);
                }}
                className="relative flex w-full items-center gap-3 px-2.5 py-2.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted/50 hover:text-foreground lg:px-3"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden truncate lg:inline">{label}</span>
              </button>
            ))}
          </ScrollArea>
        </nav>

        {/* Center: Form Editor + sticky ATS CTA */}
        <div
          className={`flex flex-1 flex-col overflow-hidden ${showPreview ? "lg:max-w-[50%]" : ""}`}
        >
          {/* Scrollable form area */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl p-6">
              <h2 className="mb-6 font-black text-xl tracking-tight">
                {SECTIONS.find((s) => s.key === activeSection)?.label ??
                  "Section"}
              </h2>
              <ErrorBoundary
                key={activeSection}
                ref={formBoundaryRef}
                fallback={
                  <ResumeEditorErrorFallback
                    title="Couldn't load this section"
                    message="Switch to another section to keep editing, or try reloading this one."
                    onRetry={() => formBoundaryRef.current?.reset()}
                    onBack={() => router.push("/resumes")}
                    compact
                  />
                }
              >
                {renderSectionForm()}
              </ErrorBoundary>
            </div>
          </div>

          <AtsScoreStickyBar onOpen={() => setAtsOpen(true)} />
        </div>

        {/* Right: Live Preview */}
        {showPreview && (
          <div className="hidden flex-1 overflow-y-auto border-border border-l bg-muted/20 lg:flex">
            <ErrorBoundary
              ref={previewBoundaryRef}
              fallback={
                <ResumeEditorErrorFallback
                  title="Preview unavailable"
                  message="The live preview hit an error. You can keep editing — your form data is still here."
                  onRetry={() => previewBoundaryRef.current?.reset()}
                  compact
                />
              }
            >
              <PreviewPanel data={data} metadata={metadata} />
            </ErrorBoundary>
          </div>
        )}
      </div>

      {/* Validation Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertDialogTitle>Validation Failed</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-4">
              <p>
                We found some issues that need your attention before we can
                save. Please check the following sections:
              </p>
              <div className="max-h-[40vh] space-y-3 overflow-y-auto pr-2">
                {validationErrors &&
                  Object.entries(validationErrors).map(([section, errors]) => {
                    const sectionLabel =
                      SECTIONS.find((s) => s.key === section)?.label || section;
                    return (
                      <div
                        key={section}
                        className="rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                      >
                        <p className="mb-1 font-bold text-destructive text-sm capitalize">
                          {sectionLabel}
                        </p>
                        <ul className="list-inside list-disc space-y-1 text-muted-foreground text-xs">
                          {Object.values(errors as any)
                            .flat()
                            .map((msg: any, i) => (
                              <li key={i}>{msg}</li>
                            ))}
                        </ul>
                      </div>
                    );
                  })}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                const firstSection = validationErrors
                  ? Object.keys(validationErrors)[0]
                  : null;
                if (
                  firstSection &&
                  SECTIONS.some((s) => s.key === firstSection)
                ) {
                  dispatch(resumeActions.setActiveSection(firstSection));
                } else if (firstSection === "settings") {
                  setSettingsOpen(true);
                }
                setShowErrorDialog(false);
              }}
            >
              Got it, I'll fix it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ATS Score Sheet — triggered from sticky CTA bar */}
      <Sheet open={atsOpen} onOpenChange={setAtsOpen}>
        <SheetContent side="right" className="flex flex-col sm:max-w-lg">
          <SheetHeader className="border-border border-b pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <AtsIcon className="h-5 w-5" animated={false} />
              </div>
              <div>
                <SheetTitle className="font-black text-base">
                  ATS Score
                </SheetTitle>
                <p className="text-muted-foreground text-xs">
                  Score your resume against a job description
                </p>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <ErrorBoundary
              fallback={
                <ResumeEditorErrorFallback
                  title="ATS score panel unavailable"
                  message="Close this panel and try again, or keep editing your resume."
                  compact
                />
              }
            >
              <AtsScorePanel />
            </ErrorBoundary>
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings Sheet — triggered from gear icon in top bar */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          side="right"
          className="flex w-full min-w-0 flex-col sm:max-w-lg"
        >
          <SheetHeader className="border-border border-b pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="font-black text-base">
                  Resume Settings
                </SheetTitle>
                <p className="text-muted-foreground text-xs">
                  Template, colors, typography, and layout
                </p>
              </div>
            </div>
          </SheetHeader>
          <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-6">
            <ErrorBoundary
              fallback={
                <ResumeEditorErrorFallback
                  title="Settings unavailable"
                  message="Close settings and try again. Your resume content is unaffected."
                  compact
                />
              }
            >
              <SettingsForm serverErrors={validationErrors?.settings} />
            </ErrorBoundary>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
