"use client";

import { IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react";
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  ExternalLink,
  Globe,
  Loader2,
  Plus,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/page-header";
import { JobTitleAutocomplete } from "@/components/JobTitleAutocomplete";
import ResumeUploader from "@/components/ResumeUploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import useAuth from "@/hooks/useAuth";
import { normalizeResumeData } from "@/lib/resume";
import { ensureHttps } from "@/lib/utils";
import type { ResumeData, ResumeSkillItem } from "@/types/resume";
import { DEFAULT_RESUME_DATA } from "@/types/resume";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<{
    resumeData: ResumeData;
    resumeRaw: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const [newSkill, setNewSkill] = useState("");
  const [newRole, setNewRole] = useState("");

  const [isUpdatingResume, setIsUpdatingResume] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        const normalized = normalizeResumeData(data.profile.resumeData);
        setResumeData(normalized || DEFAULT_RESUME_DATA);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!resumeData) return;

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          resumeRaw: resumeData,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Resume Data Handlers
  const updResume = (updates: Partial<ResumeData>) => {
    setResumeData((prev) => ({ ...prev, ...updates }));
  };

  const updBasics = (updates: Partial<ResumeData["basics"]>) => {
    setResumeData((prev) => ({
      ...prev,
      basics: { ...prev.basics, ...updates },
    }));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const skillName = newSkill.trim();

    setResumeData((prev) => {
      const currentSkills = [...(prev.skills || [])];

      // Check if skill already exists in any group
      const exists = currentSkills.some((g) =>
        g.keywords.some((k) => k.toLowerCase() === skillName.toLowerCase()),
      );
      if (exists) return prev;

      // Add to "Top Skills" group or create it
      const topSkillsGroup = currentSkills.find(
        (g) => g.name === "Top Skills" || g.name === "General",
      );

      if (topSkillsGroup) {
        topSkillsGroup.keywords = [...topSkillsGroup.keywords, skillName];
        return { ...prev, skills: currentSkills };
      } else {
        const newGroup: ResumeSkillItem = {
          id: nanoid(),
          name: "Top Skills",
          level: "Intermediate",
          keywords: [skillName],
          category: "technical",
        };
        return { ...prev, skills: [...currentSkills, newGroup] };
      }
    });
    setNewSkill("");
  };

  const removeSkill = (groupId: string, keyword: string) => {
    setResumeData((prev) => {
      const currentSkills = (prev.skills || [])
        .map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              keywords: group.keywords.filter((k) => k !== keyword),
            };
          }
          return group;
        })
        .filter(
          (group) => group.keywords.length > 0 || group.name !== "Top Skills",
        );

      return { ...prev, skills: currentSkills };
    });
  };

  const addSocialProfile = () => {
    const current = resumeData.basics.profiles || [];
    updBasics({
      profiles: [...current, { network: "Portfolio", url: "", username: "" }],
    });
  };

  const updateSocialProfile = (
    index: number,
    updates: { network?: string; url?: string; username?: string },
  ) => {
    const current = [...(resumeData.basics.profiles || [])];
    if (!current[index]) return;
    current[index] = { ...current[index], ...updates };
    updBasics({ profiles: current });
  };

  const removeSocialProfile = (index: number) => {
    const current = (resumeData.basics.profiles || []).filter(
      (_, i) => i !== index,
    );
    updBasics({ profiles: current });
  };

  const removeRole = (role: string) => {
    setResumeData((prev) => ({
      ...prev,
      inferredJobTitles: (prev.inferredJobTitles || []).filter(
        (r) => r !== role,
      ),
    }));
  };

  const handleResumeUpload = async (file: File) => {
    setIsParsing(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to parse resume");
      }

      const newParsedResume = await res.json();
      setResumeData(newParsedResume);
      setIsUpdatingResume(false);
      toast.success("Resume parsed! Review and save your changes.");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload and parse resume");
    } finally {
      setIsParsing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-6 py-6">
        <PageHeader
          title="Profile"
          description="Manage your account and professional data."
          actions={
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="h-14 px-8 font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Save Changes
            </Button>
          }
        />

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="mb-8 grid h-14 w-full grid-cols-3 rounded-xl border border-border/50 bg-muted/50 p-1">
            <TabsTrigger
              value="personal"
              className="flex items-center gap-2 rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <User className="h-4 w-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger
              value="resume"
              className="flex items-center gap-2 rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Briefcase className="h-4 w-4" />
              Parsed Resume
            </TabsTrigger>
            <TabsTrigger
              value="experience"
              className="flex items-center gap-2 rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <BookOpen className="h-4 w-4" />
              Experience
            </TabsTrigger>
          </TabsList>

          {/* ── Personal Info Tab ────────────────────────────────────────────────── */}
          <TabsContent value="personal" className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-black text-2xl">
                  Account Details
                </CardTitle>
                <CardDescription className="font-medium">
                  Update your basic account information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3">
                  <Label
                    htmlFor="name"
                    className="font-bold text-muted-foreground text-sm uppercase tracking-widest"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-12 font-semibold text-lg"
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="grid gap-3">
                    <Label
                      htmlFor="phone"
                      className="font-bold text-muted-foreground text-sm uppercase tracking-widest"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={resumeData.basics.phone || ""}
                      onChange={(e) => updBasics({ phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      className="h-12 font-semibold text-lg"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label
                      htmlFor="location"
                      className="font-bold text-muted-foreground text-sm uppercase tracking-widest"
                    >
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={resumeData.basics.location.city || ""}
                      onChange={(e) =>
                        updBasics({
                          location: {
                            ...resumeData.basics.location,
                            city: e.target.value,
                          },
                        })
                      }
                      placeholder="City, Country"
                      className="h-12 font-semibold text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 font-bold text-muted-foreground text-sm uppercase tracking-widest">
                      <Globe className="h-3.5 w-3.5" />
                      Social & Professional Profiles
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addSocialProfile}
                      className="h-8 border-2 font-bold text-xs"
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add Profile
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {(resumeData.basics.profiles || []).map((social, idx) => {
                      const network = social.network.toLowerCase();
                      const Icon = network.includes("linkedin")
                        ? IconBrandLinkedin
                        : network.includes("github")
                          ? IconBrandGithub
                          : Globe;

                      return (
                        <div
                          key={idx}
                          className="group relative flex flex-col gap-4 rounded-xl border-2 border-border bg-muted/30 p-4 md:flex-row"
                        >
                          <div className="grid flex-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <span className="font-black text-[10px] text-muted-foreground uppercase tracking-widest">
                                Platform
                              </span>
                              <div className="relative">
                                <div className="-translate-y-1/2 absolute top-1/2 left-3">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Input
                                  value={social.network}
                                  onChange={(e) =>
                                    updateSocialProfile(idx, {
                                      network: e.target.value,
                                    })
                                  }
                                  placeholder="LinkedIn, GitHub, etc."
                                  className="h-10 border-2 pl-10 font-bold"
                                />
                              </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label className="font-black text-[10px] text-muted-foreground uppercase tracking-widest">
                                URL
                              </Label>
                              <div className="relative">
                                <Input
                                  value={social.url}
                                  onChange={(e) =>
                                    updateSocialProfile(idx, {
                                      url: e.target.value,
                                    })
                                  }
                                  placeholder="https://..."
                                  className="h-10 border-2 pr-10 font-bold"
                                />
                                {social.url && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1 right-1 h-8 w-8 text-muted-foreground transition-colors hover:text-primary"
                                    onClick={() => {
                                      const url = ensureHttps(social.url);
                                      window.open(url, "_blank");
                                    }}
                                    title="Open link in new tab"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSocialProfile(idx)}
                            className="-top-2 -right-2 absolute h-8 w-8 rounded-full border-2 border-border bg-background text-destructive opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}

                    {(!resumeData.basics.profiles ||
                      resumeData.basics.profiles.length === 0) && (
                      <div className="rounded-xl border-2 border-border border-dashed py-8 text-center">
                        <p className="font-medium text-muted-foreground text-sm">
                          No social profiles added.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid cursor-not-allowed gap-3 opacity-60">
                  <Label
                    htmlFor="email"
                    className="font-bold text-muted-foreground text-sm uppercase tracking-widest"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="h-12 bg-muted font-semibold text-lg"
                  />
                  <p className="flex items-center gap-2 font-bold text-muted-foreground text-xs">
                    <AlertCircle className="h-3 w-3" />
                    Email cannot be changed currently.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Parsed Resume Tab ────────────────────────────────────────────────── */}
          <TabsContent value="resume" className="space-y-6">
            {!resumeData ? (
              <Card className="border-2 border-dashed p-12 text-center">
                <p className="font-bold text-muted-foreground">
                  No parsed resume found. Please analyze a resume first.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 font-bold"
                  onClick={() => router.push("/")}
                >
                  Go to Upload
                </Button>
              </Card>
            ) : (
              <>
                {/* Summary & Roles */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-black text-2xl">
                      Professional Summary
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsUpdatingResume(!isUpdatingResume)}
                      className="border-2 font-bold"
                    >
                      {isUpdatingResume ? "Cancel" : "Update from File"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {isUpdatingResume && (
                      <div className="fade-in slide-in-from-top-4 mb-10 animate-in rounded-2xl border-2 border-primary/20 border-dashed bg-primary/5 p-6 duration-500">
                        <h4 className="mb-4 font-black text-primary text-sm uppercase tracking-widest">
                          Upload New Resume
                        </h4>
                        <ResumeUploader
                          onUpload={handleResumeUpload}
                          disabled={isParsing}
                        />
                        {isParsing && (
                          <div className="mt-4 flex items-center justify-center gap-3 font-bold text-primary">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Parsing your experience...
                          </div>
                        )}
                      </div>
                    )}
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="grid gap-3">
                        <Label className="font-bold text-muted-foreground text-sm uppercase tracking-widest">
                          Career Summary
                        </Label>
                        <Textarea
                          value={resumeData.basics.summary || ""}
                          onChange={(e) =>
                            updBasics({ summary: e.target.value })
                          }
                          className="min-h-[120px] font-medium text-lg leading-relaxed"
                          placeholder="Briefly describe your professional background..."
                        />
                      </div>

                      <div className="grid gap-3">
                        <Label className="font-bold text-muted-foreground text-sm uppercase tracking-widest">
                          Years of Experience
                        </Label>
                        <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/30 p-4">
                          <span className="w-16 font-black text-4xl text-foreground">
                            {resumeData.totalYearsOfExperience || 0}
                          </span>
                          <Input
                            type="range"
                            min="0"
                            max="30"
                            step="1"
                            value={resumeData.totalYearsOfExperience || 0}
                            onChange={(e) =>
                              updResume({
                                totalYearsOfExperience:
                                  parseInt(e.target.value) || 0,
                              })
                            }
                            className="flex-1 accent-foreground"
                          />
                        </div>
                        <p className="font-bold text-muted-foreground text-xs italic">
                          Slide to adjust your total professional experience.
                        </p>
                      </div>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="grid gap-3">
                      <Label className="font-bold text-muted-foreground text-sm uppercase tracking-widest">
                        Target Job Titles
                      </Label>
                      <div className="mb-3 flex flex-wrap gap-2">
                        {(resumeData.inferredJobTitles || []).map((role) => (
                          <Badge
                            key={role}
                            className="flex h-9 items-center gap-2 rounded-lg bg-foreground px-4 font-black text-background text-sm"
                          >
                            {role}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRole(role);
                              }}
                              className="inline-flex items-center justify-center rounded-md p-0.5 transition-colors hover:bg-muted/20"
                            >
                              <Trash2 className="h-3.5 w-3.5 cursor-pointer transition-colors hover:text-red-400" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <JobTitleAutocomplete
                        value={newRole}
                        onChange={setNewRole}
                        onAdd={(role) => {
                          if (!resumeData || !role.trim()) return;
                          const currentRoles =
                            resumeData.inferredJobTitles || [];
                          if (currentRoles.includes(role.trim())) {
                            setNewRole("");
                            return;
                          }
                          updResume({
                            inferredJobTitles: [...currentRoles, role.trim()],
                          });
                          setNewRole("");
                        }}
                        placeholder="Add targeted role... (e.g. Frontend Developer)"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-black text-2xl">
                      Top Skills
                    </CardTitle>
                    <CardDescription className="font-medium">
                      These skills are used to match you with job listings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 flex flex-wrap gap-2">
                      {(resumeData.skills || [])
                        .flatMap((group) =>
                          group.keywords.map((skill) => ({
                            groupId: group.id,
                            name: skill,
                          })),
                        )
                        .map((skill, idx) => (
                          <Badge
                            key={`${skill.groupId}-${skill.name}-${idx}`}
                            variant="outline"
                            className="group flex h-9 items-center gap-2 rounded-lg border-2 px-4 font-bold text-sm transition-all hover:border-foreground"
                          >
                            {skill.name}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSkill(skill.groupId, skill.name);
                              }}
                              className="inline-flex items-center justify-center rounded-md p-0.5 transition-colors hover:bg-muted"
                            >
                              <Trash2 className="h-3.5 w-3.5 cursor-pointer text-muted-foreground transition-colors group-hover:text-red-500" />
                            </button>
                          </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                        placeholder="Add a skill... (e.g. React, Python)"
                        className="h-11 font-semibold"
                      />
                      <Button
                        variant="secondary"
                        className="font-black"
                        onClick={addSkill}
                      >
                        Add Skill
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ── Detailed Experience Tab ────────────────────────────────────────── */}
          <TabsContent value="experience" className="space-y-8">
            {resumeData && (
              <>
                {/* Work Experience */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="font-black text-2xl">
                        Work Experience
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Your professional history.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updResume({
                          work: [
                            ...(resumeData.work || []),
                            {
                              id: nanoid(),
                              position: "New Position",
                              company: "Company",
                              summary: "",
                              highlights: [],
                              startDate: "",
                              endDate: null,
                              website: "",
                              location: "",
                            },
                          ],
                        })
                      }
                      className="border-2 font-black"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(resumeData.work || []).map((exp, idx) => (
                      <div
                        key={idx}
                        className="group relative border-border/50 border-b pb-8 last:border-0 last:pb-0"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="-right-2 absolute top-0 text-destructive opacity-0 transition-all group-hover:opacity-100"
                          onClick={() => {
                            const newWork = [...(resumeData.work || [])];
                            newWork.splice(idx, 1);
                            updResume({ work: newWork });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="mb-4 grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                              Role
                            </Label>
                            <Input
                              value={exp.position || ""}
                              onChange={(e) => {
                                const newWork = [...(resumeData.work || [])];
                                newWork[idx].position = e.target.value;
                                updResume({ work: newWork });
                              }}
                              className="border-2 font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                              Company
                            </Label>
                            <Input
                              value={exp.company || ""}
                              onChange={(e) => {
                                const newWork = [...(resumeData.work || [])];
                                newWork[idx].company = e.target.value;
                                updResume({ work: newWork });
                              }}
                              className="border-2 font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                              Duration
                            </Label>
                            <Input
                              value={`${exp.startDate || ""}${exp.endDate ? ` - ${exp.endDate}` : ""}`}
                              onChange={(e) => {
                                const [start, end] =
                                  e.target.value.split(" - ");
                                const newWork = [...(resumeData.work || [])];
                                newWork[idx].startDate = start || "";
                                newWork[idx].endDate = end || null;
                                updResume({ work: newWork });
                              }}
                              placeholder="e.g. Jan 2020 - Present"
                              className="border-2 font-bold"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                            Description
                          </Label>
                          <Textarea
                            value={exp.summary || ""}
                            onChange={(e) => {
                              const newWork = [...(resumeData.work || [])];
                              newWork[idx].summary = e.target.value;
                              updResume({ work: newWork });
                            }}
                            className="min-h-[100px] font-medium"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Projects */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="font-black text-2xl">
                        Projects
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Side projects and highlighted work.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updResume({
                          projects: [
                            ...(resumeData.projects || []),
                            {
                              id: nanoid(),
                              name: "Project Name",
                              description: "",
                              url: "",
                              githubUrl: "",
                              highlights: [],
                              startDate: "",
                              endDate: null,
                              keywords: [],
                            },
                          ],
                        })
                      }
                      className="border-2 font-black"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(resumeData.projects || []).map((proj, idx) => (
                      <div
                        key={idx}
                        className="group relative border-border/50 border-b pb-8 last:border-0 last:pb-0"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="-right-2 absolute top-0 text-destructive opacity-0 transition-all group-hover:opacity-100"
                          onClick={() => {
                            const newProj = [...(resumeData.projects || [])];
                            newProj.splice(idx, 1);
                            updResume({ projects: newProj });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="space-y-4">
                          <div className="mb-4 grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                                Project Name
                              </Label>
                              <Input
                                value={proj.name || ""}
                                onChange={(e) => {
                                  const newProj = [
                                    ...(resumeData.projects || []),
                                  ];
                                  newProj[idx].name = e.target.value;
                                  updResume({ projects: newProj });
                                }}
                                className="border-2 font-bold"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                                Project URL
                              </Label>
                              <Input
                                value={proj.url || ""}
                                onChange={(e) => {
                                  const newProj = [
                                    ...(resumeData.projects || []),
                                  ];
                                  newProj[idx].url = e.target.value;
                                  updResume({ projects: newProj });
                                }}
                                placeholder="e.g. GitHub: my-project"
                                className="border-2 font-bold"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                              Technologies (comma separated)
                            </Label>
                            <Input
                              value={(proj.keywords || []).join(", ")}
                              onChange={(e) => {
                                const newProj = [
                                  ...(resumeData.projects || []),
                                ];
                                newProj[idx].keywords = e.target.value
                                  .split(",")
                                  .map((t) => t.trim());
                                updResume({ projects: newProj });
                              }}
                              placeholder="React, Node.js, ..."
                              className="border-2 font-bold"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                              Description
                            </Label>
                            <Textarea
                              value={proj.description || ""}
                              onChange={(e) => {
                                const newProj = [
                                  ...(resumeData.projects || []),
                                ];
                                newProj[idx].description = e.target.value;
                                updResume({ projects: newProj });
                              }}
                              className="min-h-[80px] font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Education */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="font-black text-2xl">
                        Education
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Your educational background.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updResume({
                          education: [
                            ...(resumeData.education || []),
                            {
                              id: nanoid(),
                              studyType: "Degree",
                              institution: "Institution",
                              area: "",
                              url: "",
                              startDate: "",
                              endDate: null,
                              score: "",
                              courses: [],
                            },
                          ],
                        })
                      }
                      className="border-2 font-black"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(resumeData.education || []).map((edu, idx) => (
                      <div
                        key={idx}
                        className="group relative border-border/50 border-b pb-8 last:border-0 last:pb-0"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="-right-2 absolute top-0 text-destructive opacity-0 transition-all group-hover:opacity-100"
                          onClick={() => {
                            const newEdu = [...(resumeData.education || [])];
                            newEdu.splice(idx, 1);
                            updResume({ education: newEdu });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="mb-4 grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                              Degree / Certificate
                            </Label>
                            <Input
                              value={edu.studyType || ""}
                              onChange={(e) => {
                                const newEdu = [
                                  ...(resumeData.education || []),
                                ];
                                newEdu[idx].studyType = e.target.value;
                                updResume({ education: newEdu });
                              }}
                              className="border-2 font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                              Institution
                            </Label>
                            <Input
                              value={edu.institution || ""}
                              onChange={(e) => {
                                const newEdu = [
                                  ...(resumeData.education || []),
                                ];
                                newEdu[idx].institution = e.target.value;
                                updResume({ education: newEdu });
                              }}
                              className="border-2 font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                              Field of Study
                            </Label>
                            <Input
                              value={edu.area || ""}
                              onChange={(e) => {
                                const newEdu = [
                                  ...(resumeData.education || []),
                                ];
                                newEdu[idx].area = e.target.value;
                                updResume({ education: newEdu });
                              }}
                              placeholder="e.g. Information Technology"
                              className="border-2 font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                              Graduation Year
                            </Label>
                            <Input
                              type="number"
                              value={edu.endDate || ""}
                              onChange={(e) => {
                                const newEdu = [
                                  ...(resumeData.education || []),
                                ];
                                newEdu[idx].endDate = e.target.value || null;
                                updResume({ education: newEdu });
                              }}
                              placeholder="e.g. 2025"
                              className="border-2 font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <footer className="border-border/50 border-t bg-muted/20 py-10">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="font-bold text-muted-foreground text-sm">
            AI Job Analyzer &copy; {new Date().getFullYear()} • Customised for{" "}
            {user?.name || "Professional"}
          </p>
        </div>
      </footer>
    </>
  );
}
