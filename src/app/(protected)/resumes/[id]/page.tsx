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
  Save,
  Search,
  Settings,
  Shield,
  Trophy,
  User,
  UserCheck,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PreviewPanel from "@/components/resume/editor/PreviewPanel";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAutoSave } from "@/hooks/use-auto-save";
import { normalizeResumeData, normalizeResumeMetadata } from "@/lib/resume";
import { resumeActions } from "@/store/resumeSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { ResumeData, ResumeMetadata } from "@/types/resume";
import "@/components/resume/templates/resume-templates.css";

// ─── Section Navigation Items ─────────────────────
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
  { key: "ats-score", label: "ATS Score", icon: Shield },
  { key: "settings", label: "Settings", icon: Settings },
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

  // ─── Fetch resume on mount ──────────────────────
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        if (!res.ok) {
          setLoadError("Resume not found");
          return;
        }
        const { resume: fetchedResume } = await res.json();

        // Normalize both data and metadata before loading into Redux
        const normalizedData = normalizeResumeData(fetchedResume.data);
        const normalizedMetadata = normalizeResumeMetadata(
          fetchedResume.metadata,
        );

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
      } catch (err) {
        console.error("Load resume error:", err);
        setLoadError("Failed to load resume");
      } finally {
        setIsLoadingResume(false);
      }
    };

    fetchResume();
  }, [id, dispatch]);

  // ─── Server save function ───────────────────────
  const handleServerSave = useCallback(async () => {
    dispatch(resumeActions.markSaving());
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: resumeTitle,
          data,
          metadata,
          templateSlug,
          industry,
          status,
          version,
        }),
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
        dispatch(resumeActions.markSaveFailed());
      } else {
        dispatch(resumeActions.markSaveFailed());
      }
    } catch {
      dispatch(resumeActions.markSaveFailed());
    }
  }, [
    id,
    resumeTitle,
    data,
    metadata,
    templateSlug,
    industry,
    status,
    version,
    dispatch,
  ]);

  // ─── Auto-save ──────────────────────────────────
  const { isDirty, isSaving } = useAutoSave({
    onServerSave: handleServerSave,
  });

  // ─── Manual save ────────────────────────────────
  const handleManualSave = () => {
    if (!isDirty && !isSaving) return;
    handleServerSave();
  };

  // ─── Loading state ──────────────────────────────
  if (isLoadingResume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading resume...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-lg font-bold">{loadError}</p>
          <Button variant="outline" onClick={() => router.push("/resumes")}>
            Back to Resumes
          </Button>
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
    // Check if this section has a visibility toggle and is hidden
    const isHidden =
      VISIBILITY_SECTIONS.has(activeSection) &&
      !(metadata.sectionVisibility as unknown as Record<string, boolean>)[
        activeSection
      ];

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
          <div className="flex items-center gap-3 p-3 mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 text-sm">
            <EyeOff className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-muted-foreground flex-1">
              This section is hidden from your resume.
            </span>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
              onClick={() =>
                dispatch(resumeActions.toggleSectionVisibility(activeSection))
              }
            >
              <Eye className="h-3.5 w-3.5" />
              Enable
            </Button>
          </div>
        )}
        {formContent}
      </>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* ─── Top Bar ──────────────────────────────── */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/95 backdrop-blur-sm z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/resumes")}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Input
            value={resumeTitle}
            onChange={(e) => dispatch(resumeActions.setTitle(e.target.value))}
            className="h-8 w-48 sm:w-64 font-bold text-sm border-none bg-transparent focus-visible:ring-1 focus-visible:ring-ring px-2"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isDirty ? (
              <span className="text-amber-500 font-medium">
                Unsaved changes
              </span>
            ) : (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                <span>Saved</span>
              </>
            )}
          </div>

          <Badge variant="outline" className="text-[10px] font-bold uppercase">
            {status}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sessionStorage.setItem("ai_job_god_resume", JSON.stringify(data));
              router.push("/analyze");
            }}
            className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search Jobs</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-1.5 hidden lg:flex"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? "Hide" : "Show"} Preview
          </Button>

          <TailorDialog />
          <RoastDialog />

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
            onClick={() => window.open(`/resumes/${id}/export`, "_blank")}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </header>

      {/* ─── Three-panel Layout ────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Section Navigation */}
        <nav className="w-14 lg:w-48 border-r border-border bg-muted/30 shrink-0 flex flex-col">
          <ScrollArea className="flex-1 py-2">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                type="button"
                key={key}
                onClick={() => dispatch(resumeActions.setActiveSection(key))}
                className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 text-sm font-medium transition-colors relative ${
                  activeSection === key
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline truncate">{label}</span>
                {validationErrors?.[key] && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                )}
              </button>
            ))}
          </ScrollArea>
        </nav>

        {/* Center: Form Editor */}
        <div
          className={`flex-1 overflow-y-auto ${showPreview ? "lg:max-w-[50%]" : ""}`}
        >
          <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-xl font-black tracking-tight mb-6">
              {SECTIONS.find((s) => s.key === activeSection)?.label ??
                "Section"}
            </h2>
            {renderSectionForm()}
          </div>
        </div>

        {/* Right: Live Preview */}
        {showPreview && (
          <div className="hidden lg:flex flex-1 border-l border-border bg-muted/20 overflow-y-auto">
            <PreviewPanel data={data} metadata={metadata} />
          </div>
        )}
      </div>
    </div>
  );
}
