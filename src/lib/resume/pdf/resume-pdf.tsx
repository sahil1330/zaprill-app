import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { clampedResumePage } from "@/lib/resume/print-page";
import { renderedLineHeight } from "@/lib/resume-knowledge/review";
import type {
  ResumeData,
  ResumeMetadata,
  ResumeSectionVisibility,
} from "@/types/resume";
import { htmlToPlain, safeHex } from "./text";

type Layout = "minimalist" | "executive" | "tech" | "split" | "creative";

const SECTION_LABELS: Record<string, string> = {
  summary: "Professional Summary",
  work: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  volunteer: "Volunteer",
  awards: "Awards",
  publications: "Publications",
  references: "References",
};

function layoutFor(slug: string): Layout {
  switch (slug) {
    case "executive-pro":
      return "executive";
    case "tech-stack":
      return "tech";
    case "modern-split":
      return "split";
    case "creative-portfolio":
      return "creative";
    default:
      return "minimalist";
  }
}

function dates(start?: string | null, end?: string | null): string {
  if (!start && !end) return "";
  if (!start) return end || "";
  return `${start} – ${end || "Present"}`;
}

function contactLine(data: ResumeData): string {
  const location = [data.basics.location?.city, data.basics.location?.region]
    .filter(Boolean)
    .join(", ");
  const profiles = (data.basics.profiles ?? [])
    .map((profile) => profile.network || profile.username)
    .filter(Boolean);
  return [
    data.basics.email,
    data.basics.phone,
    location,
    data.basics.url,
    ...profiles,
  ]
    .filter(Boolean)
    .join("  |  ");
}

function visible(
  visibility: ResumeSectionVisibility | undefined,
  key: string,
): boolean {
  if (!visibility) return true;
  if (key in visibility) {
    return visibility[key as keyof ResumeSectionVisibility] !== false;
  }
  return true;
}

