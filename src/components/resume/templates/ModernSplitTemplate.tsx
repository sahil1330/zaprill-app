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
 * ModernSplitTemplate — Two-column layout with fixed sidebar
 * ATS Score: 88 (clean structure, sidebar is parseable)
 */
export default function ModernSplitTemplate({
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

  return (
    <div
      className="resume-page modern-split-template"
      data-page-format={page?.format ?? "a4"}
      style={{
        fontFamily,
        fontSize,
        lineHeight,
        ["--resume-padding" as string]: `${page?.margin ?? 20}mm`,
        ["--resume-primary" as string]: theme?.primary || "#2563eb",
        ["--resume-bg" as string]: theme?.background || "#ffffff",
        ["--resume-text" as string]: theme?.text || "#1f2937",
        ["--resume-accent" as string]: theme?.accent || "#eff6ff",
      }}
    >
      <div className="ms-container">
        {/* Sidebar (left) */}
        <aside className="ms-sidebar">
          <header className="ms-header">
            {basics.picture && (
              <div className="mb-3">
                <img
                  src={basics.picture}
                  alt={basics.name || "Profile"}
                  className="h-20 w-20 rounded-full border-2 border-[var(--resume-primary)] object-cover shadow-sm"
                />
              </div>
            )}
            <h1 className="resume-name">{basics.name || "Your Name"}</h1>
            <p className="resume-label">{basics.label}</p>
          </header>

          <div className="ms-sidebar-content">
            {/* Contact */}
            <section className="ms-sidebar-section">
              <h3 className="ms-sidebar-title">Contact</h3>
              <div className="ms-sidebar-list">
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
                  text={
                    basics.location?.city
                      ? `${basics.location.city}${basics.location.region ? `, ${basics.location.region}` : ""}${basics.location.countryCode ? `, ${basics.location.countryCode}` : ""}`
                      : ""
                  }
                />
                <ContactItem
                  icon={IconWorld}
                  text={formatProfileText(basics.url, basics.url)}
                  href={basics.url}
                />
                {(basics.profiles || []).map((p) => (
                  <ContactItem
                    key={p.network}
                    icon={getProfileIcon(p.network)}
                    text={formatProfileText(p.url, p.username || p.network)}
                    href={p.url}
                  />
                ))}
              </div>
            </section>

            {/* Skills */}
            {sectionVisibility?.skills && (skills || []).length > 0 && (
              <section className="ms-sidebar-section">
                <h3 className="ms-sidebar-title">Skills</h3>
                <div className="ms-skills-list">
                  {(skills || []).map((group) => (
                    <div key={group.id} className="ms-skill-group">
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                        <h4 className="!mb-0 ms-skill-name">{group.name}</h4>
                        {group.level && (
                          <span className="font-medium text-[10px] text-muted-foreground opacity-85">
                            {group.level}
                          </span>
                        )}
                      </div>
                      <div className="ms-skill-keywords">
                        {(group.keywords || []).map((kw) => (
                          <span key={kw} className="ms-skill-badge">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {sectionVisibility?.languages && (languages || []).length > 0 && (
              <section className="ms-sidebar-section">
                <h3 className="ms-sidebar-title">Languages</h3>
                <div className="ms-sidebar-list">
                  {(languages || []).map((item) => (
                    <div key={item.id} className="ms-lang-item">
                      <span className="ms-lang-name">{item.language}</span>
                      <span className="ms-lang-level">{item.fluency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>

        {/* Main (right) */}
        <main className="ms-main">
          {/* Summary */}
          {sectionVisibility?.summary && basics?.summary && (
            <section className="ms-section">
              <h2 className="ms-section-title">Summary</h2>
              <div
                className="resume-text"
                dangerouslySetInnerHTML={{ __html: basics.summary }}
              />
            </section>
          )}

          {/* Experience */}
          {sectionVisibility?.work && (work || []).length > 0 && (
            <section className="ms-section">
              <h2 className="ms-section-title">Experience</h2>
              {(work || []).map((item) => (
                <div key={item.id} className="ms-entry">
                  <div className="ms-entry-header">
                    <div>
                      <h3 className="ms-entry-title">{item.position}</h3>
                      <p className="ms-entry-org flex flex-wrap items-center gap-1.5">
                        <span>{item.company}</span>
                        {item.website && (
                          <a
                            href={ensureHttps(item.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--resume-primary)] transition-opacity hover:opacity-80"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {item.location && (
                          <span className="ml-2 flex items-center gap-1 font-normal text-muted-foreground text-xs">
                            <span className="mr-1.5 opacity-40">•</span>
                            {item.location}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="ms-entry-date">
                      {item.startDate} – {item.endDate || "Present"}
                    </span>
                  </div>
                  {item.summary && (
                    <div
                      className="resume-text mb-2 text-justify"
                      dangerouslySetInnerHTML={{ __html: item.summary }}
                    />
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="ms-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={`${item.id}-h-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {sectionVisibility?.education && (education || []).length > 0 && (
            <section className="ms-section">
              <h2 className="ms-section-title">Education</h2>
              {(education || []).map((item) => (
                <div key={item.id} className="ms-entry">
                  <div className="ms-entry-header">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="ms-entry-title">{item.institution}</h3>
                        {item.url && (
                          <a
                            href={ensureHttps(item.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--resume-primary)] transition-opacity hover:opacity-80"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="ms-entry-org">
                        {item.studyType}
                        {item.area ? ` in ${item.area}` : ""}
                        {item.score ? ` — GPA: ${item.score}` : ""}
                      </p>
                    </div>
                    <span className="ms-entry-date">
                      {item.startDate} – {item.endDate || "Present"}
                    </span>
                  </div>
                  {item.courses && (item.courses || []).length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span className="mr-1 font-medium text-muted-foreground text-xs">
                        Courses:
                      </span>
                      {(item.courses || []).map((course, idx) => (
                        <span
                          key={idx}
                          className="rounded border px-2 py-0.5 font-medium text-[10px]"
                          style={{
                            backgroundColor:
                              "color-mix(in srgb, var(--resume-primary) 5%, transparent)",
                            color: "var(--resume-primary)",
                            borderColor:
                              "color-mix(in srgb, var(--resume-primary) 10%, transparent)",
                          }}
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Projects */}
          {sectionVisibility?.projects && (projects || []).length > 0 && (
            <section className="ms-section">
              <h2 className="ms-section-title">Projects</h2>
              {(projects || []).map((item) => (
                <div key={item.id} className="ms-entry">
                  <div className="ms-entry-header">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="ms-entry-title">{item.name}</h3>
                      {item.url && (
                        <a
                          href={ensureHttps(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--resume-primary)] transition-opacity hover:opacity-80"
                          title="Project Link"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {item.githubUrl && (
                        <a
                          href={ensureHttps(item.githubUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--resume-primary)] transition-opacity hover:opacity-80"
                          title="GitHub Repository"
                        >
                          <IconBrandGithub className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <span className="ms-entry-date">
                      {item.startDate} – {item.endDate || ""}
                    </span>
                  </div>
                  {item.description && (
                    <p className="ms-text mb-2">{item.description}</p>
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="ms-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={`${item.id}-h-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                  {item.keywords && (item.keywords || []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(item.keywords || []).map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-md border px-2 py-0.5 font-semibold text-[10px]"
                          style={{
                            backgroundColor:
                              "color-mix(in srgb, var(--resume-primary) 8%, transparent)",
                            color: "var(--resume-primary)",
                            borderColor:
                              "color-mix(in srgb, var(--resume-primary) 15%, transparent)",
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {sectionVisibility?.certifications &&
            (certifications || []).length > 0 && (
              <section className="ms-section">
                <h2 className="ms-section-title">Certifications</h2>
                {(certifications || []).map((item) => (
                  <div
                    key={item.id}
                    className="ms-entry-inline flex items-center"
                  >
                    <div className="flex items-center gap-1.5">
                      {item.url ? (
                        <a
                          href={ensureHttps(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-[var(--resume-primary)] hover:underline"
                        >
                          {item.name}
                          <ExternalLink className="inline h-3 w-3 opacity-70" />
                        </a>
                      ) : (
                        <span className="font-bold">{item.name}</span>
                      )}
                    </div>
                    <span className="mx-2 text-muted-foreground">|</span>
                    <span>{item.issuer}</span>
                    <span className="ml-auto text-muted-foreground">
                      {item.date}
                    </span>
                  </div>
                ))}
              </section>
            )}

          {/* Volunteer */}
          {sectionVisibility?.volunteer && (volunteer || []).length > 0 && (
            <section className="ms-section">
              <h2 className="ms-section-title">Volunteer Experience</h2>
              {(volunteer || []).map((item) => (
                <div key={item.id} className="ms-entry">
                  <div className="ms-entry-header">
                    <div>
                      <h3 className="ms-entry-title">{item.position}</h3>
                      <p className="ms-entry-org flex flex-wrap items-center gap-1.5">
                        <span>{item.organization}</span>
                        {item.url && (
                          <a
                            href={ensureHttps(item.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--resume-primary)] transition-opacity hover:opacity-80"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </p>
                    </div>
                    <span className="ms-entry-date">
                      {item.startDate} – {item.endDate || "Present"}
                    </span>
                  </div>
                  {item.summary && (
                    <p className="ms-text mb-2 text-justify">{item.summary}</p>
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="ms-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={`${item.id}-h-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Awards */}
          {sectionVisibility?.awards && (awards || []).length > 0 && (
            <section className="ms-section">
              <h2 className="ms-section-title">Awards & Honors</h2>
              {(awards || []).map((item) => (
                <div key={item.id} className="ms-entry">
                  <div className="ms-entry-header">
                    <div>
                      <h3 className="ms-entry-title">{item.title}</h3>
                      <p className="ms-entry-org">{item.awarder}</p>
                    </div>
                    <span className="ms-entry-date">{item.date}</span>
                  </div>
                  {item.summary && (
                    <p className="ms-text text-justify">{item.summary}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Publications */}
          {sectionVisibility?.publications &&
            (publications || []).length > 0 && (
              <section className="ms-section">
                <h2 className="ms-section-title">Publications</h2>
                {(publications || []).map((item) => (
                  <div key={item.id} className="ms-entry">
                    <div className="ms-entry-header">
                      <div>
                        <h3 className="ms-entry-title flex items-center gap-1.5">
                          {item.name}
                          {item.url && (
                            <a
                              href={ensureHttps(item.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--resume-primary)] transition-opacity hover:opacity-80"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </h3>
                        <p className="ms-entry-org">{item.publisher}</p>
                      </div>
                      <span className="ms-entry-date">{item.releaseDate}</span>
                    </div>
                    {item.summary && (
                      <p className="ms-text text-justify">{item.summary}</p>
                    )}
                  </div>
                ))}
              </section>
            )}

          {/* References */}
          {sectionVisibility?.references && (references || []).length > 0 && (
            <section className="ms-section">
              <h2 className="ms-section-title">References</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(references || []).map((item) => (
                  <div
                    key={item.id}
                    className="rounded border p-3 text-xs italic leading-relaxed"
                    style={{
                      backgroundColor: "var(--resume-accent)",
                      borderColor:
                        "color-mix(in srgb, var(--resume-primary) 12%, transparent)",
                    }}
                  >
                    <p className="mb-2 text-muted-foreground">
                      &quot;{item.reference}&quot;
                    </p>
                    <p className="font-bold text-foreground not-italic">
                      — {item.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Custom Sections */}
          {(d.customSections || []).map((section) => {
            if (!section.items || section.items.length === 0) return null;
            return (
              <section key={section.id} className="ms-section">
                <h2 className="ms-section-title">{section.sectionName}</h2>
                {(section.items || []).map((item) => (
                  <div key={item.id} className="ms-entry">
                    <div className="ms-entry-header">
                      <div>
                        <h3 className="ms-entry-title">{item.title}</h3>
                        {item.subtitle && (
                          <p className="ms-entry-org">{item.subtitle}</p>
                        )}
                      </div>
                      {item.date && (
                        <span className="ms-entry-date">{item.date}</span>
                      )}
                    </div>
                    {item.description && (
                      <p className="ms-text mb-2 text-justify">
                        {item.description}
                      </p>
                    )}
                    {item.highlights && (item.highlights || []).length > 0 && (
                      <ul className="ms-bullets">
                        {(item.highlights || []).map((h, i) => (
                          <li key={`${item.id}-h-${i}`}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
