// biome-ignore-all lint/security/noDangerouslySetInnerHtml: template rendering rich-text HTML
"use client";

import { IconBrandGithub } from "@tabler/icons-react";
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
 * TechStackTemplate — Two-column layout with skills sidebar
 * ATS Score: 90 (highly parseable, sidebar uses proper HTML structure)
 */
export default function TechStackTemplate({
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

  return (
    <div
      className="resume-page tech-stack-template"
      data-page-format={page?.format ?? "a4"}
      style={{
        fontFamily,
        fontSize,
        lineHeight,
        ["--resume-padding" as string]: `${page?.margin ?? 20}mm`,
        ["--resume-primary" as string]: theme?.primary || "#1a1a2e",
        ["--resume-bg" as string]: theme?.background || "#ffffff",
        ["--resume-text" as string]: theme?.text || "#333333",
        ["--resume-accent" as string]: theme?.accent || "#4a6cf7",
      }}
    >
      {/* Header — full width */}
      <header className="ts-header">
        <h1 className="resume-name">{basics.name || "Your Name"}</h1>
        {basics.label && <p className="resume-label">{basics.label}</p>}
        <div className="resume-contact">
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
              basics.location
                ? [
                    basics.location.city,
                    basics.location.region,
                    basics.location.countryCode,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : ""
            }
          />
          <ContactItem
            icon={IconWorld}
            text={formatProfileText(basics.url, basics.url)}
            href={basics.url}
          />

          {(basics.profiles || []).map((p, i) => (
            <ContactItem
              key={`${p.network}-${p.username || i}`}
              icon={getProfileIcon(p.network)}
              text={formatProfileText(p.url, p.username || p.network)}
              href={p.url}
            />
          ))}
        </div>
      </header>

      {/* Two-column layout */}
      <div className="ts-columns">
        {/* Main column (left) */}
        <div className="ts-main">
          {/* Summary */}
          {sectionVisibility?.summary && basics?.summary && (
            <section className="resume-section">
              <h2 className="resume-section-title">Summary</h2>
              <div
                className="resume-text"
                dangerouslySetInnerHTML={{ __html: basics.summary }}
              />
            </section>
          )}

          {/* Experience */}
          {sectionVisibility?.work && (work || []).length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">Experience</h2>
              {(work || []).map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <div>
                      <h3 className="resume-entry-title">{item.position}</h3>
                      <span className="resume-entry-subtitle">
                        {item.company}
                        {item.website && (
                          <a
                            href={ensureHttps(item.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1.5 inline-flex items-center gap-0.5 font-normal text-[var(--resume-accent)] text-xs hover:underline"
                          >
                            <IconWorld className="inline h-3 w-3" />
                            {formatProfileText(item.website, "Website")}
                          </a>
                        )}
                        {item.location ? ` · ${item.location}` : ""}
                      </span>
                    </div>
                    <span className="resume-entry-date">
                      {item.startDate}
                      {item.endDate ? ` – ${item.endDate}` : " – Present"}
                    </span>
                  </div>
                  {item.summary && (
                    <div
                      className="resume-text mb-2"
                      dangerouslySetInnerHTML={{ __html: item.summary }}
                    />
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="resume-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={`${item.id}-h-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Projects */}
          {sectionVisibility?.projects && (projects || []).length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">Projects</h2>
              {(projects || []).map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="resume-entry-title">
                        {item.url ? (
                          <a
                            href={ensureHttps(item.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[var(--resume-primary)] hover:underline"
                          >
                            {item.name}
                          </a>
                        ) : (
                          item.name
                        )}
                      </h3>
                      {item.githubUrl && (
                        <a
                          href={ensureHttps(item.githubUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--resume-text)] opacity-70 transition-opacity hover:text-[var(--resume-accent)] hover:opacity-100"
                          title="View GitHub Repository"
                        >
                          <IconBrandGithub className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <span className="resume-entry-date">
                      {item.startDate}
                      {item.endDate ? ` – ${item.endDate}` : ""}
                    </span>
                  </div>
                  {item.description && (
                    <p className="resume-text">{item.description}</p>
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="resume-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={`${item.id}-h-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                  {item.keywords && (item.keywords || []).length > 0 && (
                    <div className="ts-tech-tags mt-2">
                      {(item.keywords || []).map((kw, i) => (
                        <span key={`${item.id}-kw-${i}`} className="ts-tag">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Volunteer */}
          {sectionVisibility?.volunteer && (volunteer || []).length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">Volunteer</h2>
              {(volunteer || []).map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <div>
                      <h3 className="resume-entry-title">{item.position}</h3>
                      <p className="resume-entry-subtitle">
                        {item.url ? (
                          <a
                            href={ensureHttps(item.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 font-normal text-[var(--resume-accent)] hover:underline"
                          >
                            {item.organization}
                            <IconWorld className="h-2.5 w-2.5" />
                          </a>
                        ) : (
                          item.organization
                        )}
                      </p>
                    </div>
                    <span className="resume-entry-date">
                      {item.startDate}
                      {item.endDate ? ` – ${item.endDate}` : " – Present"}
                    </span>
                  </div>
                  {item.summary && (
                    <p className="resume-text">{item.summary}</p>
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="resume-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={`vol-${item.id}-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Custom Sections */}
          {(customSections || []).map((section) => (
            <section key={section.id} className="resume-section">
              <h2 className="resume-section-title">{section.sectionName}</h2>
              {(section.items || []).map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <div>
                      <h3 className="resume-entry-title">{item.title}</h3>
                      {item.subtitle && (
                        <span className="resume-entry-subtitle">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                    {item.date && (
                      <span className="resume-entry-date">{item.date}</span>
                    )}
                  </div>
                  {item.description && (
                    <div
                      className="resume-text mb-2"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="resume-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={`${item.id}-h-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          ))}
        </div>

        {/* Sidebar (right) */}
        <aside className="ts-sidebar">
          {basics.picture && (
            <div className="ts-picture-container mb-5 flex justify-center">
              {/* biome-ignore lint/performance/noImgElement: standard image tag is preferred for printable PDF templates */}
              <img
                src={basics.picture}
                alt={basics.name || "Profile Picture"}
                className="h-24 w-24 rounded-full border-2 border-[var(--resume-primary)] object-cover shadow-sm"
              />
            </div>
          )}

          {/* Skills */}
          {sectionVisibility?.skills && (skills || []).length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">Skills</h2>
              {(skills || []).map((group) => (
                <div key={group.id} className="ts-skill-block">
                  <h4 className="ts-skill-category">
                    <span>{group.name}</span>
                    {group.level ? (
                      <span className="ts-skill-level">{group.level}</span>
                    ) : null}
                  </h4>
                  <div className="ts-skill-tags">
                    {(group.keywords || []).map((kw, i) => (
                      <span key={`${group.id}-${kw}-${i}`} className="ts-tag">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {sectionVisibility?.education && (education || []).length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">Education</h2>
              {(education || []).map((item) => (
                <div key={item.id} className="ts-edu-block">
                  <h4 className="ts-edu-title flex flex-wrap items-center gap-1.5">
                    <span>{item.institution}</span>
                    {item.url && (
                      <a
                        href={ensureHttps(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 font-normal text-[10px] text-[var(--resume-accent)] hover:underline"
                      >
                        <IconWorld className="h-2.5 w-2.5" />
                        Link
                      </a>
                    )}
                  </h4>
                  <p className="ts-edu-degree">
                    {item.studyType}
                    {item.area ? ` in ${item.area}` : ""}
                  </p>
                  {item.score && (
                    <p className="mt-0.5 font-medium text-[10px] text-[var(--resume-text)]">
                      GPA: {item.score}
                    </p>
                  )}
                  <p className="ts-edu-date">
                    {item.startDate}
                    {item.endDate ? ` – ${item.endDate}` : " – Present"}
                  </p>
                  {item.courses && item.courses.length > 0 && (
                    <p className="mt-1 text-[10px] text-[var(--resume-text)] leading-normal opacity-75">
                      <span className="font-semibold">Courses:</span>{" "}
                      {item.courses.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {sectionVisibility?.certifications &&
            (certifications || []).length > 0 && (
              <section className="resume-section">
                <h2 className="ts-sidebar-title">Certifications</h2>
                {(certifications || []).map((item) => (
                  <div key={item.id} className="ts-cert-block">
                    <h4 className="ts-edu-title flex flex-wrap items-center gap-1">
                      {item.url ? (
                        <a
                          href={ensureHttps(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--resume-primary)] hover:underline"
                        >
                          {item.name}
                        </a>
                      ) : (
                        item.name
                      )}
                      {item.url && (
                        <IconWorld className="h-2.5 w-2.5 flex-shrink-0 text-[var(--resume-accent)]" />
                      )}
                    </h4>
                    <p className="ts-edu-degree">{item.issuer}</p>
                    {item.date && <p className="ts-edu-date">{item.date}</p>}
                  </div>
                ))}
              </section>
            )}

          {/* Languages */}
          {sectionVisibility?.languages && (languages || []).length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">Languages</h2>
              {(languages || []).map((item) => (
                <div key={item.id} className="ts-lang-item">
                  <span className="ts-lang-name">{item.language}</span>
                  <span className="ts-lang-level">{item.fluency}</span>
                </div>
              ))}
            </section>
          )}

          {/* Awards */}
          {sectionVisibility?.awards && (awards || []).length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">Awards</h2>
              {(awards || []).map((item) => (
                <div key={item.id} className="ts-cert-block">
                  <h4 className="ts-edu-title">{item.title}</h4>
                  <p className="ts-edu-degree">{item.awarder}</p>
                  {item.date && <p className="ts-edu-date">{item.date}</p>}
                  {item.summary && (
                    <p className="mt-1 text-[10px] text-[var(--resume-text)] leading-snug opacity-85">
                      {item.summary}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Publications */}
          {sectionVisibility?.publications &&
            (publications || []).length > 0 && (
              <section className="resume-section">
                <h2 className="ts-sidebar-title">Publications</h2>
                {(publications || []).map((item) => (
                  <div key={item.id} className="ts-cert-block">
                    <h4 className="ts-edu-title">
                      {item.url ? (
                        <a
                          href={ensureHttps(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-1 text-[var(--resume-primary)] hover:underline"
                        >
                          <span>{item.name}</span>
                          <IconWorld className="h-2.5 w-2.5 flex-shrink-0 text-[var(--resume-accent)]" />
                        </a>
                      ) : (
                        item.name
                      )}
                    </h4>
                    <p className="ts-edu-degree">{item.publisher}</p>
                    {item.releaseDate && (
                      <p className="ts-edu-date">{item.releaseDate}</p>
                    )}
                    {item.summary && (
                      <p className="mt-1 text-[10px] text-[var(--resume-text)] leading-snug opacity-85">
                        {item.summary}
                      </p>
                    )}
                  </div>
                ))}
              </section>
            )}

          {/* References */}
          {sectionVisibility?.references && (references || []).length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">References</h2>
              {(references || []).map((item) => (
                <div key={item.id} className="ts-cert-block">
                  <h4 className="ts-edu-title">{item.name}</h4>
                  {item.reference && (
                    <p className="ts-edu-degree">{item.reference}</p>
                  )}
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
