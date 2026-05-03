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
 * ModernSplitTemplate — Bold header with sidebar layout.
 * Skills and education on the left, experience on the right.
 * Designed for consulting, strategy, and business roles.
 * ATS Score: 88%
 * Premium — Pro tier only.
 */
export default function ModernSplitTemplate({
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
  const { theme, typography, sectionVisibility, page } = metadata;

  const fontFamily = typography.font.family;
  const fontSize = `${typography.font.size}pt`;
  const lineHeight = typography.lineHeight;

  return (
    <div
      className="resume-page modern-split-template"
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
      {/* Bold Split Header */}
      <header className="modern-split-header">
        <div className="modern-split-header-left">
          <h1 className="modern-split-name">{basics.name || "Your Name"}</h1>
          {basics.label && <p className="modern-split-label">{basics.label}</p>}
        </div>
        <div className="modern-split-header-right">
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
      </header>

      {/* Two-column body */}
      <div className="modern-split-body">
        {/* Left sidebar */}
        <aside className="modern-split-sidebar">
          {/* Skills */}
          {sectionVisibility.skills && skills?.length > 0 && (
            <section className="resume-section">
              <h2 className="modern-split-section-title">Expertise</h2>
              {skills.map((group) => (
                <div key={group.id} className="modern-split-skill-group">
                  <h4 className="modern-split-skill-label">{group.name}</h4>
                  <div className="modern-split-skill-list">
                    {group.keywords.map((kw) => (
                      <span key={kw} className="modern-split-skill-item">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {sectionVisibility.education && education?.length > 0 && (
            <section className="resume-section">
              <h2 className="modern-split-section-title">Education</h2>
              {education.map((item) => (
                <div key={item.id} className="modern-split-edu-item">
                  <h3 className="resume-entry-title">
                    {item.studyType} in {item.area}
                  </h3>
                  <p className="modern-split-institution">{item.institution}</p>
                  {item.startDate && (
                    <p className="modern-split-date">
                      {item.startDate}
                      {item.endDate ? ` – ${item.endDate}` : ""}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Languages */}
          {sectionVisibility.languages && languages?.length > 0 && (
            <section className="resume-section">
              <h2 className="modern-split-section-title">Languages</h2>
              {languages.map((lang) => (
                <div key={lang.id} className="modern-split-lang-item">
                  <span className="font-medium">{lang.language}</span>
                  {lang.fluency && (
                    <span className="modern-split-fluency">{lang.fluency}</span>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {sectionVisibility.certifications && certifications?.length > 0 && (
            <section className="resume-section">
              <h2 className="modern-split-section-title">Certifications</h2>
              {certifications.map((item) => (
                <div key={item.id} className="modern-split-cert-item">
                  <h3 className="resume-entry-title">{item.name}</h3>
                  <p className="modern-split-institution">
                    {item.issuer}
                    {item.date ? ` · ${item.date}` : ""}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* Awards */}
          {sectionVisibility.awards && awards?.length > 0 && (
            <section className="resume-section">
              <h2 className="modern-split-section-title">Awards</h2>
              {awards.map((item) => (
                <div key={item.id} className="modern-split-cert-item">
                  <h3 className="resume-entry-title">{item.title}</h3>
                  <p className="modern-split-institution">
                    {item.awarder}
                    {item.date ? ` · ${item.date}` : ""}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* Publications */}
          {sectionVisibility.publications && publications?.length > 0 && (
            <section className="resume-section">
              <h2 className="modern-split-section-title">Publications</h2>
              {publications.map((item) => (
                <div key={item.id} className="modern-split-cert-item">
                  <h3 className="resume-entry-title">{item.name}</h3>
                  <p className="modern-split-institution">
                    {item.publisher}
                    {item.releaseDate ? ` · ${item.releaseDate}` : ""}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* References */}
          {sectionVisibility.references && references?.length > 0 && (
            <section className="resume-section">
              <h2 className="modern-split-section-title">References</h2>
              {references.map((item) => (
                <div key={item.id} className="modern-split-cert-item">
                  <h3 className="resume-entry-title">{item.name}</h3>
                  {item.reference && (
                    <p className="modern-split-institution">{item.reference}</p>
                  )}
                </div>
              ))}
            </section>
          )}
        </aside>

        {/* Right main content */}
        <main className="modern-split-main">
          {/* Summary */}
          {sectionVisibility.summary && basics.summary && (
            <section className="resume-section">
              <h2 className="modern-split-section-title">Profile</h2>
              <div
                className="resume-text"
                dangerouslySetInnerHTML={{ __html: basics.summary }}
              />
            </section>
          )}

          {/* Work Experience */}
          {sectionVisibility.work && work?.length > 0 && (
            <section className="resume-section">
              <h2 className="modern-split-section-title">Experience</h2>
              {work.map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <div>
                      <h3 className="resume-entry-title">{item.position}</h3>
                      <p className="modern-split-company">
                        {item.company}
                        {item.location ? ` · ${item.location}` : ""}
                      </p>
                    </div>
                    {item.startDate && (
                      <span className="modern-split-date">
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
          )}

          {/* Projects */}
          {sectionVisibility.projects && projects?.length > 0 && (
            <section className="resume-section">
              <h2 className="modern-split-section-title">Key Projects</h2>
              {projects.map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <h3 className="resume-entry-title">{item.name}</h3>
                    {item.startDate && (
                      <span className="modern-split-date">
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
                        <li key={`proj-${item.id}-${i}`}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Volunteer */}
          {sectionVisibility.volunteer && volunteer?.length > 0 && (
            <section className="resume-section">
              <h2 className="modern-split-section-title">Volunteer</h2>
              {volunteer.map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <div>
                      <h3 className="resume-entry-title">{item.position}</h3>
                      <p className="modern-split-company">
                        {item.organization}
                      </p>
                    </div>
                    {item.startDate && (
                      <span className="modern-split-date">
                        {item.startDate}
                        {item.endDate ? ` – ${item.endDate}` : " – Present"}
                      </span>
                    )}
                  </div>
                  {item.summary && (
                    <p className="resume-text">{item.summary}</p>
                  )}
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
          )}
        </main>
      </div>
    </div>
  );
}
