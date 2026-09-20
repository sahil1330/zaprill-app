"use client";

import { IconBrandGithub } from "@tabler/icons-react";
import { ExternalLink } from "lucide-react";
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
 * CreativePortfolioTemplate — Modern, bold design for creative professionals
 * ATS Score: 85 (uses some non-standard layouts, but remains parseable)
 */
export default function CreativePortfolioTemplate({
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
        <section key="summary" className="mb-12">
          <div
            className="font-medium text-2xl text-foreground leading-relaxed tracking-tight"
            dangerouslySetInnerHTML={{ __html: basics.summary }}
          />
        </section>
      ) : null,

    work: () =>
      sectionVisibility?.work && (work || []).length > 0 ? (
        <section key="work" className="mb-12">
          <h2 className="mb-8 font-black text-primary text-xs uppercase tracking-[0.2em]">
            Experience
          </h2>
          <div className="space-y-12">
            {(work || []).map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-4 md:grid-cols-4"
              >
                <div className="font-bold text-muted-foreground text-sm tabular-nums">
                  {item.startDate} — {item.endDate || "Present"}
                </div>
                <div className="md:col-span-3">
                  <h3 className="mb-1 font-bold text-xl">{item.position}</h3>
                  <div className="mb-4 flex flex-wrap items-center gap-2 font-medium text-primary">
                    <span>{item.company}</span>
                    {item.location && (
                      <span className="font-normal text-muted-foreground text-sm">
                        · {item.location}
                      </span>
                    )}
                    {item.website && (
                      <a
                        href={ensureHttps(item.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-normal text-muted-foreground text-xs transition-colors hover:text-primary"
                      >
                        · <ExternalLink size={12} />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                  {item.summary && (
                    <div
                      className="mb-4 text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.summary }}
                    />
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="space-y-3">
                      {(item.highlights || []).map((h, i) => (
                        <li
                          key={i}
                          className="flex gap-4 text-muted-foreground leading-relaxed"
                        >
                          <span className="shrink-0 text-primary/40">—</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    education: () =>
      sectionVisibility?.education && (education || []).length > 0 ? (
        <section key="education" className="mb-12">
          <h2 className="mb-8 font-black text-primary text-xs uppercase tracking-[0.2em]">
            Education
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {(education || []).map((item) => (
              <div key={item.id}>
                <h3 className="flex items-center gap-2 font-bold text-lg">
                  <span>{item.institution}</span>
                  {item.url && (
                    <a
                      href={ensureHttps(item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary transition-colors hover:text-primary/80"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </h3>
                <p className="mb-1 text-muted-foreground">
                  {item.studyType}
                  {item.area ? ` in ${item.area}` : ""}
                </p>
                <p className="font-medium text-primary text-sm">
                  {item.startDate} — {item.endDate || "Present"}
                  {item.score ? ` · GPA: ${item.score}` : ""}
                </p>
                {item.courses && (item.courses || []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(item.courses || []).map((course, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-secondary/60 px-2.5 py-1 font-medium text-[11px] text-muted-foreground"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    skills: () =>
      sectionVisibility?.skills && (skills || []).length > 0 ? (
        <section key="skills" className="mb-12">
          <h2 className="mb-8 font-black text-primary text-xs uppercase tracking-[0.2em]">
            Expertise
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {(skills || []).map((group) => (
              <div key={group.id}>
                <h3 className="mb-3 flex items-center justify-between gap-2 font-bold text-sm">
                  <span>{group.name}</span>
                  {group.level && (
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 font-black text-[10px] text-primary uppercase tracking-widest">
                      {group.level}
                    </span>
                  )}
                </h3>
                <ul className="creative-skill-tags list-none space-y-0 p-0">
                  {(group.keywords || []).map((skill, i) => (
                    <li key={`${group.id}-${i}`}>
                      <span className="creative-tag">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    projects: () =>
      sectionVisibility?.projects && (projects || []).length > 0 ? (
        <section key="projects" className="mb-12">
          <h2 className="mb-8 font-black text-primary text-xs uppercase tracking-[0.2em]">
            Featured Projects
          </h2>
          <div className="space-y-12">
            {(projects || []).map((item) => (
              <div key={item.id} className="group">
                <div className="mb-4 flex items-baseline justify-between">
                  <h3 className="flex items-center gap-3 font-bold text-2xl">
                    <span>{item.name}</span>
                    <span className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {item.url && (
                        <a
                          href={ensureHttps(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary transition-colors hover:text-primary/80"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                      {item.githubUrl && (
                        <a
                          href={ensureHttps(item.githubUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground transition-colors hover:text-primary"
                        >
                          <IconBrandGithub size={18} />
                        </a>
                      )}
                    </span>
                  </h3>
                  <span className="font-medium text-muted-foreground text-sm">
                    {item.startDate} — {item.endDate}
                  </span>
                </div>
                {item.description && (
                  <p className="mb-4 max-w-2xl text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                )}
                {item.highlights && (item.highlights || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(item.highlights || []).map((h, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground text-xs"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}
                {item.keywords && (item.keywords || []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(item.keywords || []).map((keyword, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 font-semibold text-[10px] text-primary uppercase tracking-wider"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    certifications: () =>
      sectionVisibility?.certifications && (certifications || []).length > 0 ? (
        <section key="certifications" className="mb-12">
          <h2 className="mb-6 font-black text-primary text-xs uppercase tracking-[0.2em]">
            Certifications
          </h2>
          <div className="flex flex-wrap gap-4">
            {(certifications || []).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border-2 border-border p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 flex items-center gap-1.5 font-bold text-sm">
                  {item.url ? (
                    <a
                      href={ensureHttps(item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 transition-colors hover:text-primary"
                    >
                      <span>{item.name}</span>
                      <ExternalLink
                        size={12}
                        className="inline text-muted-foreground"
                      />
                    </a>
                  ) : (
                    <span>{item.name}</span>
                  )}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {item.issuer} · {item.date}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    languages: () =>
      sectionVisibility?.languages && (languages || []).length > 0 ? (
        <section key="languages" className="mb-12">
          <h2 className="mb-6 font-black text-primary text-xs uppercase tracking-[0.2em]">
            Languages
          </h2>
          <div className="flex flex-wrap gap-8">
            {(languages || []).map((item) => (
              <div key={item.id} className="flex flex-col">
                <span className="font-bold text-lg">{item.language}</span>
                <span className="font-black text-primary/60 text-xs uppercase tracking-widest">
                  {item.fluency}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    volunteer: () =>
      sectionVisibility?.volunteer && (volunteer || []).length > 0 ? (
        <section key="volunteer" className="mb-12">
          <h2 className="mb-8 font-black text-primary text-xs uppercase tracking-[0.2em]">
            Volunteer
          </h2>
          <div className="space-y-12">
            {(volunteer || []).map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-4 md:grid-cols-4"
              >
                <div className="font-bold text-muted-foreground text-sm tabular-nums">
                  {item.startDate} — {item.endDate || "Present"}
                </div>
                <div className="md:col-span-3">
                  <h3 className="mb-1 font-bold text-xl">{item.position}</h3>
                  <div className="mb-4 flex flex-wrap items-center gap-2 font-medium text-primary">
                    <span>{item.organization}</span>
                    {item.url && (
                      <a
                        href={ensureHttps(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-normal text-muted-foreground text-xs transition-colors hover:text-primary"
                      >
                        · <ExternalLink size={12} />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                  {item.summary && (
                    <div
                      className="mb-4 text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.summary }}
                    />
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="space-y-3">
                      {(item.highlights || []).map((h, i) => (
                        <li
                          key={i}
                          className="flex gap-4 text-muted-foreground leading-relaxed"
                        >
                          <span className="shrink-0 text-primary/40">—</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    awards: () =>
      sectionVisibility?.awards && (awards || []).length > 0 ? (
        <section key="awards" className="mb-12">
          <h2 className="mb-8 font-black text-primary text-xs uppercase tracking-[0.2em]">
            Awards
          </h2>
          <div className="space-y-12">
            {(awards || []).map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-4 md:grid-cols-4"
              >
                <div className="font-bold text-muted-foreground text-sm tabular-nums">
                  {item.date}
                </div>
                <div className="md:col-span-3">
                  <h3 className="mb-1 font-bold text-xl">{item.title}</h3>
                  <p className="mb-4 font-medium text-primary">
                    {item.awarder}
                  </p>
                  {item.summary && (
                    <div
                      className="text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.summary }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    publications: () =>
      sectionVisibility?.publications && (publications || []).length > 0 ? (
        <section key="publications" className="mb-12">
          <h2 className="mb-8 font-black text-primary text-xs uppercase tracking-[0.2em]">
            Publications
          </h2>
          <div className="space-y-12">
            {(publications || []).map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 gap-4 md:grid-cols-4"
              >
                <div className="font-bold text-muted-foreground text-sm tabular-nums">
                  {item.releaseDate}
                </div>
                <div className="md:col-span-3">
                  <h3 className="mb-1 flex items-center gap-2 font-bold text-xl">
                    <span>{item.name}</span>
                    {item.url && (
                      <a
                        href={ensureHttps(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary transition-colors hover:text-primary/80"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </h3>
                  <p className="mb-4 font-medium text-primary">
                    {item.publisher}
                  </p>
                  {item.summary && (
                    <div
                      className="text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.summary }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    references: () =>
      sectionVisibility?.references && (references || []).length > 0 ? (
        <section key="references" className="mb-12">
          <h2 className="mb-8 font-black text-primary text-xs uppercase tracking-[0.2em]">
            References
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {(references || []).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border-2 border-border p-6 italic transition-colors hover:border-primary"
              >
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  &quot;{item.reference}&quot;
                </p>
                <p className="font-bold text-foreground not-italic">
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
      className="resume-page creative-portfolio-template"
      data-page-format={page?.format ?? "a4"}
      style={{
        fontFamily,
        fontSize,
        lineHeight,
        ["--resume-padding" as string]: `${page?.margin ?? 20}mm`,
        ["--resume-primary" as string]: theme?.primary || "#ff3e00",
        ["--resume-bg" as string]: theme?.background || "#ffffff",
        ["--resume-text" as string]: theme?.text || "#1a1a1a",
        ["--resume-accent" as string]: theme?.accent || "#000000",
        ["--primary" as string]: theme?.primary || "#ff3e00",
        ["--foreground" as string]: theme?.text || "#1a1a1a",
        ["--background" as string]: theme?.background || "#ffffff",
        ["--muted-foreground" as string]: theme?.accent || "#000000",
      }}
    >
      <header className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {basics.picture && (
            <img
              src={basics.picture}
              alt={basics.name}
              className="h-24 w-24 shrink-0 rounded-2xl border-4 border-primary object-cover shadow-lg"
            />
          )}
          <div>
            <h1 className="mb-4 font-black text-7xl uppercase leading-none tracking-tighter">
              {basics.name || "Your Name"}
            </h1>
            <p className="font-bold text-2xl text-primary tracking-tight">
              {basics.label}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 font-medium text-sm md:items-end">
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
            text={(() => {
              const parts = [];
              if (basics.location?.city) parts.push(basics.location.city);
              if (basics.location?.region) parts.push(basics.location.region);
              if (basics.location?.countryCode)
                parts.push(basics.location.countryCode);
              return parts.join(", ");
            })()}
          />
          <ContactItem
            icon={IconWorld}
            text={formatProfileText(basics.url, basics.url)}
            href={basics.url}
          />
        </div>
      </header>

      <main>
        {Object.keys(sectionRenderers).map((key) => sectionRenderers[key]())}

        {/* Custom Sections */}
        {(d.customSections || []).map((section) => {
          if ((section.items || []).length === 0) return null;
          return (
            <section key={section.id} className="mb-12">
              <h2 className="mb-8 font-black text-primary text-xs uppercase tracking-[0.2em]">
                {section.sectionName}
              </h2>
              <div className="space-y-12">
                {(section.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 gap-4 md:grid-cols-4"
                  >
                    <div className="font-bold text-muted-foreground text-sm tabular-nums">
                      {item.date}
                    </div>
                    <div className="md:col-span-3">
                      <h3 className="mb-1 font-bold text-xl">{item.title}</h3>
                      {item.subtitle && (
                        <p className="mb-4 font-medium text-primary">
                          {item.subtitle}
                        </p>
                      )}
                      {item.description && (
                        <div
                          className="prose prose-sm mb-4 max-w-none text-muted-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      )}
                      {item.highlights &&
                        (item.highlights || []).length > 0 && (
                          <ul className="space-y-3">
                            {(item.highlights || []).map((h, i) => (
                              <li
                                key={i}
                                className="flex gap-4 text-muted-foreground leading-relaxed"
                              >
                                <span className="shrink-0 text-primary/40">
                                  —
                                </span>
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {(basics.profiles || []).length > 0 && (
        <footer className="mt-20 border-foreground border-t-4 pt-12">
          <div className="flex flex-wrap gap-8">
            {(basics.profiles || []).map((p) => (
              <a
                key={p.network}
                href={ensureHttps(p.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:bg-primary">
                  {(() => {
                    const Icon = getProfileIcon(p.network);
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <div>
                  <div className="font-black text-[10px] text-muted-foreground uppercase tracking-widest">
                    {p.network}
                  </div>
                  <div className="font-bold text-sm">
                    {p.username || "View Profile"}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
