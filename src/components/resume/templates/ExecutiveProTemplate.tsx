"use client";

import { IconBrandGithub } from "@tabler/icons-react";
import { Award, ExternalLink } from "lucide-react";
import { ensureHttps } from "@/lib/utils";
import {
  DEFAULT_RESUME_DATA,
  DEFAULT_RESUME_METADATA,
  type ResumeData,
  type ResumeMetadata,
} from "@/types/resume";
import {
  ContactItem,
  formatProfileText,
  getProfileIcon,
  IconMail,
  IconMapPin,
  IconPhone,
  IconWorld,
} from "./SharedComponents";

/**
 * ExecutiveProTemplate — Corporate, high-end design
 * ATS Score: 95 (very clean, standard headers, high parseability)
 */
export default function ExecutiveProTemplate({
  data,
  metadata,
}: {
  data: ResumeData;
  metadata: ResumeMetadata;
}) {
  // Safety: use fallbacks if data/metadata are empty
  const d = data || DEFAULT_RESUME_DATA;
  const m = metadata || DEFAULT_RESUME_METADATA;

  const basics = d.basics || DEFAULT_RESUME_DATA.basics;
  const work = d.work || [];
  const education = d.education || [];
  const skills = d.skills || [];
  const projects = d.projects || [];
  const certifications = d.certifications || [];
  const languages = d.languages || [];
  const volunteer = d.volunteer || [];
  const awards = d.awards || [];
  const publications = d.publications || [];
  const references = d.references || [];
  const customSections = d.customSections || [];

  const {
    theme = DEFAULT_RESUME_METADATA.theme,
    typography = DEFAULT_RESUME_METADATA.typography,
    sectionVisibility = DEFAULT_RESUME_METADATA.sectionVisibility,
    page = DEFAULT_RESUME_METADATA.page,
  } = m;

  const fontFamily = typography?.font?.family || "Inter";
  const fontSize = `${typography?.font?.size || 11}pt`;
  const lineHeight = typography?.lineHeight || 1.5;

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      sectionVisibility?.summary && basics?.summary ? (
        <section key="summary" className="mb-8">
          <h2 className="mb-3 border-primary border-b-2 font-bold text-lg text-primary uppercase tracking-wider">
            Executive Summary
          </h2>
          <div
            className="text-muted-foreground italic leading-relaxed"
            dangerouslySetInnerHTML={{ __html: basics.summary }}
          />
        </section>
      ) : null,

    work: () =>
      sectionVisibility?.work && (work || []).length > 0 ? (
        <section key="work" className="mb-8">
          <h2 className="mb-4 border-primary border-b-2 font-bold text-lg text-primary uppercase tracking-wider">
            Professional Experience
          </h2>
          <div className="space-y-6">
            {(work || []).map((item) => (
              <div key={item.id}>
                <div className="mb-1 flex items-baseline justify-between">
                  <h3 className="font-bold text-foreground text-md">
                    {item.position}
                  </h3>
                  <span className="font-semibold text-muted-foreground text-sm">
                    {item.startDate} – {item.endDate || "Present"}
                  </span>
                </div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="flex items-center gap-1 font-bold text-primary tracking-tight">
                    {item.company}
                    {item.website && (
                      <a
                        href={ensureHttps(item.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary transition-colors hover:text-primary/80"
                        title="Company Website"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </span>
                  <span className="text-muted-foreground text-sm italic">
                    {item.location}
                  </span>
                </div>
                {item.summary && (
                  <div
                    className="mb-2 text-muted-foreground text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.summary }}
                  />
                )}
                {item.highlights && (item.highlights || []).length > 0 && (
                  <ul className="ml-4 space-y-1.5">
                    {(item.highlights || []).map((h, i) => (
                      <li
                        key={i}
                        className="list-disc pl-1 text-muted-foreground text-sm leading-snug"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    education: () =>
      sectionVisibility?.education && (education || []).length > 0 ? (
        <section key="education" className="mb-8">
          <h2 className="mb-4 border-primary border-b-2 font-bold text-lg text-primary uppercase tracking-wider">
            Education
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {(education || []).map((item) => (
              <div key={item.id}>
                <div className="mb-1 flex items-baseline justify-between">
                  <h3 className="flex items-center gap-1 font-bold text-foreground">
                    {item.institution}
                    {item.url && (
                      <a
                        href={ensureHttps(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary transition-colors hover:text-primary/80"
                        title="Institution Website"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </h3>
                  <span className="font-mono text-muted-foreground text-xs">
                    {item.startDate} – {item.endDate || "Present"}
                  </span>
                </div>
                <div className="font-medium text-primary text-sm">
                  {item.studyType}
                  {item.area ? ` in ${item.area}` : ""}
                </div>
                {item.score && (
                  <div className="mt-1 text-muted-foreground text-xs">
                    Academic Standing: {item.score}
                  </div>
                )}
                {item.courses && (item.courses || []).length > 0 && (
                  <div className="mt-2 text-muted-foreground text-xs leading-relaxed">
                    <span className="font-semibold text-primary">
                      Courses:{" "}
                    </span>
                    {(item.courses || []).join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    skills: () =>
      sectionVisibility?.skills && (skills || []).length > 0 ? (
        <section key="skills" className="mb-8">
          <h2 className="mb-4 border-primary border-b-2 font-bold text-lg text-primary uppercase tracking-wider">
            Core Competencies
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
            {(skills || []).map((group) => (
              <div key={group.id}>
                <h3 className="mb-2 flex items-center gap-1 font-bold text-primary text-xs uppercase">
                  {group.name}
                  {group.level && (
                    <span className="font-normal text-[10px] text-muted-foreground normal-case">
                      ({group.level})
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(group.keywords || []).map((skill, i) => (
                    <span
                      key={i}
                      className="border-primary/30 border-l-2 pl-2 text-muted-foreground text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    projects: () =>
      sectionVisibility?.projects && (projects || []).length > 0 ? (
        <section key="projects" className="mb-8">
          <h2 className="mb-4 border-primary border-b-2 font-bold text-lg text-primary uppercase tracking-wider">
            Selected Projects
          </h2>
          <div className="space-y-6">
            {(projects || []).map((item) => (
              <div key={item.id}>
                <div className="mb-1 flex items-baseline justify-between">
                  <h3 className="flex items-center gap-2 font-bold text-foreground text-md">
                    {item.name}
                    {item.url && (
                      <a
                        href={ensureHttps(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary transition-colors hover:text-primary/80"
                        title="Project Website"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {item.githubUrl && (
                      <a
                        href={ensureHttps(item.githubUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary transition-colors hover:text-primary/80"
                        title="GitHub Repository"
                      >
                        <IconBrandGithub size={14} />
                      </a>
                    )}
                  </h3>
                  <span className="text-muted-foreground text-sm">
                    {item.startDate} – {item.endDate || ""}
                  </span>
                </div>
                {item.description && (
                  <p className="mb-2 text-muted-foreground text-sm italic">
                    {item.description}
                  </p>
                )}
                {item.keywords && (item.keywords || []).length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {(item.keywords || []).map((kw, idx) => (
                      <span
                        key={idx}
                        className="rounded border border-primary/20 bg-secondary/5 px-1.5 py-0.5 font-semibold text-[10px] text-muted-foreground uppercase tracking-wide"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
                {item.highlights && (item.highlights || []).length > 0 && (
                  <ul className="ml-4 space-y-1">
                    {(item.highlights || []).map((h, i) => (
                      <li
                        key={i}
                        className="list-square pl-1 text-muted-foreground text-sm"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    certifications: () =>
      sectionVisibility?.certifications && (certifications || []).length > 0 ? (
        <section key="certifications" className="mb-8">
          <h2 className="mb-4 border-primary border-b-2 font-bold text-lg text-primary uppercase tracking-wider">
            Certifications & Licenses
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(certifications || []).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded border-primary border-l-4 bg-secondary/10 p-3"
              >
                <div>
                  <h3 className="flex items-center gap-1 font-bold text-sm">
                    {item.name}
                    {item.url && (
                      <a
                        href={ensureHttps(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary transition-colors hover:text-primary/80"
                        title="View Certification"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </h3>
                  <p className="text-muted-foreground text-xs">{item.issuer}</p>
                </div>
                <span className="rounded bg-primary/10 px-2 py-1 font-bold text-primary text-xs">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    languages: () =>
      sectionVisibility?.languages && (languages || []).length > 0 ? (
        <section key="languages" className="mb-8">
          <h2 className="mb-4 border-primary border-b-2 font-bold text-lg text-primary uppercase tracking-wider">
            Languages
          </h2>
          <div className="flex flex-wrap gap-8">
            {(languages || []).map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm">
                  {item.language}
                </span>
                <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 font-medium text-primary text-xs">
                  {item.fluency}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    volunteer: () =>
      sectionVisibility?.volunteer && (volunteer || []).length > 0 ? (
        <section key="volunteer" className="mb-8">
          <h2 className="mb-4 border-primary border-b-2 font-bold text-lg text-primary uppercase tracking-wider">
            Community Leadership
          </h2>
          <div className="space-y-4">
            {(volunteer || []).map((item) => (
              <div key={item.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-foreground">{item.position}</h3>
                  <span className="text-muted-foreground text-sm">
                    {item.startDate} – {item.endDate || ""}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-medium text-primary">
                  {item.organization}
                  {item.url && (
                    <a
                      href={ensureHttps(item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary transition-colors hover:text-primary/80"
                      title="Organization Website"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                {item.summary && (
                  <p className="mt-1 text-muted-foreground text-sm">
                    {item.summary}
                  </p>
                )}
                {item.highlights && (item.highlights || []).length > 0 && (
                  <ul className="mt-1.5 ml-4 space-y-1.5">
                    {(item.highlights || []).map((h, i) => (
                      <li
                        key={i}
                        className="list-disc pl-1 text-muted-foreground text-sm leading-snug"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    awards: () =>
      sectionVisibility?.awards && (awards || []).length > 0 ? (
        <section key="awards" className="mb-8">
          <h2 className="mb-4 border-primary border-b-2 font-bold text-lg text-primary uppercase tracking-wider">
            Honors & Awards
          </h2>
          <div className="space-y-4">
            {(awards || []).map((item) => (
              <div key={item.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  <span className="text-muted-foreground text-sm">
                    {item.date}
                  </span>
                </div>
                <div className="font-medium text-primary">{item.awarder}</div>
                {item.summary && (
                  <p className="mt-1 text-muted-foreground text-sm">
                    {item.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    publications: () =>
      sectionVisibility?.publications && (publications || []).length > 0 ? (
        <section key="publications" className="mb-8">
          <h2 className="mb-4 border-primary border-b-2 font-bold text-lg text-primary uppercase tracking-wider">
            Publications
          </h2>
          <div className="space-y-4">
            {(publications || []).map((item) => (
              <div key={item.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="flex items-center gap-1 font-bold text-foreground">
                    {item.name}
                    {item.url && (
                      <a
                        href={ensureHttps(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary transition-colors hover:text-primary/80"
                        title="View Publication"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </h3>
                  <span className="text-muted-foreground text-sm">
                    {item.releaseDate}
                  </span>
                </div>
                <div className="font-medium text-primary">{item.publisher}</div>
                {item.summary && (
                  <p className="mt-1 text-muted-foreground text-sm">
                    {item.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    references: () =>
      sectionVisibility?.references && (references || []).length > 0 ? (
        <section key="references" className="mb-8">
          <h2 className="mb-4 border-primary border-b-2 font-bold text-lg text-primary uppercase tracking-wider">
            References
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {(references || []).map((item) => (
              <div
                key={item.id}
                className="rounded border border-border bg-secondary/5 p-4 italic"
              >
                <p className="mb-2 text-muted-foreground text-sm">
                  &quot;{item.reference}&quot;
                </p>
                <p className="font-bold text-foreground text-md">
                  — {item.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null,
  };

  return (
    <div
      className="resume-page executive-pro-template"
      data-page-format={page?.format ?? "a4"}
      style={{
        fontFamily,
        fontSize,
        lineHeight,
        ["--resume-padding" as string]: `${page?.margin ?? 20}mm`,
        ["--resume-primary" as string]: theme?.primary || "#1e293b",
        ["--resume-bg" as string]: theme?.background || "#ffffff",
        ["--resume-text" as string]: theme?.text || "#334155",
        ["--resume-accent" as string]: theme?.accent || "#3b82f6",
        ["--primary" as string]: theme?.primary || "#1e293b",
        ["--foreground" as string]: theme?.text || "#334155",
        ["--background" as string]: theme?.background || "#ffffff",
        ["--muted-foreground" as string]: theme?.accent || "#3b82f6",
      }}
    >
      <header className="mb-10 text-center">
        {basics.picture && (
          <div className="mb-4 flex justify-center">
            <img
              src={basics.picture}
              alt={basics.name || "Profile Picture"}
              className="h-24 w-24 rounded-full border-2 border-primary object-cover shadow-sm"
            />
          </div>
        )}
        <h1 className="mb-2 font-black text-4xl text-foreground uppercase tracking-tighter">
          {basics.name || "Your Name"}
        </h1>
        <p className="mb-6 font-bold text-lg text-primary uppercase tracking-widest">
          {basics.label}
        </p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-border border-y py-4">
          <ContactItem
            icon={IconMail}
            text={basics.email}
            href={`mailto:${basics.email}`}
          />
          <ContactItem
            icon={IconPhone}
            text={basics.phone}
            href={`tel:${basics.phone}`}
          />
          <ContactItem
            icon={IconMapPin}
            text={[
              basics.location?.city,
              basics.location?.region,
              basics.location?.countryCode,
            ]
              .filter(Boolean)
              .join(", ")}
          />
          <ContactItem
            icon={IconWorld}
            text={formatProfileText(basics.url, basics.url)}
            href={basics.url}
          />
        </div>

        {(basics.profiles || []).length > 0 && (
          <div className="mt-4 flex justify-center gap-6">
            {(basics.profiles || []).map((p) => (
              <ContactItem
                key={p.network}
                icon={getProfileIcon(p.network)}
                text={formatProfileText(p.url, p.username || p.network)}
                href={p.url}
              />
            ))}
          </div>
        )}
      </header>

      <main>
        {Object.keys(sectionRenderers).map((key) => sectionRenderers[key]())}

        {customSections && customSections.length > 0 && (
          <div className="mt-8 space-y-8">
            {customSections.map((section) => {
              if (!section.items || section.items.length === 0) return null;
              return (
                <section key={section.id} className="mb-8">
                  <h2 className="mb-4 border-primary border-b-2 font-bold font-serif text-lg text-primary uppercase tracking-wider">
                    {section.sectionName}
                  </h2>
                  <div className="space-y-6">
                    {section.items.map((item) => (
                      <div key={item.id}>
                        <div className="mb-1 flex items-baseline justify-between">
                          <h3 className="font-bold font-serif text-foreground text-md">
                            {item.title}
                          </h3>
                          {item.date && (
                            <span className="font-semibold text-muted-foreground text-sm">
                              {item.date}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <div className="mb-2 font-bold text-primary tracking-tight">
                            {item.subtitle}
                          </div>
                        )}
                        {item.description && (
                          <div
                            className="mb-2 text-muted-foreground text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: item.description,
                            }}
                          />
                        )}
                        {item.highlights &&
                          (item.highlights || []).length > 0 && (
                            <ul className="ml-4 space-y-1.5">
                              {(item.highlights || []).map((h, idx) => (
                                <li
                                  key={idx}
                                  className="list-disc pl-1 text-muted-foreground text-sm leading-snug"
                                >
                                  {h}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
