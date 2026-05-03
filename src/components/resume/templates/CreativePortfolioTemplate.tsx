"use client";

import type { ResumeData, ResumeMetadata } from "@/types/resume";
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
 * CreativePortfolioTemplate — Vibrant, two-column hybrid layout
 * with color accents and visual portfolio section.
 * Designed for designers, marketers, and content creators.
 * ATS Score: 82% (visual elements reduce parseability)
 * Premium — Pro tier only.
 */
export default function CreativePortfolioTemplate({
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
  const { theme, typography, sectionOrder, sectionVisibility, page } = metadata;

  const fontFamily = typography.font.family;
  const fontSize = `${typography.font.size}pt`;
  const lineHeight = typography.lineHeight;

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      sectionVisibility.summary && basics.summary ? (
        <section key="summary" className="resume-section">
          <h2 className="creative-section-title">About Me</h2>
          <div
            className="resume-text"
            dangerouslySetInnerHTML={{ __html: basics.summary }}
          />
        </section>
      ) : null,

    work: () =>
      sectionVisibility.work && work?.length > 0 ? (
        <section key="work" className="resume-section">
          <h2 className="creative-section-title">Experience</h2>
          {work.map((item) => (
            <div key={item.id} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <h3 className="resume-entry-title">{item.position}</h3>
                  <p className="creative-company">{item.company}</p>
                </div>
                {item.startDate && (
                  <span className="creative-date">
                    {item.startDate}
                    {item.endDate ? ` – ${item.endDate}` : " – Present"}
                  </span>
                )}
              </div>
              {item.highlights.length > 0 && (
                <ul className="resume-bullets">
                  {item.highlights.map((h, i) => (
                    <li key={`work-${item.id}-${i}`}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ) : null,

    education: () =>
      sectionVisibility.education && education?.length > 0 ? (
        <section key="education" className="resume-section">
          <h2 className="creative-section-title">Education</h2>
          {education.map((item) => (
            <div key={item.id} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <h3 className="resume-entry-title">
                    {item.studyType} in {item.area}
                  </h3>
                  <p className="creative-company">{item.institution}</p>
                </div>
                {item.startDate && (
                  <span className="creative-date">
                    {item.startDate}
                    {item.endDate ? ` – ${item.endDate}` : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>
      ) : null,

    skills: () =>
      sectionVisibility.skills && skills?.length > 0 ? (
        <section key="skills" className="resume-section">
          <h2 className="creative-section-title">Skills</h2>
          <div className="creative-skills-grid">
            {skills.map((group) => (
              <div key={group.id} className="creative-skill-group">
                <h4 className="creative-skill-label">{group.name}</h4>
                <div className="creative-skill-tags">
                  {group.keywords.map((kw) => (
                    <span key={kw} className="creative-tag">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    projects: () =>
      sectionVisibility.projects && projects?.length > 0 ? (
        <section key="projects" className="resume-section">
          <h2 className="creative-section-title">Portfolio</h2>
          <div className="creative-portfolio-grid">
            {projects.map((item) => (
              <div key={item.id} className="creative-portfolio-card">
                <h3 className="resume-entry-title">{item.name}</h3>
                {item.description && (
                  <p className="resume-text">{item.description}</p>
                )}
                {item.keywords.length > 0 && (
                  <div
                    className="creative-skill-tags"
                    style={{ marginTop: "6px" }}
                  >
                    {item.keywords.map((kw) => (
                      <span key={kw} className="creative-tag">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
                {item.highlights.length > 0 && (
                  <ul className="resume-bullets">
                    {item.highlights.map((h, i) => (
                      <li key={`proj-${item.id}-${i}`}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null,

    certifications: () =>
      sectionVisibility.certifications && certifications?.length > 0 ? (
        <section key="certifications" className="resume-section">
          <h2 className="creative-section-title">Certifications</h2>
          {certifications.map((item) => (
            <div key={item.id} className="resume-entry">
              <h3 className="resume-entry-title">{item.name}</h3>
              <p className="creative-company">
                {item.issuer}
                {item.date ? ` · ${item.date}` : ""}
              </p>
            </div>
          ))}
        </section>
      ) : null,

    languages: () =>
      sectionVisibility.languages && languages?.length > 0 ? (
        <section key="languages" className="resume-section">
          <h2 className="creative-section-title">Languages</h2>
          <div className="resume-languages-list">
            {languages.map((lang) => (
              <span key={lang.id} className="resume-language-item">
                {lang.language}
                {lang.fluency ? ` (${lang.fluency})` : ""}
              </span>
            ))}
          </div>
        </section>
      ) : null,

    volunteer: () =>
      sectionVisibility.volunteer && volunteer?.length > 0 ? (
        <section key="volunteer" className="resume-section">
          <h2 className="creative-section-title">Volunteer</h2>
          {volunteer.map((item) => (
            <div key={item.id} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <h3 className="resume-entry-title">{item.position}</h3>
                  <p className="creative-company">{item.organization}</p>
                </div>
                {item.startDate && (
                  <span className="creative-date">
                    {item.startDate}
                    {item.endDate ? ` – ${item.endDate}` : " – Present"}
                  </span>
                )}
              </div>
              {item.summary && <p className="resume-text">{item.summary}</p>}
              {item.highlights.length > 0 && (
                <ul className="resume-bullets">
                  {item.highlights.map((h, i) => (
                    <li key={`vol-${item.id}-${i}`}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ) : null,

    awards: () =>
      sectionVisibility.awards && awards?.length > 0 ? (
        <section key="awards" className="resume-section">
          <h2 className="creative-section-title">Awards</h2>
          {awards.map((item) => (
            <div key={item.id} className="resume-entry">
              <h3 className="resume-entry-title">{item.title}</h3>
              <p className="creative-company">
                {item.awarder}
                {item.date ? ` · ${item.date}` : ""}
              </p>
              {item.summary && <p className="resume-text">{item.summary}</p>}
            </div>
          ))}
        </section>
      ) : null,

    publications: () =>
      sectionVisibility.publications && publications?.length > 0 ? (
        <section key="publications" className="resume-section">
          <h2 className="creative-section-title">Publications</h2>
          {publications.map((item) => (
            <div key={item.id} className="resume-entry">
              <h3 className="resume-entry-title">{item.name}</h3>
              <p className="creative-company">
                {item.publisher}
                {item.releaseDate ? ` · ${item.releaseDate}` : ""}
              </p>
              {item.summary && <p className="resume-text">{item.summary}</p>}
            </div>
          ))}
        </section>
      ) : null,

    references: () =>
      sectionVisibility.references && references?.length > 0 ? (
        <section key="references" className="resume-section">
          <h2 className="creative-section-title">References</h2>
          {references.map((item) => (
            <div key={item.id} className="resume-entry">
              <h3 className="resume-entry-title">{item.name}</h3>
              {item.reference && (
                <p className="resume-text">{item.reference}</p>
              )}
            </div>
          ))}
        </section>
      ) : null,
  };

  return (
    <div
      className="resume-page creative-template"
      style={
        {
          "--resume-primary": theme.primary,
          "--resume-accent": theme.accent,
          "--resume-bg": theme.background,
          "--resume-text": theme.text,
          "--resume-padding": `${page?.margin ?? 20}mm`,
          fontFamily,
          fontSize,
          lineHeight,
        } as React.CSSProperties
      }
    >
      {/* Creative Header with gradient accent */}
      <header className="creative-header">
        <div className="creative-header-accent" />
        <div className="creative-header-content">
          <h1 className="creative-name">{basics.name || "Your Name"}</h1>
          {basics.label && <p className="creative-label">{basics.label}</p>}
          <div className="creative-contact-row">
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
                basics.location.city
                  ? `${basics.location.city}${basics.location.region ? `, ${basics.location.region}` : ""}`
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
        </div>
      </header>

      {/* Render sections in order */}
      {(sectionOrder || []).map((key) => {
        const renderer = sectionRenderers[key];
        return renderer ? <div key={key}>{renderer()}</div> : null;
      })}
    </div>
  );
}