export function ResumePdfDocument({
  title,
  templateSlug,
  data,
  metadata,
}: {
  title: string;
  templateSlug: string;
  data: ResumeData;
  metadata: ResumeMetadata;
}) {
  const page = clampedResumePage(metadata);
  const layout = layoutFor(templateSlug);
  const theme = {
    primary: safeHex(metadata.theme?.primary, "#1a1a2e"),
    background: safeHex(metadata.theme?.background, "#ffffff"),
    text: safeHex(metadata.theme?.text, "#333333"),
    accent: safeHex(metadata.theme?.accent, "#4a6cf7"),
  };
  const serif = layout === "executive";
  const font = serif ? "Times-Roman" : "Helvetica";
  const bold = serif ? "Times-Bold" : "Helvetica-Bold";
  const italic = serif ? "Times-Italic" : "Helvetica-Oblique";
  const size = Math.min(
    14,
    Math.max(10, Number(metadata.typography?.font?.size) || 11),
  );
  const lineHeight = renderedLineHeight(
    Number(metadata.typography?.lineHeight) || 1.3,
  );
  const margin = page.marginMm * 2.83465;
  const sidebarKeys =
    layout === "tech"
      ? ["skills", "languages", "certifications"]
      : layout === "split"
        ? ["skills", "languages"]
        : [];

  const styles = StyleSheet.create({
    page: {
      fontFamily: font,
      fontSize: size,
      lineHeight,
      color: theme.text,
      backgroundColor: theme.background,
      paddingTop: margin,
      paddingBottom: margin,
      paddingLeft: layout === "creative" ? margin + 6 : margin,
      paddingRight: margin,
    },
    name: {
      fontFamily: bold,
      fontSize: layout === "creative" ? size + 8 : size + 5,
      color: theme.primary,
    },
    label: { marginTop: 1, fontSize: size },
    contact: { marginTop: 2, fontSize: Math.max(10, size - 1) },
    header: {
      marginBottom: 8,
      paddingBottom: 3,
      alignItems: layout === "minimalist" ? "center" : "flex-start",
      borderBottomWidth:
        layout === "minimalist" || layout === "executive" ? 1 : 0,
      borderBottomColor: theme.primary,
    },
    section: { marginBottom: 6 },
    sectionTitle: {
      fontFamily: bold,
      fontSize: size,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: theme.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.primary,
      paddingBottom: 1,
      marginBottom: 3,
    },
    entry: { marginBottom: 4 },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
    },
    entryTitle: { fontFamily: bold, fontSize: size },
    muted: { fontSize: Math.max(10, size - 1), opacity: 0.85 },
    bullet: { marginLeft: 8, marginTop: 0 },
    lead: { fontSize: size + 1, marginBottom: 10 },
    card: {
      borderWidth: 1,
      borderColor: theme.accent,
      padding: 6,
      marginBottom: 6,
    },
    columns: { flexDirection: "row", gap: 14 },
    main: { flex: 1 },
    sidebar: {
      width: 150,
      paddingLeft: layout === "tech" ? 8 : 0,
      paddingRight: layout === "split" ? 8 : 0,
      borderLeftWidth: layout === "tech" ? 1.5 : 0,
      borderRightWidth: layout === "split" ? 1 : 0,
      borderColor: theme.primary,
    },
    rail: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 8,
      backgroundColor: theme.accent,
    },
  });

  const order =
    metadata.sectionOrder?.length > 0
      ? metadata.sectionOrder
      : Object.keys(SECTION_LABELS);

  const renderSection = (key: string) => {
    if (!visible(metadata.sectionVisibility, key)) return null;
    const title =
      key === "summary" && layout === "executive"
        ? "Executive Summary"
        : (SECTION_LABELS[key] ?? key);

    if (key === "summary") {
      const text = htmlToPlain(data.basics.summary);
      if (!text) return null;
      if (layout === "creative") {
        return (
          <Text key={key} style={styles.lead}>
            {text}
          </Text>
        );
      }
      return (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={36}>
            {title}
          </Text>
          <Text style={layout === "executive" ? { fontFamily: italic } : {}}>
            {text}
          </Text>
        </View>
      );
    }

    if (key === "work" && data.work.length > 0) {
      return (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={36}>
            {title}
          </Text>
          {data.work.map((item) => (
            <View key={item.id} style={styles.entry}>
              <View style={styles.row}>
                <Text style={styles.entryTitle}>{item.position}</Text>
                <Text style={styles.muted}>
                  {dates(item.startDate, item.endDate)}
                </Text>
              </View>
              <Text style={styles.muted}>
                {[item.company, item.location].filter(Boolean).join(" · ")}
              </Text>
              {htmlToPlain(item.summary) ? (
                <Text>{htmlToPlain(item.summary)}</Text>
              ) : null}
              {item.highlights.map((highlight, index) =>
                highlight ? (
                  <Text key={`${item.id}-h-${index}`} style={styles.bullet}>
                    • {highlight}
                  </Text>
                ) : null,
              )}
            </View>
          ))}
        </View>
      );
    }

    if (key === "education" && data.education.length > 0) {
      return (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={36}>
            {title}
          </Text>
          {data.education.map((item) => (
            <View key={item.id} style={styles.entry}>
              <View style={styles.row}>
                <Text style={styles.entryTitle}>
                  {[item.studyType, item.area].filter(Boolean).join(" in ") ||
                    item.institution}
                </Text>
                <Text style={styles.muted}>
                  {dates(item.startDate, item.endDate)}
                </Text>
              </View>
              <Text style={styles.muted}>
                {[item.institution, item.score].filter(Boolean).join(" · ")}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    if (key === "skills" && data.skills.length > 0) {
      return (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={36}>
            {title}
          </Text>
          {data.skills.map((item) => (
            <Text key={item.id} style={styles.entry}>
              <Text style={styles.entryTitle}>{item.name}: </Text>
              {item.keywords.join(", ")}
            </Text>
          ))}
        </View>
      );
    }

    if (key === "projects" && data.projects.length > 0) {
      return (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={36}>
            {title}
          </Text>
          {data.projects.map((item) => {
            const body = (
              <View
                key={item.id}
                style={layout === "creative" ? styles.card : styles.entry}
              >
                <Text style={styles.entryTitle}>{item.name}</Text>
                {htmlToPlain(item.description) ? (
                  <Text>{htmlToPlain(item.description)}</Text>
                ) : null}
                {item.highlights.map((highlight, index) =>
                  highlight ? (
                    <Text key={`${item.id}-h-${index}`} style={styles.bullet}>
                      • {highlight}
                    </Text>
                  ) : null,
                )}
                {item.url ? (
                  <Link src={item.url} style={{ color: theme.accent }}>
                    {item.url}
                  </Link>
                ) : null}
              </View>
            );
            return body;
          })}
        </View>
      );
    }

    if (key === "certifications" && data.certifications.length > 0) {
      return (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={36}>
            {title}
          </Text>
          {data.certifications.map((item) => (
            <Text key={item.id} style={styles.entry}>
              {item.name}
              {item.issuer ? ` — ${item.issuer}` : ""}
              {item.date ? ` (${item.date})` : ""}
            </Text>
          ))}
        </View>
      );
    }

    if (key === "languages" && data.languages.length > 0) {
      return (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={36}>
            {title}
          </Text>
          {data.languages.map((item) => (
            <Text key={item.id}>
              {item.language}
              {item.fluency ? ` — ${item.fluency}` : ""}
            </Text>
          ))}
        </View>
      );
    }

    if (key === "volunteer" && data.volunteer.length > 0) {
      return (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={36}>
            {title}
          </Text>
          {data.volunteer.map((item) => (
            <View key={item.id} style={styles.entry}>
              <Text style={styles.entryTitle}>
                {item.position}
                {item.organization ? ` · ${item.organization}` : ""}
              </Text>
              {htmlToPlain(item.summary) ? (
                <Text>{htmlToPlain(item.summary)}</Text>
              ) : null}
            </View>
          ))}
        </View>
      );
    }

    if (key === "awards" && data.awards.length > 0) {
      return (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={36}>
            {title}
          </Text>
          {data.awards.map((item) => (
            <Text key={item.id} style={styles.entry}>
              {item.title}
              {item.awarder ? ` — ${item.awarder}` : ""}
            </Text>
          ))}
        </View>
      );
    }

    if (key === "publications" && data.publications.length > 0) {
      return (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={36}>
            {title}
          </Text>
          {data.publications.map((item) => (
            <Text key={item.id} style={styles.entry}>
              {item.name}
              {item.publisher ? ` — ${item.publisher}` : ""}
            </Text>
          ))}
        </View>
      );
    }

    if (key === "references" && data.references.length > 0) {
      return (
        <View key={key} style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={36}>
            {title}
          </Text>
          {data.references.map((item) => (
            <Text key={item.id} style={styles.entry}>
              {item.name}
              {item.reference ? `: ${htmlToPlain(item.reference)}` : ""}
            </Text>
          ))}
        </View>
      );
    }

    return null;
  };

  const main = order
    .filter((key) => !sidebarKeys.includes(key))
    .map((key) => renderSection(key));
  const sidebar = sidebarKeys.map((key) => renderSection(key));
  const custom = (data.customSections ?? [])
    .filter((section) => section.items?.length)
    .map((section) => (
      <View key={section.id} style={styles.section}>
        <Text style={styles.sectionTitle} minPresenceAhead={36}>
          {section.sectionName}
        </Text>
        {section.items.map((item) => (
          <View key={item.id} style={styles.entry}>
            <Text style={styles.entryTitle}>{item.title}</Text>
            {htmlToPlain(item.description) ? (
              <Text>{htmlToPlain(item.description)}</Text>
            ) : null}
          </View>
        ))}
      </View>
    ));

  const header =
    layout === "split" ? null : (
      <View style={styles.header}>
        <Text style={styles.name}>
          {data.basics.name || title || "Your Name"}
        </Text>
        {data.basics.label ? (
          <Text style={styles.label}>{data.basics.label}</Text>
        ) : null}
        {contactLine(data) ? (
          <Text style={styles.contact}>{contactLine(data)}</Text>
        ) : null}
      </View>
    );

  const splitHeader = (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.name}>
        {data.basics.name || title || "Your Name"}
      </Text>
      {data.basics.label ? (
        <Text style={styles.label}>{data.basics.label}</Text>
      ) : null}
      {contactLine(data) ? (
        <Text style={styles.contact}>{contactLine(data)}</Text>
      ) : null}
    </View>
  );

  return (
    <Document title={title || "Resume"} author={data.basics.name || "Zaprill"}>
      <Page
        size={page.format === "letter" ? "LETTER" : "A4"}
        style={styles.page}
      >
        {layout === "creative" ? <View style={styles.rail} /> : null}
        {layout === "tech" ? header : null}
        {layout === "tech" || layout === "split" ? (
          <View style={styles.columns}>
            {layout === "split" ? (
              <View style={styles.sidebar}>
                {splitHeader}
                {sidebar}
              </View>
            ) : null}
            <View style={styles.main}>
              {main}
              {custom}
            </View>
            {layout === "tech" ? (
              <View style={styles.sidebar}>{sidebar}</View>
            ) : null}
          </View>
        ) : (
          <View>
            {header}
            {main}
            {custom}
          </View>
        )}
      </Page>
    </Document>
  );
}
