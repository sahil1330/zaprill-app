"use client";

import type React from "react";
import type { ResumeData, ResumeMetadata } from "@/types/resume";

/**
 * ExecutiveProTemplate — Refined single-column with serif accents.
 * Perfect for senior leadership, consulting, and executive roles.
 * ATS Score: 92 (highly parseable single-column)
 */
export default function ExecutiveProTemplate({
  data,
  metadata,
}: {
  data: ResumeData;
  metadata: ResumeMetadata;
}) {
  const {
    basics,
    work,
    education,
    skills,
    projects,
    certifications,
    languages,
    volunteer,
    awards,
    publications,
    references,
  } = data;
  const { theme, typography, sectionVisibility, sectionOrder, page } = metadata;

  const fontFamily = typography.font.family;
  const fontSize = `${typography.font.size}pt`;
  const lineHeight = typography.lineHeight;

  // Section renderers keyed by section name
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      sectionVisibility.summary && basics.summary ? (
        <section key="summary" className="exec-section">
          <h2 className="exec-section-title">Executive Summary</h2>
          <div
            className="exec-summary-text resume-text"
            dangerouslySetInnerHTML={{ __html: basics.summary }}
          />
        </section>
      ) : null,

    work: () =>
      sectionVisibility.work && work.length > 0 ? (
        <section key="work" className="exec-section">
          <h2 className="exec-section-title">Professional Experience</h2>
          {work.map((item) => (
            <div key={item.id} className="exec-entry">
              <div className="exec-entry-top">
                <div>
                  <h3 className="exec-entry-role">{item.position}</h3>
                  <p className="exec-entry-company">
                    {item.company}
                    {item.location ? ` — ${item.location}` : ""}
                  </p>
                </div>
                <span className="exec-entry-dates">
                  {item.startDate}
                  {item.endDate ? ` – ${item.endDate}` : " – Present"}
                </span>
              </div>
              {item.highlights.length > 0 && (
                <ul className="exec-bullets">
                  {item.highlights.map((h, i) => (
                    <li key={`${item.id}-h-${i}`}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ) : null,

    projects: () =>
      sectionVisibility.projects && projects.length > 0 ? (
        <section key="projects" className="exec-section">
          <h2 className="exec-section-title">Key Initiatives</h2>
          {projects.map((item) => (
            <div key={item.id} className="exec-entry">
              <div className="exec-entry-top">
                <h3 className="exec-entry-role">{item.name}</h3>
                {item.startDate && (
                  <span className="exec-entry-dates">
                    {item.startDate}
                    {item.endDate ? ` – ${item.endDate}` : ""}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="exec-text">{item.description}</p>
              )}
              {item.highlights.length > 0 && (
                <ul className="exec-bullets">
                  {item.highlights.map((h, i) => (
                    <li key={`${item.id}-h-${i}`}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ) : null,

    education: () =>
      sectionVisibility.education && education.length > 0 ? (
        <section key="education" className="exec-section">
          <h2 className="exec-section-title">Education</h2>
          {education.map((item) => (
            <div key={item.id} className="exec-edu-row">
              <div>
                <span className="exec-edu-degree">
                  {item.studyType}
                  {item.area ? ` in ${item.area}` : ""}
                </span>
                <span className="exec-edu-sep"> — </span>
                <span className="exec-edu-school">{item.institution}</span>
              </div>
              <span className="exec-entry-dates">
                {item.startDate}
                {item.endDate ? ` – ${item.endDate}` : " – Present"}
              </span>
            </div>
          ))}
        </section>
      ) : null,

    skills: () =>
      sectionVisibility.skills && skills.length > 0 ? (
        <section key="skills" className="exec-section">
          <h2 className="exec-section-title">Core Competencies</h2>
          <div className="exec-competencies">
            {skills.map((group) => (
              <div key={group.id} className="exec-comp-group">
                <span className="exec-comp-label">{group.name}: </span>
                <span className="exec-comp-values">
                  {group.keywords.join(" · ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    certifications: () =>
      sectionVisibility.certifications && certifications.length > 0 ? (
        <section key="certifications" className="exec-section">
          <h2 className="exec-section-title">Certifications</h2>
          {certifications.map((item) => (
            <div key={item.id} className="exec-edu-row">
              <span className="exec-edu-degree">{item.name}</span>
              <span className="exec-entry-dates">
                {item.issuer}
                {item.date ? ` · ${item.date}` : ""}
              </span>
            </div>
          ))}
        </section>
      ) : null,

    languages: () =>
      sectionVisibility.languages && languages.length > 0 ? (
        <section key="languages" className="exec-section">
          <h2 className="exec-section-title">Languages</h2>
          <div className="exec-lang-row">
            {languages.map((item) => (
              <span key={item.id} className="exec-lang-item">
                {item.language} ({item.fluency})
              </span>
            ))}
          </div>
        </section>
      ) : null,

    volunteer: () =>
      sectionVisibility.volunteer && volunteer.length > 0 ? (
        <section key="volunteer" className="exec-section">
          <h2 className="exec-section-title">Volunteer Experience</h2>
          {volunteer.map((item) => (
            <div key={item.id} className="exec-entry">
              <div className="exec-entry-top">
                <div>
                  <h3 className="exec-entry-role">{item.position}</h3>
                  <p className="exec-entry-company">{item.organization}</p>
                </div>
                <span className="exec-entry-dates">
                  {item.startDate}
                  {item.endDate ? ` – ${item.endDate}` : " – Present"}
                </span>
              </div>
              {item.summary && <p className="exec-text">{item.summary}</p>}
              {item.highlights.length > 0 && (
                <ul className="exec-bullets">
                  {item.highlights.map((h, i) => (
                    <li key={`${item.id}-h-${i}`}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ) : null,

    awards: () =>
      sectionVisibility.awards && awards.length > 0 ? (
        <section key="awards" className="exec-section">
          <h2 className="exec-section-title">Awards & Honors</h2>
          {awards.map((item) => (
            <div key={item.id} className="exec-edu-row">
              <span className="exec-edu-degree">{item.title}</span>
              <span className="exec-entry-dates">
                {item.awarder}
                {item.date ? ` · ${item.date}` : ""}
              </span>
            </div>
          ))}
        </section>
      ) : null,

    publications: () =>
      sectionVisibility.publications && publications.length > 0 ? (
        <section key="publications" className="exec-section">
          <h2 className="exec-section-title">Publications</h2>
          {publications.map((item) => (
            <div key={item.id} className="exec-edu-row">
              <span className="exec-edu-degree">{item.name}</span>
              <span className="exec-entry-dates">
                {item.publisher}
                {item.releaseDate ? ` · ${item.releaseDate}` : ""}
              </span>
            </div>
          ))}
        </section>
      ) : null,

    references: () =>
      sectionVisibility.references && references.length > 0 ? (
        <section key="references" className="exec-section">
          <h2 className="exec-section-title">References</h2>
          {references.map((item) => (
            <div key={item.id} className="exec-entry">
              <h3 className="exec-entry-role">{item.name}</h3>
              {item.reference && <p className="exec-text">{item.reference}</p>}
            </div>
          ))}
        </section>
      ) : null,
  };

  return (
    <div
      className="resume-page exec-template"
      style={{
        fontFamily,
        fontSize,
        lineHeight,
        ["--resume-padding" as string]: `${page.margin}mm`,
        ["--resume-primary" as string]: theme.primary,
        ["--resume-bg" as string]: theme.background,
        ["--resume-text" as string]: theme.text,
        ["--resume-accent" as string]: theme.accent,
      }}
    >
      {/* Executive Header — left-aligned, bold, minimal */}
      <header className="exec-header">
        <h1 className="exec-name">{basics.name || "Your Name"}</h1>
        {basics.label && <p className="exec-title">{basics.label}</p>}
        <div className="exec-contact">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location.city && (
            <span>
              {basics.location.city}
              {basics.location.region ? `, ${basics.location.region}` : ""}
            </span>
          )}
          {basics.url && <span>{basics.url}</span>}
          {basics.profiles.map((p) => (
            <span key={p.network}>
              {p.url || `${p.network}: ${p.username}`}
            </span>
          ))}
        </div>
      </header>

      {/* Sections in user-defined order */}
      {sectionOrder.map((key) => {
        const renderer = sectionRenderers[key];
        return renderer ? renderer() : null;
      })}
    </div>
  );
}
