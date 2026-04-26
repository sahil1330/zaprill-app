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
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
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
import type { ParsedResume } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<{ resumeRaw: ParsedResume } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
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
        setResumeData(data.profile.resumeRaw);
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
  const updResume = (updates: Partial<ParsedResume>) => {
    if (!resumeData) return;
    setResumeData({ ...resumeData, ...updates });
  };

  const addSkill = () => {
    if (!resumeData || !newSkill.trim()) return;
    const currentSkills = resumeData.skills || [];
    if (currentSkills.includes(newSkill.trim())) {
      setNewSkill("");
      return;
    }
    updResume({ skills: [...currentSkills, newSkill.trim()] });
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    if (!resumeData) return;
    updResume({ skills: (resumeData.skills || []).filter((s) => s !== skill) });
  };

  const addSocialProfile = () => {
    if (!resumeData) return;
    const current = resumeData.socialProfiles || [];
    updResume({
      socialProfiles: [...current, { platform: "Portfolio", url: "" }],
    });
  };

  const updateSocialProfile = (
    index: number,
    updates: { platform?: string; url?: string },
  ) => {
    if (!resumeData) return;
    const current = [...(resumeData.socialProfiles || [])];
    if (!current[index]) return;
    current[index] = { ...current[index], ...updates };
    updResume({ socialProfiles: current });
  };

  const removeSocialProfile = (index: number) => {
    if (!resumeData) return;
    const current = (resumeData.socialProfiles || []).filter(
      (_, i) => i !== index,
    );
    updResume({ socialProfiles: current });
  };

  const addRole = () => {
    if (!resumeData || !newRole.trim()) return;
    const currentRoles = resumeData.inferredJobTitles || [];
    if (currentRoles.includes(newRole.trim())) {
      setNewRole("");
      return;
    }
    updResume({ inferredJobTitles: [...currentRoles, newRole.trim()] });
    setNewRole("");
  };

  const removeRole = (role: string) => {
    if (!resumeData) return;
    updResume({
      inferredJobTitles: (resumeData.inferredJobTitles || []).filter(
        (r) => r !== role,
      ),
    });
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
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar user={user} showBack backLabel="Dashboard" backHref="/" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar
        user={
          user
            ? { name: user.name, email: user.email, image: user.image }
            : null
        }
        showBack
        backLabel="Dashboard"
        backHref="/"
        pageTitle={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
              <User className="h-4 w-4 text-background" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-foreground truncate">
              Edit Profile
            </span>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              My Profile
            </h1>
            <p className="text-muted-foreground font-semibold">
              Manage your personal details and professional data for better job
              matches.
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="font-black h-14 px-8 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {saving ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-8 bg-muted/50 p-1 rounded-xl h-14 border border-border/50">
            <TabsTrigger
              value="personal"
              className="font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger
              value="resume"
              className="font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg flex items-center gap-2"
            >
              <Briefcase className="h-4 w-4" />
              Parsed Resume
            </TabsTrigger>
            <TabsTrigger
              value="experience"
              className="font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Experience
            </TabsTrigger>
          </TabsList>

          {/* ── Personal Info Tab ────────────────────────────────────────────────── */}
          <TabsContent value="personal" className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-black flex items-center gap-2">
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
                    className="text-sm font-bold uppercase tracking-widest text-muted-foreground"
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
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-bold uppercase tracking-widest text-muted-foreground"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={resumeData?.phone || ""}
                      onChange={(e) => updResume({ phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      className="h-12 font-semibold text-lg"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label
                      htmlFor="location"
                      className="text-sm font-bold uppercase tracking-widest text-muted-foreground"
                    >
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={resumeData?.location || ""}
                      onChange={(e) => updResume({ location: e.target.value })}
                      placeholder="City, Country"
                      className="h-12 font-semibold text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" />
                      Social & Professional Profiles
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addSocialProfile}
                      className="h-8 text-xs font-bold border-2"
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add Profile
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {(resumeData?.socialProfiles || []).map((social, idx) => {
                      const platform = social.platform.toLowerCase();
                      const Icon = platform.includes("linkedin")
                        ? IconBrandLinkedin
                        : platform.includes("github")
                          ? IconBrandGithub
                          : Globe;

                      return (
                        <div
                          key={idx}
                          className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border-2 border-border bg-muted/30 group relative"
                        >
                          <div className="flex-1 grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Platform
                              </Label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Input
                                  value={social.platform}
                                  onChange={(e) =>
                                    updateSocialProfile(idx, {
                                      platform: e.target.value,
                                    })
                                  }
                                  placeholder="LinkedIn, GitHub, etc."
                                  className="h-10 pl-10 font-bold border-2"
                                />
                              </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
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
                                  className="h-10 font-bold border-2 pr-10"
                                />
                                {social.url && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                    onClick={() => {
                                      const url = social.url.startsWith("http")
                                        ? social.url
                                        : `https://${social.url}`;
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
                            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-border opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}

                    {(!resumeData?.socialProfiles ||
                      resumeData.socialProfiles.length === 0) && (
                      <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                        <p className="text-sm text-muted-foreground font-medium">
                          No social profiles added.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 opacity-60 cursor-not-allowed">
                  <Label
                    htmlFor="email"
                    className="text-sm font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="h-12 font-semibold text-lg bg-muted"
                  />
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
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
              <Card className="border-dashed border-2 p-12 text-center">
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
                    <CardTitle className="text-2xl font-black">
                      Professional Summary
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsUpdatingResume(!isUpdatingResume)}
                      className="font-bold border-2"
                    >
                      {isUpdatingResume ? "Cancel" : "Update from File"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {isUpdatingResume && (
                      <div className="mb-10 p-6 border-2 border-dashed border-primary/20 rounded-2xl bg-primary/5 animate-in fade-in slide-in-from-top-4 duration-500">
                        <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-4">
                          Upload New Resume
                        </h4>
                        <ResumeUploader
                          onUpload={handleResumeUpload}
                          disabled={isParsing}
                        />
                        {isParsing && (
                          <div className="flex items-center justify-center gap-3 mt-4 text-primary font-bold">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Parsing your experience...
                          </div>
                        )}
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="grid gap-3">
                        <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                          Career Summary
                        </Label>
                        <Textarea
                          value={resumeData.summary || ""}
                          onChange={(e) =>
                            updResume({ summary: e.target.value })
                          }
                          className="min-h-[120px] font-medium text-lg leading-relaxed"
                          placeholder="Briefly describe your professional background..."
                        />
                      </div>

                      <div className="grid gap-3">
                        <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                          Years of Experience
                        </Label>
                        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                          <span className="text-4xl font-black text-foreground w-16">
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
                        <p className="text-xs font-bold text-muted-foreground italic">
                          Slide to adjust your total professional experience.
                        </p>
                      </div>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="grid gap-3">
                      <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Target Job Titles
                      </Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(resumeData.inferredJobTitles || []).map((role) => (
                          <Badge
                            key={role}
                            className="h-9 px-4 text-sm font-black bg-foreground text-background flex items-center gap-2 rounded-lg"
                          >
                            {role}
                            <Trash2
                              className="h-3.5 w-3.5 cursor-pointer hover:text-red-400 transition-colors"
                              onClick={() => removeRole(role)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addRole()}
                          placeholder="Add targeted role... (e.g. Frontend Developer)"
                          className="h-11 font-semibold"
                        />
                        <Button
                          variant="secondary"
                          className="font-black"
                          onClick={addRole}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black">
                      Top Skills
                    </CardTitle>
                    <CardDescription className="font-medium">
                      These skills are used to match you with job listings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(resumeData.skills || []).map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="h-9 px-4 text-sm font-bold border-2 flex items-center gap-2 rounded-lg group hover:border-foreground transition-all"
                        >
                          {skill}
                          <Trash2
                            className="h-3.5 w-3.5 cursor-pointer text-muted-foreground group-hover:text-red-500 transition-colors"
                            onClick={() => removeSkill(skill)}
                          />
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
                      <CardTitle className="text-2xl font-black">
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
                          experience: [
                            ...(resumeData.experience || []),
                            {
                              role: "New Position",
                              company: "Company",
                              description: "",
                              skillsUsed: [],
                            },
                          ],
                        })
                      }
                      className="font-black border-2"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(resumeData.experience || []).map((exp, idx) => (
                      <div
                        key={idx}
                        className="group relative border-b border-border/50 pb-8 last:border-0 last:pb-0"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 text-destructive transition-all"
                          onClick={() => {
                            const newExp = [...(resumeData.experience || [])];
                            newExp.splice(idx, 1);
                            updResume({ experience: newExp });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Role
                            </Label>
                            <Input
                              value={exp.role || ""}
                              onChange={(e) => {
                                const newExp = [
                                  ...(resumeData.experience || []),
                                ];
                                newExp[idx].role = e.target.value;
                                updResume({ experience: newExp });
                              }}
                              className="font-bold border-2"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Company
                            </Label>
                            <Input
                              value={exp.company || ""}
                              onChange={(e) => {
                                const newExp = [
                                  ...(resumeData.experience || []),
                                ];
                                newExp[idx].company = e.target.value;
                                updResume({ experience: newExp });
                              }}
                              className="font-bold border-2"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Duration
                            </Label>
                            <Input
                              value={exp.duration || ""}
                              onChange={(e) => {
                                const newExp = [
                                  ...(resumeData.experience || []),
                                ];
                                newExp[idx].duration = e.target.value;
                                updResume({ experience: newExp });
                              }}
                              placeholder="e.g. Jan 2020 - Present"
                              className="font-bold border-2"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Description
                          </Label>
                          <Textarea
                            value={exp.description || ""}
                            onChange={(e) => {
                              const newExp = [...(resumeData.experience || [])];
                              newExp[idx].description = e.target.value;
                              updResume({ experience: newExp });
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
                      <CardTitle className="text-2xl font-black">
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
                              name: "Project Name",
                              description: "",
                              technologies: [],
                            },
                          ],
                        })
                      }
                      className="font-black border-2"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(resumeData.projects || []).map((proj, idx) => (
                      <div
                        key={idx}
                        className="group relative border-b border-border/50 pb-8 last:border-0 last:pb-0"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 text-destructive transition-all"
                          onClick={() => {
                            const newProj = [...(resumeData.projects || [])];
                            newProj.splice(idx, 1);
                            updResume({ projects: newProj });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
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
                                className="font-bold border-2"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
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
                                className="font-bold border-2"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Technologies (comma separated)
                            </Label>
                            <Input
                              value={(proj.technologies || []).join(", ")}
                              onChange={(e) => {
                                const newProj = [
                                  ...(resumeData.projects || []),
                                ];
                                newProj[idx].technologies = e.target.value
                                  .split(",")
                                  .map((t) => t.trim());
                                updResume({ projects: newProj });
                              }}
                              placeholder="React, Node.js, ..."
                              className="font-bold border-2"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
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
                      <CardTitle className="text-2xl font-black">
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
                            { degree: "Degree", institution: "Institution" },
                          ],
                        })
                      }
                      className="font-black border-2"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {(resumeData.education || []).map((edu, idx) => (
                      <div
                        key={idx}
                        className="group relative border-b border-border/50 pb-8 last:border-0 last:pb-0"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 text-destructive transition-all"
                          onClick={() => {
                            const newEdu = [...(resumeData.education || [])];
                            newEdu.splice(idx, 1);
                            updResume({ education: newEdu });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Degree / Certificate
                            </Label>
                            <Input
                              value={edu.degree || ""}
                              onChange={(e) => {
                                const newEdu = [
                                  ...(resumeData.education || []),
                                ];
                                newEdu[idx].degree = e.target.value;
                                updResume({ education: newEdu });
                              }}
                              className="font-bold border-2"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
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
                              className="font-bold border-2"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Field of Study
                            </Label>
                            <Input
                              value={edu.field || ""}
                              onChange={(e) => {
                                const newEdu = [
                                  ...(resumeData.education || []),
                                ];
                                newEdu[idx].field = e.target.value;
                                updResume({ education: newEdu });
                              }}
                              placeholder="e.g. Information Technology"
                              className="font-bold border-2"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                              Graduation Year
                            </Label>
                            <Input
                              type="number"
                              value={edu.year || ""}
                              onChange={(e) => {
                                const newEdu = [
                                  ...(resumeData.education || []),
                                ];
                                newEdu[idx].year =
                                  parseInt(e.target.value) || undefined;
                                updResume({ education: newEdu });
                              }}
                              placeholder="e.g. 2025"
                              className="font-bold border-2"
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

      <footer className="py-10 border-t border-border/50 bg-muted/20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-muted-foreground">
            AI Job Analyzer &copy; {new Date().getFullYear()} • Customised for{" "}
            {user?.name || "Professional"}
          </p>
        </div>
      </footer>
    </div>
  );
}
