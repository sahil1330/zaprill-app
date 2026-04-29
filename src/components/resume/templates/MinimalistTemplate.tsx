"use client";

import type { ResumeData, ResumeMetadata } from "@/types/resume";

/**
 * MinimalistTemplate — Clean single-column layout
 * ATS Score: 95 (highly parseable, no multi-column tricks)
 */
export default function MinimalistTemplate({
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
  const { theme, typography, sectionOrder, sectionVisibility, page } = metadata;

  const fontFamily = typography.font.family;
  const fontSize = `${typography.font.size}pt`;
  const lineHeight = typography.lineHeight;

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      sectionVisibility.summary && basics.summary ? (
        <section key="summary" className="resume-section">
          <h2 className="resume-section-title">Professional Summary</h2>
          <div
            className="resume-text"
            dangerouslySetInnerHTML={{ __html: basics.summary }}
          />
        </section>
      ) : null,

    work: () =>
      sectionVisibility.work && work.length > 0 ? (
        <section key="work" className="resume-section">
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
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ) : null,

    education: () =>
      sectionVisibility.education && education.length > 0 ? (
        <section key="education" className="resume-section">
          <h2 className="resume-section-title">Education</h2>
          {education.map((item) => (
            <div key={item.id} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <h3 className="resume-entry-title">{item.institution}</h3>
                  <span className="resume-entry-subtitle">
                    {item.studyType}
                    {item.area ? ` in ${item.area}` : ""}
                    {item.score ? ` — ${item.score}` : ""}
                  </span>
                </div>
                <span className="resume-entry-date">
                  {item.startDate}
                  {item.endDate ? ` – ${item.endDate}` : " – Present"}
                </span>
              </div>
            </div>
          ))}
        </section>
      ) : null,

    skills: () =>
      sectionVisibility.skills && skills.length > 0 ? (
        <section key="skills" className="resume-section">
          <h2 className="resume-section-title">Skills</h2>
          <div className="resume-skills-grid">
            {skills.map((group) => (
              <div key={group.id} className="resume-skill-group">
                <span className="resume-skill-label">{group.name}:</span>
                <span className="resume-skill-keywords">
                  {group.keywords.join(", ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    projects: () =>
      sectionVisibility.projects && projects.length > 0 ? (
        <section key="projects" className="resume-section">
          <h2 className="resume-section-title">Projects</h2>
          {projects.map((item) => (
            <div key={item.id} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <h3 className="resume-entry-title">{item.name}</h3>
                  {item.url && (
                    <span className="resume-entry-subtitle">{item.url}</span>
                  )}
                </div>
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
              {item.highlights.length > 0 && (
                <ul className="resume-bullets">
                  {item.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ) : null,

    certifications: () =>
      sectionVisibility.certifications && certifications.length > 0 ? (
        <section key="certifications" className="resume-section">
          <h2 className="resume-section-title">Certifications</h2>
          {certifications.map((item) => (
            <div key={item.id} className="resume-entry-inline">
              <span className="resume-entry-title">{item.name}</span>
              <span className="resume-entry-subtitle">
                {item.issuer}
                {item.date ? ` · ${item.date}` : ""}
              </span>
            </div>
          ))}
        </section>
      ) : null,

    languages: () =>
      sectionVisibility.languages && languages.length > 0 ? (
        <section key="languages" className="resume-section">
          <h2 className="resume-section-title">Languages</h2>
          <div className="resume-languages">
            {languages.map((item) => (
              <span key={item.id} className="resume-language-item">
                {item.language}
                {item.fluency ? ` (${item.fluency})` : ""}
              </span>
            ))}
          </div>
        </section>
      ) : null,
  };

  return (
    <div
      className="resume-page minimalist-template"
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
      {/* Header */}
      <header className="resume-header-minimalist">
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
              {p.network}: {p.url || p.username}
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
