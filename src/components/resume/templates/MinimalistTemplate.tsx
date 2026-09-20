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
 * MinimalistTemplate — Clean, whitespace-focused design
 * ATS Score: 98 (extremely high parseability, simple linear structure)
 */
export default function MinimalistTemplate({
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
    sectionOrder,
    page = DEFAULT_RESUME_METADATA.page,
  } = m;

  const fontFamily = typography?.font?.family || "Inter";
  const fontSize = `${typography?.font?.size || 11}pt`;
  const lineHeight = typography?.lineHeight || 1.5;

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    summary: () =>
      sectionVisibility?.summary && basics?.summary ? (
        <section key="summary" className="resume-section">
          <h2 className="resume-section-title">Professional Summary</h2>
          <div
            className="resume-text"
            dangerouslySetInnerHTML={{ __html: basics.summary }}
          />
        </section>
      ) : null,

    work: () =>
      sectionVisibility?.work && (work || []).length > 0 ? (
        <section key="work" className="resume-section">
          <h2 className="resume-section-title">Experience</h2>
          {(work || []).map((item) => (
            <div key={item.id} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <h3 className="resume-entry-title">{item.position}</h3>
                  <span className="resume-entry-subtitle flex flex-wrap items-center gap-1.5">
                    <span>{item.company}</span>
                    {item.location && <span>· {item.location}</span>}
                    {item.website && (
                      <a
                        href={ensureHttps(item.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                      >
                        <IconWorld className="h-3 w-3" />
                        <span className="opacity-75">
                          {formatProfileText(item.website, "Website")}
                        </span>
                      </a>
                    )}
                  </span>
                </div>
                <span className="resume-entry-date">
                  {item.startDate}
                  {item.endDate ? ` – ${item.endDate}` : " – Present"}
                </span>
              </div>
              {item.summary && (
                <div
                  className="resume-text mb-1.5"
                  dangerouslySetInnerHTML={{ __html: item.summary }}
                />
              )}
              {item.highlights && (item.highlights || []).length > 0 && (
                <ul className="resume-bullets">
                  {(item.highlights || []).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ) : null,

    education: () =>
      sectionVisibility?.education && (education || []).length > 0 ? (
        <section key="education" className="resume-section">
          <h2 className="resume-section-title">Education</h2>
          {(education || []).map((item) => (
            <div key={item.id} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <h3 className="resume-entry-title flex flex-wrap items-center gap-1.5">
                    <span>{item.institution}</span>
                    {item.url && (
                      <a
                        href={ensureHttps(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-normal text-[10px] text-primary hover:underline"
                      >
                        <IconWorld className="h-3 w-3" />
                        <span className="opacity-75">
                          {formatProfileText(item.url, "Website")}
                        </span>
                      </a>
                    )}
                  </h3>
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
              {item.courses && item.courses.length > 0 && (
                <p className="resume-text mt-1 text-[10px] opacity-80">
                  <span className="font-semibold">Courses: </span>
                  {item.courses.join(", ")}
                </p>
              )}
            </div>
          ))}
        </section>
      ) : null,

    skills: () =>
      sectionVisibility?.skills && (skills || []).length > 0 ? (
        <section key="skills" className="resume-section">
          <h2 className="resume-section-title">Skills</h2>
          <div className="resume-skills-grid">
            {(skills || []).map((group) => (
              <div key={group.id} className="resume-skill-group">
                <span className="resume-skill-label">
                  {group.name}
                  {group.level ? ` (${group.level})` : ""}:
                </span>{" "}
                <span className="resume-skill-keywords">
                  {(group.keywords || []).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    projects: () =>
      sectionVisibility?.projects && (projects || []).length > 0 ? (
        <section key="projects" className="resume-section">
          <h2 className="resume-section-title">Projects</h2>
          {(projects || []).map((item) => (
            <div key={item.id} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="resume-entry-title">{item.name}</h3>
                    {item.url && (
                      <a
                        href={ensureHttps(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resume-entry-subtitle flex items-center gap-0.5 text-primary text-xs hover:underline"
                      >
                        <IconWorld className="h-3 w-3" />
                        <span>
                          {formatProfileText(item.url, "View Project")}
                        </span>
                      </a>
                    )}
                    {item.githubUrl && (
                      <a
                        href={ensureHttps(item.githubUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resume-entry-subtitle flex items-center gap-0.5 text-primary text-xs hover:underline"
                      >
                        <IconBrandGithub className="h-3 w-3" />
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>
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
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
              {item.keywords && item.keywords.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {item.keywords.map((k, idx) => (
                    <span
                      key={idx}
                      className="rounded-sm bg-neutral-100 px-1.5 py-0.5 font-medium text-[9px] text-neutral-600 tracking-wide dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      ) : null,

    certifications: () =>
      sectionVisibility?.certifications && (certifications || []).length > 0 ? (
        <section key="certifications" className="resume-section">
          <h2 className="resume-section-title">Certifications</h2>
          {(certifications || []).map((item) => (
            <div key={item.id} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <h3 className="resume-entry-title">
                    {item.url ? (
                      <a
                        href={ensureHttps(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {item.name}
                      </a>
                    ) : (
                      item.name
                    )}
                  </h3>
                  <p className="resume-entry-subtitle">{item.issuer}</p>
                </div>
                <span className="resume-entry-date">{item.date}</span>
              </div>
            </div>
          ))}
        </section>
      ) : null,

    languages: () =>
      sectionVisibility?.languages && (languages || []).length > 0 ? (
        <section key="languages" className="resume-section">
          <h2 className="resume-section-title">Languages</h2>
          <div className="resume-languages-grid">
            {(languages || []).map((item) => (
              <div key={item.id} className="resume-language-item">
                <span className="resume-language-name">{item.language}</span>
                <span className="resume-language-fluency">{item.fluency}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null,

    volunteer: () =>
      sectionVisibility?.volunteer && (volunteer || []).length > 0 ? (
        <section key="volunteer" className="resume-section">
          <h2 className="resume-section-title">Volunteer Experience</h2>
          {(volunteer || []).map((item) => (
            <div key={item.id} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <h3 className="resume-entry-title">{item.position}</h3>
                  <p className="resume-entry-subtitle flex flex-wrap items-center gap-1.5">
                    <span>{item.organization}</span>
                    {item.url && (
                      <a
                        href={ensureHttps(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                      >
                        <IconWorld className="h-3 w-3" />
                        <span className="opacity-75">
                          {formatProfileText(item.url, "Website")}
                        </span>
                      </a>
                    )}
                  </p>
                </div>
                <span className="resume-entry-date">
                  {item.startDate}
                  {item.endDate ? ` – ${item.endDate}` : ""}
                </span>
              </div>
              {item.summary && <p className="resume-text">{item.summary}</p>}
              {item.highlights && (item.highlights || []).length > 0 && (
                <ul className="resume-bullets">
                  {(item.highlights || []).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ) : null,

    awards: () =>
      sectionVisibility?.awards && (awards || []).length > 0 ? (
        <section key="awards" className="resume-section">
          <h2 className="resume-section-title">Awards</h2>
          {(awards || []).map((item) => (
            <div key={item.id} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <h3 className="resume-entry-title">{item.title}</h3>
                  <p className="resume-entry-subtitle">{item.awarder}</p>
                </div>
                <span className="resume-entry-date">{item.date}</span>
              </div>
              {item.summary && <p className="resume-text">{item.summary}</p>}
            </div>
          ))}
        </section>
      ) : null,

    publications: () =>
      sectionVisibility?.publications && (publications || []).length > 0 ? (
        <section key="publications" className="resume-section">
          <h2 className="resume-section-title">Publications</h2>
          {(publications || []).map((item) => (
            <div key={item.id} className="resume-entry">
              <div className="resume-entry-header">
                <div>
                  <h3 className="resume-entry-title">{item.name}</h3>
                  <p className="resume-entry-subtitle flex flex-wrap items-center gap-1.5">
                    <span>{item.publisher}</span>
                    {item.url && (
                      <a
                        href={ensureHttps(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                      >
                        <IconWorld className="h-3 w-3" />
                        <span className="opacity-75">
                          {formatProfileText(item.url, "Website")}
                        </span>
                      </a>
                    )}
                  </p>
                </div>
                <span className="resume-entry-date">{item.releaseDate}</span>
              </div>
              {item.summary && <p className="resume-text">{item.summary}</p>}
            </div>
          ))}
        </section>
      ) : null,

    references: () =>
      sectionVisibility?.references && (references || []).length > 0 ? (
        <section key="references" className="resume-section">
          <h2 className="resume-section-title">References</h2>
          <div className="resume-references-grid">
            {(references || []).map((item) => (
              <div key={item.id} className="resume-reference-item">
                <h3 className="resume-entry-title">{item.name}</h3>
                <p className="resume-text font-serif italic">
                  &quot;{item.reference}&quot;
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null,
  };

  return (
    <div
      className="resume-page minimalist-template"
      data-page-format={page?.format ?? "a4"}
      style={{
        fontFamily,
        fontSize,
        lineHeight,
        ["--resume-padding" as string]: `${page?.margin ?? 20}mm`,
        ["--resume-primary" as string]: theme?.primary || "#000000",
        ["--resume-bg" as string]: theme?.background || "#ffffff",
        ["--resume-text" as string]: theme?.text || "#333333",
        ["--resume-accent" as string]: theme?.accent || "#666666",
      }}
    >
      <header className="resume-header-minimalist">
        {basics.picture ? (
          <div className="mb-2 flex items-center justify-center gap-4">
            <img
              src={basics.picture}
              alt={basics.name || "Profile Picture"}
              className="h-12 w-12 shrink-0 rounded-full border border-neutral-200 object-cover shadow-sm dark:border-neutral-700"
            />
            <div className="text-left">
              <h1 className="resume-name leading-tight">
                {basics.name || "Your Name"}
              </h1>
              {basics.label && (
                <p className="resume-label mt-1">{basics.label}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <h1 className="resume-name">{basics.name || "Your Name"}</h1>
            {basics.label && <p className="resume-label">{basics.label}</p>}
          </>
        )}

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

      <main>
        {(sectionOrder || Object.keys(sectionRenderers)).map((key) =>
          sectionRenderers[key]?.(),
        )}

        {/* Render Custom Sections at the bottom */}
        {(customSections || []).map((section) => {
          if (!section.items || section.items.length === 0) return null;
          return (
            <section key={section.id} className="resume-section">
              <h2 className="resume-section-title">{section.sectionName}</h2>
              {section.items.map((item) => (
                <div key={item.id} className="resume-entry">
                  <div className="resume-entry-header">
                    <div>
                      <h3 className="resume-entry-title">{item.title}</h3>
                      {item.subtitle && (
                        <p className="resume-entry-subtitle">{item.subtitle}</p>
                      )}
                    </div>
                    {item.date && (
                      <span className="resume-entry-date">{item.date}</span>
                    )}
                  </div>
                  {item.description && (
                    <div
                      className="resume-text mb-1.5"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                  {item.highlights && (item.highlights || []).length > 0 && (
                    <ul className="resume-bullets">
                      {(item.highlights || []).map((h, i) => (
                        <li key={i}>{h}</li>
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
  );
}
