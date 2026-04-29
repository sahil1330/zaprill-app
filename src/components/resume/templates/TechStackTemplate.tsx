"use client";

import type { ResumeData, ResumeMetadata } from "@/types/resume";

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
  const {
    basics,
    work,
    education,
    skills,
    projects,
    certifications,
    languages,
  } = data;
  const { theme, typography, sectionVisibility, page } = metadata;

  const fontFamily = typography.font.family;
  const fontSize = `${typography.font.size}pt`;
  const lineHeight = typography.lineHeight;

  return (
    <div
      className="resume-page tech-stack-template"
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
      {/* Header — full width */}
      <header className="ts-header">
        <h1 className="resume-name">{basics.name || "Your Name"}</h1>
        {basics.label && <p className="resume-label">{basics.label}</p>}
        <div className="resume-contact">
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

      {/* Two-column layout */}
      <div className="ts-columns">
        {/* Main column (left) */}
        <div className="ts-main">
          {/* Summary */}
          {sectionVisibility.summary && basics.summary && (
            <section className="resume-section">
              <h2 className="resume-section-title">Summary</h2>
              <p className="resume-text">{basics.summary}</p>
            </section>
          )}

          {/* Experience */}
          {sectionVisibility.work && work.length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">Experience</h2>
              {work.map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <div>
                      <h3 className="resume-entry-title">{item.position}</h3>
                      <span className="resume-entry-subtitle">
                        {item.company}
                        {item.location ? ` · ${item.location}` : ""}
                      </span>
                    </div>
                    <span className="resume-entry-date">
                      {item.startDate}
                      {item.endDate ? ` – ${item.endDate}` : " – Present"}
                    </span>
                  </div>
                  {item.highlights.length > 0 && (
                    <ul className="resume-bullets">
                      {item.highlights.map((h, i) => (
                        <li key={`${item.id}-h-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Projects */}
          {sectionVisibility.projects && projects.length > 0 && (
            <section className="resume-section">
              <h2 className="resume-section-title">Projects</h2>
              {projects.map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <h3 className="resume-entry-title">{item.name}</h3>
                    {item.startDate && (
                      <span className="resume-entry-date">
                        {item.startDate}
                        {item.endDate ? ` – ${item.endDate}` : ""}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="resume-text">{item.description}</p>
                  )}
                  {item.keywords.length > 0 && (
                    <div className="ts-tech-tags">
                      {item.keywords.map((kw) => (
                        <span key={kw} className="ts-tag">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Sidebar (right) */}
        <aside className="ts-sidebar">
          {/* Skills */}
          {sectionVisibility.skills && skills.length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">Skills</h2>
              {skills.map((group) => (
                <div key={group.id} className="ts-skill-block">
                  <h4 className="ts-skill-category">{group.name}</h4>
                  <div className="ts-skill-tags">
                    {group.keywords.map((kw) => (
                      <span key={kw} className="ts-tag">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {sectionVisibility.education && education.length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">Education</h2>
              {education.map((item) => (
                <div key={item.id} className="ts-edu-block">
                  <h4 className="ts-edu-title">{item.institution}</h4>
                  <p className="ts-edu-degree">
                    {item.studyType}
                    {item.area ? ` in ${item.area}` : ""}
                  </p>
                  <p className="ts-edu-date">
                    {item.startDate}
                    {item.endDate ? ` – ${item.endDate}` : " – Present"}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {sectionVisibility.certifications && certifications.length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">Certifications</h2>
              {certifications.map((item) => (
                <div key={item.id} className="ts-cert-block">
                  <h4 className="ts-edu-title">{item.name}</h4>
                  <p className="ts-edu-degree">{item.issuer}</p>
                  {item.date && <p className="ts-edu-date">{item.date}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Languages */}
          {sectionVisibility.languages && languages.length > 0 && (
            <section className="resume-section">
              <h2 className="ts-sidebar-title">Languages</h2>
              {languages.map((item) => (
                <div key={item.id} className="ts-lang-item">
                  <span className="ts-lang-name">{item.language}</span>
                  <span className="ts-lang-level">{item.fluency}</span>
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
