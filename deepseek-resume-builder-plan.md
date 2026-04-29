# 🌍 World-Class Multi-Industry Resume Builder — Complete Implementation Plan for Claude Opus 4.7

## PHASE 0: PRE-IMPLEMENTATION PREPARATION

### 0.1 Tech Stack Inventory (Already in Place)

| Layer              | Technology                | Confirmed?     |
| ------------------ | ------------------------- | -------------- |
| Frontend Framework | Next.js (App Router)      | ✅             |
| UI Components      | shadcn/ui + Tailwind CSS  | ✅             |
| Database           | Neon DB (PostgreSQL)      | ✅             |
| ORM                | Drizzle ORM               | ✅             |
| AI / LLM           | Claude Opus 4.7 or GPT-4o | Add if missing |

### 0.2 New Dependencies to Install

```bash
# Drag and Drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# PDF Generation (dual-strategy; see Phase 6)
npm install @react-pdf/renderer puppeteer puppeteer-core @sparticuz/chromium-min

# Rich Text Editor (for description fields)
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder

# Form Validation
npm install zod @hookform/resolvers react-hook-form

# State Management
npm install zustand

# AI SDK (if using Vercel AI)
npm install ai openai

# File Upload (profile picture)
npm install @uploadthing/react uploadthing

# Date Handling
npm install date-fns

# Parsing (ATS text extraction)
npm install pdf-parse

# Internationalization (Phase 5 add-on)
npm install next-intl
```

---

## PHASE 1: DATABASE SCHEMA DESIGN (Drizzle ORM)

### 1.1 Core Tables

Below you will find the complete, production-ready Drizzle schema for the Resume Builder. Every table is designed with data integrity and scalability in mind, including primary keys, default values, indexing, and constraints. You will place these definitions in a single file named `src/db/schema/resume.ts`.

```typescript
// src/db/schema/resume.ts
import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  jsonb,
  boolean,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ──────────────────────────────────────
// 1. User (extend your existing user table)
// ──────────────────────────────────────
// NOTE: If you already have a users table, add these columns via migration:
// - default_industry: varchar('default_industry', { length: 50 })
// - default_template_id: uuid('default_template_id')

// ──────────────────────────────────────
// 2. Resume — One user has many resumes
// ──────────────────────────────────────
export const resumes = pgTable(
  "resumes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 })
      .notNull()
      .default("Untitled Resume"),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    industry: varchar("industry", { length: 50 })
      .notNull()
      .default("technology"),
    templateId: uuid("template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    // "draft" | "complete" | "archived"
    version: integer("version").notNull().default(1),
    isPublic: boolean("is_public").notNull().default(false),
    viewCount: integer("view_count").notNull().default(0),
    downloadCount: integer("download_count").notNull().default(0),
    // Full resume data stored as structured JSONB
    data: jsonb("data").notNull().default({
      basics: {},
      work: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      volunteer: [],
      awards: [],
      publications: [],
      references: [],
      customSections: [],
    }),
    // Metadata for rendering preferences (colors, fonts, page size)
    metadata: jsonb("metadata")
      .notNull()
      .default({
        theme: { primary: "#1a1a2e", background: "#ffffff", text: "#333333" },
        typography: { font: { family: "Inter", size: 11 }, lineHeight: 1.5 },
        page: { format: "a4", margin: 20 },
        sectionOrder: [
          "summary",
          "work",
          "education",
          "skills",
          "projects",
          "certifications",
          "languages",
          "volunteer",
          "awards",
          "publications",
          "references",
        ],
      }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("resumes_user_id_idx").on(table.userId),
    index("resumes_slug_idx").on(table.slug),
    index("resumes_status_idx").on(table.status),
  ],
);

// ──────────────────────────────────────
// 3. Templates — Reusable resume templates
// ──────────────────────────────────────
export const templates = pgTable(
  "templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    category: varchar("category", { length: 50 }).notNull().default("general"),
    // "general" | "tech" | "marketing" | "business" | "sales" | "hr"
    // | "creative" | "academic" | "executive" | "minimal"
    layoutType: varchar("layout_type", { length: 50 })
      .notNull()
      .default("single-column"),
    // "single-column" | "two-column" | "sidebar" | "grid" | "hybrid"
    thumbnailUrl: text("thumbnail_url"),
    // React component registered name (maps to dynamic import)
    componentName: varchar("component_name", { length: 100 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    isPremium: boolean("is_premium").notNull().default(false),
    // Number of pages this template typically fits on
    recommendedPages: integer("recommended_pages").notNull().default(1),
    // ATS compatibility score (0–100)
    atsScore: integer("ats_score").notNull().default(90),
    // JSON structure defining which sections are visible by default
    defaultSectionVisibility: jsonb("default_section_visibility")
      .notNull()
      .default({
        summary: true,
        work: true,
        education: true,
        skills: true,
        projects: false,
        certifications: false,
        languages: false,
        volunteer: false,
        awards: false,
        publications: false,
        references: false,
      }),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("templates_category_idx").on(table.category)],
);

// ──────────────────────────────────────
// 4. Versions — Resume version history
// ──────────────────────────────────────
export const resumeVersions = pgTable(
  "resume_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    data: jsonb("data").notNull(),
    metadata: jsonb("metadata").notNull(),
    changeDescription: text("change_description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("resume_versions_resume_id_idx").on(table.resumeId),
    uniqueIndex("resume_versions_unique").on(table.resumeId, table.version),
  ],
);

// ──────────────────────────────────────
// 5. Exports — Track PDF/DOCX exports
// ──────────────────────────────────────
export const exportsTable = pgTable(
  "exports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    format: varchar("format", { length: 10 }).notNull(), // "pdf" | "docx" | "json" | "latex"
    fileUrl: text("file_url"),
    fileSize: integer("file_size"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("exports_resume_id_idx").on(table.resumeId)],
);

// ──────────────────────────────────────
// 6. ATS Analyses — Track ATS scores per resume
// ──────────────────────────────────────
export const atsAnalyses = pgTable(
  "ats_analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    jobDescription: text("job_description"),
    score: integer("score"), // 0-100
    keywordMatches: jsonb("keyword_matches").notNull().default([]),
    missingKeywords: jsonb("missing_keywords").notNull().default([]),
    suggestions: jsonb("suggestions").notNull().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("ats_analyses_resume_id_idx").on(table.resumeId)],
);

// ──────────────────────────────────────
// 7. Shared Links — Public sharing with optional password
// ──────────────────────────────────────
export const sharedLinks = pgTable(
  "shared_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 64 }).notNull().unique(),
    password: varchar("password", { length: 100 }),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("shared_links_token_idx").on(table.token)],
);
```

### 1.2 JSONB Data Shape (the `data` column)

The content stored inside `resumes.data` follows the JSON Resume standard extended to cover all industries:

```typescript
// TypeScript type for resumes.data (not stored as a table, but enforced in code via Zod)
interface ResumeData {
  basics: {
    name: string;
    label: string; // e.g., "Senior Software Engineer"
    email: string;
    phone: string;
    url: string; // personal website
    location: { city: string; region: string; countryCode: string };
    summary: string; // professional summary (rich text)
    picture: string | null; // URL to uploaded image
    profiles: Array<{ network: string; username: string; url: string }>;
  };
  work: Array<{
    id: string; // UUID for drag & drop key
    company: string;
    position: string;
    website: string;
    startDate: string; // "YYYY-MM-DD" or "YYYY-MM"
    endDate: string | null; // null means "Present"
    summary: string; // rich text
    highlights: string[]; // bullet points
    location: string;
    industry: string; // industry tag
  }>;
  education: Array<{
    id: string;
    institution: string;
    url: string;
    area: string; // major / field of study
    studyType: string; // "Bachelor", "Master", etc.
    startDate: string;
    endDate: string | null;
    score: string; // GPA or grade
    courses: string[];
  }>;
  skills: Array<{
    id: string;
    name: string; // e.g., "Frontend Development"
    level: string; // "Beginner" | "Intermediate" | "Advanced" | "Expert"
    keywords: string[]; // e.g., ["React", "TypeScript", "Next.js"]
    category: string; // "technical" | "soft" | "domain" | "language"
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    highlights: string[];
    url: string;
    githubUrl: string;
    startDate: string;
    endDate: string | null;
    keywords: string[];
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url: string;
  }>;
  languages: Array<{
    id: string;
    language: string;
    fluency: string; // "Native" | "Fluent" | "Advanced" | "Intermediate" | "Beginner"
  }>;
  volunteer: Array<{
    id: string;
    organization: string;
    position: string;
    url: string;
    startDate: string;
    endDate: string | null;
    summary: string;
    highlights: string[];
  }>;
  awards: Array<{
    id: string;
    title: string;
    date: string;
    awarder: string;
    summary: string;
  }>;
  publications: Array<{
    id: string;
    name: string;
    publisher: string;
    releaseDate: string;
    url: string;
    summary: string;
  }>;
  references: Array<{
    id: string;
    name: string;
    reference: string; // the actual reference text
  }>;
  customSections: Array<{
    id: string;
    sectionName: string; // user-defined section name
    items: Array<{
      id: string;
      title: string;
      subtitle: string;
      date: string;
      description: string;
      highlights: string[];
    }>;
  }>;
}
```

---

## PHASE 2: TEMPLATE SYSTEM ARCHITECTURE

### 2.1 Template Categories by Industry

Create 15–20 templates minimum. Each template is a React component registered in a dynamic import map. Categorize them by industry-fit:

| #   | Template Name       | Layout                             | Best For Industries     | ATS Score |
| --- | ------------------- | ---------------------------------- | ----------------------- | --------- |
| 1   | Minimalist          | Single-column, clean typography    | All / General           | 98        |
| 2   | Tech Stack          | Two-column, skills-sidebar         | Tech, Engineering, Data | 95        |
| 3   | Creative Portfolio  | Hybrid, color accents              | Marketing, Design       | 85        |
| 4   | Executive Pro       | Single-column, serif font          | Business, Finance       | 97        |
| 5   | Sales Achiever      | Two-column, metrics-focused        | Sales, BD               | 94        |
| 6   | HR Professional     | Single-column, certification-first | HR, Recruiting          | 96        |
| 7   | Academic CV         | Multi-page, publications-heavy     | Academic, Research      | 99        |
| 8   | Modern Split        | Sidebar, bold header               | Consulting, Strategy    | 92        |
| 9   | Startup Ready       | Compact, one-page optimized        | Tech, Startups          | 93        |
| 10  | Agency Creative     | Grid, visual sections              | Marketing, Creative     | 88        |
| 11  | Data-Driven         | Timeline, metrics-emphasis         | Finance, Ops, Data      | 94        |
| 12  | Global Professional | Clean, photo-friendly              | International roles     | 96        |
| 13  | Healthcare CV       | Certification-first, clean         | Healthcare, Medical     | 97        |
| 14  | Legal Brief         | Classic, serif-dominant            | Legal, Compliance       | 98        |
| 15  | Functional Focus    | Skills-first, gap-friendly         | Career changers         | 91        |

### 2.2 Template Component Interface

Every template component must conform to this contract:

```typescript
// src/components/resume/templates/types.ts
interface TemplateProps {
  data: ResumeData;
  metadata: ResumeMetadata;
  // CSS variables injected at runtime for live theme switching
  cssVariables: Record<string, string>;
}

// Each template is a React component: (props: TemplateProps) => JSX.Element
// Registered in dynamic import map:
// src/components/resume/templates/registry.ts

const templateRegistry: Record<
  string,
  () => Promise<{ default: React.FC<TemplateProps> }>
> = {
  minimalist: () => import("./MinimalistTemplate"),
  "tech-stack": () => import("./TechStackTemplate"),
  "creative-portfolio": () => import("./CreativePortfolioTemplate"),
  // ... all others
};
```

### 2.3 Template Rendering Pipeline

1. User selects template → `resumes.templateId` is set.
2. On preview/render, `templateRegistry[componentName]` is loaded via `React.lazy` + `Suspense`.
3. Resume data + metadata + CSS variables are passed as props.
4. Template renders within an isolated `<div>` with `id="resume-preview"`.
5. For PDF export, this same div is captured via Puppeteer or `@react-pdf/renderer`.

### 2.4 Metadata-Driven Customization

Users can customize per template without touching code:

- **Theme colors**: primary, background, text, accent
- **Font family**: Inter, Roboto, Merriweather, Calibri (ATS-safe)
- **Font size**: 10–14px range (12px recommended for ATS)
- **Page format**: A4 / US Letter toggle
- **Margin**: 15–30mm
- **Section visibility toggles**: show/hide each section
- **Section reordering**: drag-and-drop via `@dnd-kit`

---

## PHASE 3: RESUME EDITOR & FORM BUILDER

### 3.1 Editor Layout (Three-Panel Design)

```
+------------------+---------------------------+-------------------+
|  LEFT PANEL      |    CENTER (FORM)          |  RIGHT (PREVIEW)  |
|  Section Nav     |                           |                   |
|  [Basics]        |  Personal Details         |  +-------------+  |
|  [Work]          |  ┌──────────────────────┐  |  |             |  |
|  [Education]     |  │ Name: [_________]    │  |  |  Live       |  |
|  [Skills]        |  │ Email: [_________]   │  |  |  Preview    |  |
|  [Projects]      |  │ Phone: [_________]   │  |  |  (iframe)   |  |
|  [Certifications]│  └──────────────────────┘  |  |             |  |
|  [Languages]     |                           |  +-------------+  |
|  [Volunteer]     |  Professional Summary     |                   |
|  [Awards]        |  [Tiptap Rich Text]       |                   |
|  [+ Add Custom]  |                           |                   |
+------------------+---------------------------+-------------------+
```

### 3.2 Section Components (shadcn/ui based)

Each section is its own client component using `react-hook-form` and `zod` validation:

- **BasicsSection**: Text inputs + Tiptap for summary + image upload for photo
- **WorkSection**: Repeating card list, each card has fields; drag-to-reorder items
- **EducationSection**: Repeating card list
- **SkillsSection**: Tag-based input with category grouping; autocomplete from skill database
- **ProjectsSection**: Repeating cards with GitHub URL auto-fetch (optional)
- **CertificationsSection**: Simple repeating cards
- **LanguagesSection**: Dropdown fluency picker
- **CustomSection**: User defines section name + repeating items with title/subtitle/description/highlights

### 3.3 Form State Management

Use **Zustand** store with undo/redo:

```typescript
// src/stores/resume-store.ts
// Key methods:
// - setBasics(basics)
// - addWorkItem(), updateWorkItem(id, data), removeWorkItem(id), reorderWorkItems(from, to)
// - addEducationItem(), updateEducationItem(), removeEducationItem(), reorderEducationItems()
// - setSkills(skills[])
// - addProject(), updateProject(), removeProject()
// - setMetadata(metadata)
// - undo(), redo()
// - resetToVersion(versionData)
// Auto-save to server: every 3 seconds if dirty (debounced)
```

### 3.4 Validation Rules (Zod Schemas)

```typescript
// src/lib/validations/resume.ts
// - Email must be valid email format
// - Phone must match international phone regex
// - URL fields must be valid URLs or empty
// - Dates must be valid ISO, startDate before endDate
// - Required fields per section: basics.name, work[0].company, work[0].position
// - Summary max 400 words (show character counter)
// - Each bullet point max 200 characters (show counter)
// - Skills max 30 total, 10 per category
```

---

## PHASE 4: REAL-TIME PREVIEW SYSTEM

### 4.1 Architecture

Two approaches; use **Approach A** for development speed and **Approach B** added later for LaTeX-quality output:

**Approach A (Primary — HTML/CSS Render)：**

- Render the selected template component inside a scaled `<iframe>` or a scrollable `div#preview`.
- Template receives `data` + `metadata` via Zustand store.
- Use `requestAnimationFrame` debouncing for smooth live updates.
- CSS `@page` rules for print layout simulation.

**Approach B (Premium — LaTeX Render)：**

- Store LaTeX template `.tex` files in `/templates/latex/`.
- Use a server endpoint (Next.js API route) that takes resume data → fills LaTeX template → runs `pdflatex` via a Docker sidecar or a serverless function with TeX Live installed.
- Return the PDF buffer.

### 4.2 Preview Communication

If using iframe isolation (Reactive-Resume-style):

- Parent window sends data via `iframe.contentWindow.postMessage(data, '*')`.
- Iframe receives and re-renders.
- This ensures template CSS never leaks into editor styles.

### 4.3 Real-Time Sync

- On every form change, Zustand store updates → triggers debounced (100ms) postMessage to iframe.
- Iframe maintains its own Zustand store synced via message listener.
- Preview auto-scrolls to the section currently being edited.

---

## PHASE 5: PDF GENERATION STRATEGY (DUAL-ENGINE)

### 5.1 Strategy Overview

| Engine                      | Use Case                 | Output                                 |
| --------------------------- | ------------------------ | -------------------------------------- |
| **HTML-to-PDF (Puppeteer)** | Default for all users    | Pixel-perfect PDF matching web preview |
| **LaTeX (pdflatex)**        | Premium / academic users | Typographic-quality PDF                |

### 5.2 HTML-to-PDF Pipeline (Puppeteer)

```typescript
// src/lib/pdf/generate-pdf.ts
// 1. Render the resume page(s) as HTML using ReactDOMServer.renderToString
// 2. Inject CSS with @page { size: A4; margin: 20mm; } and @media print rules
// 3. In development: spawn Puppeteer with local Chrome
// 4. In production (Vercel): use @sparticuz/chromium-min + puppeteer-core
//    (15-second cold start is acceptable; use Edge caching for repeated exports)
// 5. Set page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', bottom: '0' } })
// 6. For multi-page resumes: use CSS page-break-after: always on section dividers
// 7. Return PDF buffer → stream to client as download

// Edge cases to handle:
// - Content overflow: detect via page.evaluate(() => document.body.scrollHeight)
//   and warn user if content exceeds 1 page for single-page templates
// - Multi-page: ensure section headers repeat with proper page breaks
// - Font loading: inject Google Fonts CSS and wait for document.fonts.ready
// - Unicode/emoji: ensure encoding is UTF-8
```

### 5.3 LaTeX Pipeline (Optional Premium Feature)

```typescript
// src/lib/pdf/generate-latex.ts
// 1. Load the .tex template file from /templates/latex/
// 2. Replace placeholders like {{name}}, {{email}}, {{summary}} with sanitized user data
// 3. For arrays (work, education): iterate and inject \cventry{} commands or similar
// 4. Escape all LaTeX special characters: &, %, $, #, _, {, }, ~, ^, \
// 5. Write filled .tex to temp directory
// 6. Execute: pdflatex -interaction=nonstopmode -output-directory=/tmp temp.tex
// 7. Read resulting .pdf file → stream to client
// 8. Clean up temp files

// Edge cases:
// - pdflatex not installed: return helpful error "LaTeX engine is not configured"
// - Compilation errors: parse .log file, extract line numbers, show user-friendly error
// - Long content: LaTeX handles multi-page natively, but check for overfull hbox warnings
```

---

## PHASE 6: ATS OPTIMIZATION ENGINE

### 6.1 ATS Scoring Algorithm

Calculate a score (0–100) based on weighted criteria:

| Criterion                     | Weight | Check                                                        |
| ----------------------------- | ------ | ------------------------------------------------------------ |
| Standard section headings     | 15%    | Uses "Experience" / "Work Experience", "Education", "Skills" |
| No tables or columns          | 10%    | Template layout is single-column or ATS-friendly two-column  |
| No images/graphics in content | 10%    | No logos, icons, or images in resume body                    |
| Standard fonts                | 5%     | Arial, Calibri, Times New Roman, Inter, or similar           |
| Keyword density score         | 30%    | Match against job description keywords (TF-IDF)              |
| Quantified achievements       | 10%    | Bullet points contain numbers (%, $, metrics)                |
| Proper date formats           | 5%     | Consistent MM/YYYY format throughout                         |
| File format                   | 5%     | PDF output (not image-based)                                 |
| Contact info completeness     | 5%     | Name, email, phone, LinkedIn present                         |
| No spelling/grammar errors    | 5%     | Basic spellcheck pass                                        |

### 6.2 Keyword Scanner

```typescript
// src/lib/ats/keyword-scanner.ts
// 1. Accept job description text as input
// 2. Extract keywords: use simple TF-IDF or call OpenAI to extract
//    "hard skills", "soft skills", "tools", "certifications", "domain knowledge"
// 3. For each keyword, check if it appears in resume data (case-insensitive)
// 4. Flag missing keywords → suggest where to add them
// 5. Show match percentage and keyword heatmap

// Store results in ats_analyses table
```

### 6.3 ATS Checker UI

- "ATS Score" badge in the editor toolbar with color coding (red < 60, yellow 60–80, green > 80).
- Click to open detailed breakdown panel.
- "Optimize for Job Description" button: paste JD → get keyword report → one-click "Add Missing Keywords" which intelligently inserts keywords into relevant sections.

---

## PHASE 7: AI-POWERED FEATURES

### 7.1 AI Bullet Point Writer

Triggered when user clicks "✨ AI Enhance" on any bullet point or work summary:

```typescript
// Prompt template:
// "You are an expert resume writer. Rewrite the following bullet point
// to be more impactful, using strong action verbs and quantified metrics
// where possible. The user works in the {industry} industry.
// Original: {userText}
// Rewritten bullet point:"

// Edge cases:
// - Rate limiting: max 20 AI calls per user per day on free tier
// - Streaming: use AI SDK for token-by-token streaming in the textarea
// - Fallback: if AI call fails, keep original text and show toast "AI unavailable"
// - User clarification: if input is too vague, prompt: "Can you add more details about this role?"
```

### 7.2 AI Summary Generator

One-click generation of `basics.summary`:

```typescript
// Prompt template:
// "Write a professional summary for a {industry} professional with the
// following experience: {JSON.stringify(work)}. Include years of experience,
// key skills, and notable achievements. Keep it under 100 words.
// Use strong action verbs and industry keywords."
```

### 7.3 AI Tailoring (Resume ↔ Job Description)

Paste a job description → AI rewrites the entire resume to target that job:

```typescript
// Steps:
// 1. Parse JD to extract required skills, experience, keywords
// 2. For each section of the resume, generate an AI-diff: words to change/add
// 3. Show side-by-side comparison with changes highlighted in green (added) / red (removed)
// 4. User can accept all or reject per-section
// 5. Create a new resume version before applying changes (non-destructive)
```

### 7.4 AI Resume Roast / Feedback

"Roast my resume" button that provides brutally honest feedback:

```typescript
// Prompt: "You are a brutally honest career coach. Analyze this resume data
// and give specific, actionable feedback on what's weak, what's missing,
// and what would get this resume rejected. Be blunt but helpful."
```

---

## PHASE 8: INDUSTRY-SPECIFIC SMART DEFAULTS

### 8.1 Industry Profiles

When a user selects their industry, pre-configure:

| Industry             | Default Sections                              | Template Recommendation       | Skill Categories                                |
| -------------------- | --------------------------------------------- | ----------------------------- | ----------------------------------------------- |
| **Technology**       | Work, Skills, Projects, Education             | Tech Stack, Minimalist        | technical, tools, methodologies                 |
| **Marketing**        | Work, Skills, Projects, Certifications        | Creative Portfolio, Agency    | strategy, tools, channels, analytics            |
| **Business/Finance** | Work, Education, Skills, Certifications       | Executive Pro, Data-Driven    | finance, strategy, leadership, tools            |
| **Sales**            | Work, Skills, Awards, Education               | Sales Achiever, Executive Pro | sales methodology, CRM, metrics, industry       |
| **HR**               | Work, Education, Certifications, Skills       | HR Professional, Global Pro   | HR systems, compliance, soft skills, recruiting |
| **Healthcare**       | Certifications, Work, Education, Licenses     | Healthcare CV                 | clinical, certifications, soft skills           |
| **Legal**            | Education, Work, Publications, Bar Admissions | Legal Brief                   | practice areas, bar admissions, cases           |
| **Academic**         | Education, Publications, Research, Teaching   | Academic CV                   | research areas, methodologies, teaching         |
| **Creative/Design**  | Portfolio, Work, Skills, Exhibitions          | Creative Portfolio, Agency    | tools, mediums, styles, clients                 |

### 8.2 Section Reordering Per Industry

Different industries prioritize sections differently:

```typescript
const industrySectionOrder: Record<string, string[]> = {
  technology: [
    "summary",
    "skills",
    "work",
    "projects",
    "education",
    "certifications",
  ],
  marketing: [
    "summary",
    "work",
    "projects",
    "skills",
    "education",
    "certifications",
  ],
  business: [
    "summary",
    "work",
    "education",
    "skills",
    "certifications",
    "awards",
  ],
  sales: ["summary", "work", "awards", "skills", "education"],
  hr: ["summary", "work", "skills", "certifications", "education"],
  healthcare: ["certifications", "work", "education", "skills"],
  academic: ["education", "publications", "research", "teaching", "awards"],
};
```

---

## PHASE 9: KEY EDGE CASES & ERROR HANDLING

### 9.1 Content Overflow / Multi-Page

**Problem**: User adds too much content, template overflows single page, PDF gets cut off or distorted.

**Solution**:

- In preview mode, detect overflow: `element.scrollHeight > element.clientHeight`.
- Show a yellow warning banner: "⚠️ Your resume exceeds 1 page. Consider trimming or switching to a multi-page template."
- For multi-page templates: apply `page-break-before: always` or `page-break-after: always` at logical section boundaries.
- For single-page templates: auto-scale font size down to minimum 9pt, then flag overflow. Never go below 9pt.
- Add an explicit "Page Break" control so users can manually insert breaks.

### 9.2 Data Loss Prevention

**Problem**: User types for 10 minutes, browser crashes, data is lost.

**Solution**:

- **Debounced auto-save**: Every 3 seconds, persist Zustand state to `localStorage` as backup.
- **Server auto-save**: Every 30 seconds if dirty, save to `resumes.data` via API.
- **Version history**: Before any AI bulk-rewrite or major edit, create snapshot in `resume_versions`.
- **Unsaved changes warning**: `beforeunload` event listener: "You have unsaved changes. Are you sure you want to leave?"

### 9.3 Rich Text HTML Injection (XSS)

**Problem**: User pastes malicious HTML into Tiptap editor.

**Solution**:

- Tiptap's default output is sanitized, but additionally run `DOMPurify.sanitize()` before storing to JSONB.
- On render, never use `dangerouslySetInnerHTML` directly. Use Tiptap's `generateHTML()` or a controlled renderer.
- Whitelist only basic formatting tags: `<p>`, `<br>`, `<strong>`, `<em>`, `<ul>`, `<ol>`, `<li>`, `<a>`.

### 9.4 Large File / Image Handling

**Problem**: User uploads a 10MB profile photo that bloats the PDF.

**Solution**:

- Client-side resize: before upload, resize image to max 400×400px using Canvas API.
- Server-side: use `sharp` to resize and convert to WebP, max 100KB.
- Store in S3-compatible storage (or UploadThing), store URL in `basics.picture`.

### 9.5 PDF Generation Timeouts (Serverless)

**Problem**: Puppeteer on Vercel serverless times out (max 60s for Pro).

**Solution**:

- Use `@sparticuz/chromium-min` (lightweight Chromium for serverless).
- Cache generated PDFs: if same resume data + same template, return cached PDF (key = hash of data + template + timestamp).
- Fallback: if Puppeteer fails, generate PDF client-side using `window.print()` with `@media print` CSS.
- For large multi-page resumes, move PDF generation to a background queue (e.g., QStash, Inngest).

### 9.6 Concurrent Editing

**Problem**: User has resume open in two tabs, makes conflicting changes.

**Solution**:

- Use `resumes.version` column as optimistic lock.
- On save, check `WHERE version = {currentVersion}`; if affected rows = 0, version conflict.
- Show modal: "This resume was modified in another session. Reload to see latest changes."

### 9.7 Drag & Drop State Bugs

**Problem**: After reordering work items, preview doesn't update or shows stale order.

**Solution**:

- Zustand store must use immutable updates for array reordering.
- Each item in arrays has a unique `id` field (UUID v4) used as React `key`.
- After `@dnd-kit` `onDragEnd`, update store → triggers iframe postMessage → iframe re-renders.
- Test with React DevTools profiler to confirm no unnecessary re-renders.

### 9.8 International Character Support

**Problem**: User enters Chinese, Arabic, or RTL text; PDF garbles characters.

**Solution**:

- All database columns use `UTF-8` encoding (Neon DB handles this by default).
- PDF generation: ensure Puppeteer page uses `<meta charset="UTF-8">`.
- For LaTeX: use XeLaTeX or LuaLaTeX instead of pdflatex for Unicode support (require `fontspec` package).
- For RTL languages: add `direction: rtl` CSS class and test with Arabic/Hebrew templates.
- Template fonts must support the character set (fallback to system fonts for CJK/Arabic).

### 9.9 Empty State Handling

**Problem**: New user opens resume builder, sees blank preview.

**Solution**:

- Show placeholder content in preview with ghost/loading UI: "Your resume will appear here."
- Pre-fill basics.name = user's display name from auth.
- On first visit, show onboarding wizard: select industry → select template → start filling.
- Every section card in the editor has a "?" help icon with tooltip explanation.

### 9.10 Mobile/Tablet Responsiveness

**Problem**: Three-panel editor doesn't work on mobile.

**Solution**:

- On screens < 1024px: collapse to single-column wizard mode (one panel at a time).
- Preview accessible via "Preview" button that opens a full-screen modal/iframe.
- Form inputs stack vertically, cards become full-width.
- Drag-and-drop degrades to "Move Up"/"Move Down" buttons on touch devices.

### 9.11 Skill Database / Autocomplete

**Problem**: Free-text skill entry leads to inconsistent naming.

**Solution**:

- Maintain a curated skill database table (`skills_catalog`) with ~5,000 pre-populated skills across industries.
- Autocomplete input: as user types, search `skills_catalog` and suggest matches.
- Allow free-form entry for skills not in catalog.
- Periodically seed new skills from user entries (admin review).

### 9.12 Import Existing Resume

**Problem**: User already has a PDF/JSON/LinkedIn resume and doesn't want to retype everything.

**Solution**:

- **PDF import**: Upload existing PDF → server parses with `pdf-parse` → extract text blocks → use AI (GPT-4o) to map unstructured text to `ResumeData` schema → return structured JSON → populate form.
- **JSON Resume import**: Directly validate against schema, then populate.
- **LinkedIn import**: Use LinkedIn OAuth to fetch profile data → map to `ResumeData`.
- Show "Import Resume" button prominently on empty dashboard.

---

## PHASE 10: USER EXPERIENCE & TOOLTIPS

### 10.1 Tooltip System

Every form field and control must have a help tooltip. Use shadcn's `<Tooltip>` component:

| UI Element             | Tooltip Text                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Name field             | "Use your full legal name as it appears on official documents."                                                    |
| Email field            | "Use a professional email address. Avoid quirky or outdated domains."                                              |
| Phone field            | "Include country code for international applications, e.g., +1 (555) 123-4567."                                    |
| Professional Summary   | "2–4 sentences summarizing your experience, key skills, and career goals. Tailor this to each job."                |
| Work - Position        | "Your official job title. Use industry-standard titles for better ATS matching."                                   |
| Work - Highlights      | "Each bullet should start with a strong action verb and include a quantified result when possible."                |
| Skills Category        | "Group skills by type. Technical skills (languages, tools) separate from soft skills (leadership, communication)." |
| ATS Score badge        | "Applicant Tracking System compatibility score. Aim for 80+. Click for detailed breakdown."                        |
| Template selector      | "Choose a template matching your industry. All templates are ATS-optimized."                                       |
| Section reorder handle | "Drag to reorder sections. Sections at the top get more recruiter attention."                                      |

### 10.2 Onboarding Flow

```
Step 1: Welcome → "Let's build your professional resume in 5 minutes."
Step 2: Select Industry → Grid of industry cards (Tech, Marketing, Business, Sales, HR, Other)
Step 3: Select Template → Show 3 recommended templates based on industry, with preview thumbnails
Step 4: Import or Start Fresh → "Import from LinkedIn" | "Upload PDF" | "Start from Scratch"
Step 5: Editor opens → Highlight first section to fill with pulsing animation
```

### 10.3 Progress Tracker

Show completion percentage in the sidebar:

- Each section contributes weighted %: Basics(15), Work(30), Education(15), Skills(15), Summary(10), Other(15).
- "Profile Strength: 65% — Add 2 more work experiences to reach 85%"

---

## PHASE 11: EXPORT & SHARE

### 11.1 Export Formats

| Format           | Method                                                                | Use Case                                     |
| ---------------- | --------------------------------------------------------------------- | -------------------------------------------- |
| **PDF**          | Puppeteer (HTML→PDF) or LaTeX                                         | Primary download format                      |
| **DOCX**         | `html-to-docx` library or server-side LibreOffice headless conversion | Employers requiring Word docs                |
| **JSON**         | Direct download of `resumes.data`                                     | Backup, portability, version control         |
| **LaTeX Source** | Fill template and download `.tex` file                                | Advanced users who want to further customize |

### 11.2 Public Sharing

- Generate a unique share URL: `https://yourapp.com/r/{slug}`.
- Optional password protection (stored as bcrypt hash in `shared_links.password`).
- Track views and downloads.
- "Copy Link" button with toast confirmation.

---

## PHASE 12: DASHBOARD & RESUME MANAGEMENT

### 12.1 User Dashboard

- Grid of resume cards, each showing: title, template thumbnail, last modified date, ATS score badge, download count.
- Actions per card: Edit, Duplicate, Download PDF, Share, Delete (with confirmation).
- "Create New Resume" button → opens onboarding wizard.
- Filter by status: All, Drafts, Completed, Archived.
- Sort by: Last Modified, Title, ATS Score.

### 12.2 Duplicate Resume

- Creates a deep copy of `resumes.data` and `resumes.metadata`.
- New title: "Copy of {original title}".
- Resets download/view counts.
- Links to original as "based_on_resume_id".

---

## PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER

### Week 1: Foundation

1. **Set up database migrations** — Create all tables using `drizzle-kit generate` + `drizzle-kit push`.
2. **Seed templates** — Insert 15 template records into `templates` table with metadata.
3. **Create ResumeData Zod schema** — Full validation schema matching the TypeScript interface above.
4. **Create Zustand store** — Full state management with undo/redo, dirty tracking, auto-save hooks.
5. **Create API routes (tRPC or Route Handlers)** — CRUD operations for resumes:
   - `POST /api/resumes` — Create new resume
   - `GET /api/resumes/[id]` — Fetch resume
   - `PATCH /api/resumes/[id]` — Update resume data
   - `DELETE /api/resumes/[id]` — Delete resume
   - `GET /api/resumes` — List user's resumes
   - `POST /api/resumes/[id]/duplicate` — Duplicate
   - `POST /api/resumes/[id]/versions` — Create version snapshot

### Week 2: Editor Shell

6. **Build three-panel editor layout** — Responsive sidebar, center form area, right preview area.
7. **Build section navigation** — Left panel with section list, active state, drag-to-reorder, "+ Add Custom Section".
8. **Build live preview iframe** — Isolated iframe that receives data via postMessage.
9. **Implement Basics section form** — Using shadcn form components + react-hook-form + zod.
10. **Implement Tiptap rich text** — For summary and description fields.

### Week 3: All Form Sections

11. **Work Experience section** — Card-based CRUD with drag-to-reorder items.
12. **Education section** — Card-based CRUD.
13. **Skills section** — Tag input with autocomplete from skills_catalog, category grouping.
14. **Projects section** — Card-based with GitHub URL preview.
15. **Certifications section** — Simple card list.
16. **Languages section** — Dropdown fluency selector.
17. **Volunteer, Awards, Publications, References sections** — Each as card lists.
18. **Custom sections** — Dynamic section creator with user-defined name + repeating item template.

### Week 4: Templates

19. **Build first 5 templates** — Minimalist, Tech Stack, Executive Pro, Sales Achiever, Creative Portfolio — as React components conforming to `TemplateProps`.
20. **Template registry and lazy loading** — Dynamic imports with Suspense fallback.
21. **Theme customization panel** — Color pickers, font selector, page format toggle, margin slider.
22. **Section visibility toggles** — Checkboxes for each section, synced to `metadata`.
23. **Connect template preview to iframe** — Template renders in iframe with live data.

### Week 5: PDF Generation

24. **Puppeteer HTML-to-PDF API route** — `/api/resumes/[id]/export/pdf` with dual local/serverless config.
25. **Client-side print fallback** — `window.print()` with `@media print` CSS.
26. **PDF download flow** — Loading state → progress indicator → download trigger.
27. **Test multi-page output** — Ensure page breaks work correctly.
28. **Test across browsers** — Chrome, Firefox, Safari, Edge.

### Week 6: ATS Engine

29. **ATS scoring algorithm** — Implement all 10 scoring criteria.
30. **ATS score display** — Badge in toolbar, detailed breakdown modal.
31. **Keyword scanner** — TF-IDF based matching against job description.
32. **"Optimize for JD" flow** — Paste JD → scan → show keyword gaps → suggest additions.
33. **ATS-friendly template validation** — Flag templates that use tables, columns, or non-standard headings.

### Week 7: AI Features

34. **AI Bullet Point Enhancer** — Single bullet rewrite with streaming.
35. **AI Summary Generator** — Generate `basics.summary` from work history.
36. **AI Resume Tailoring** — Full resume rewrite against job description with diff view.
37. **AI Resume Roast** — Brutally honest feedback generator.
38. **Rate limiting** — Per-user, per-day AI call limits.
39. **AI error handling** — Graceful degradation when AI is unavailable.

### Week 8: Edge Cases & Polish

40. **Content overflow detection & warnings** — Visual indicators in preview when content exceeds page.
41. **Multi-page support** — Dynamic page break insertion, page count display.
42. **Data loss prevention** — localStorage backup, version snapshots, unsaved changes warnings.
43. **Import flows** — PDF import (pdf-parse + AI mapping), JSON Resume import, LinkedIn import.
44. **Image handling** — Client-side resize, server-side sharp processing, max size enforcement.
45. **Concurrent edit detection** — Optimistic locking with version column.
46. **Empty states** — Placeholder content, ghost UI, first-visit onboarding wizard.
47. **Mobile responsiveness** — Single-column wizard mode for screens < 1024px.

### Week 9: Dashboard & Share

48. **User dashboard** — Resume grid with cards, CRUD actions, sorting, filtering.
49. **Public sharing** — Share URL generation, optional password, view/download tracking.
50. **Duplicate resume** — Deep copy with new title and reset stats.
51. **Export formats** — PDF (primary), DOCX, JSON, LaTeX source.

### Week 10: Testing & QA

52. **Unit tests** — Zod schemas, ATS scorer, keyword scanner, data transforms.
53. **Integration tests** — API routes CRUD, template rendering, PDF generation.
54. **E2E tests** — Full flow: signup → create resume → fill all sections → change template → export PDF → share.
55. **Accessibility audit** — Screen reader support, keyboard navigation, ARIA labels.
56. **Performance audit** — Lighthouse score > 90, Core Web Vitals pass.
57. **Cross-browser testing** — Chrome, Firefox, Safari, Edge.
58. **Edge case checklist** — Run through all 12 edge cases listed in Phase 9.

---

## PHASE 14: PERFORMANCE & DEPLOYMENT

### 14.1 Performance Optimizations

- **Template lazy loading**: Only load the active template component.
- **PDF caching**: Cache generated PDFs; bust cache when resume data changes (use content hash).
- **Image optimization**: Resize and compress profile pictures.
- **Debounced auto-save**: Don't fire API calls on every keystroke.
- **Virtualized lists**: If a user has 20+ work items, use `react-window` for the form cards.
- **Edge caching**: Serve public resume pages from CDN cache (Vercel Edge).

### 14.2 Deployment Checklist

- [ ] Drizzle migrations applied to production Neon DB.
- [ ] Environment variables set: `DATABASE_URL`, `OPENAI_API_KEY`, `UPLOADTHING_SECRET`, etc.
- [ ] Puppeteer configured for Vercel serverless (`@sparticuz/chromium-min`).
- [ ] File storage bucket configured (UploadThing / S3 / MinIO).
- [ ] Rate limiting middleware active on AI endpoints.
- [ ] CORS configured correctly.
- [ ] Monitoring and error tracking (Sentry) active.

---

## QUICK REFERENCE: FILE STRUCTURE

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── resumes/
│   │   │   ├── page.tsx                    # Resume dashboard/grid
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx                # Resume editor (three-panel)
│   │   │   │   └── loading.tsx
│   │   │   └── new/
│   │   │       └── page.tsx                # Onboarding wizard
│   │   └── templates/
│   │       └── page.tsx                    # Template marketplace
│   ├── api/
│   │   ├── resumes/
│   │   │   ├── route.ts                    # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, PATCH, DELETE
│   │   │       ├── duplicate/route.ts
│   │   │       ├── versions/route.ts       # GET, POST
│   │   │       ├── export/
│   │   │       │   ├── pdf/route.ts
│   │   │       │   ├── docx/route.ts
│   │   │       │   └── json/route.ts
│   │   │       ├── share/route.ts
│   │   │       └── ats/route.ts            # ATS scoring
│   │   └── ai/
│   │       ├── enhance/route.ts
│   │       ├── summary/route.ts
│   │       └── tailor/route.ts
│   └── r/[slug]/page.tsx                   # Public shared resume view
├── components/
│   └── resume/
│       ├── editor/
│       │   ├── EditorLayout.tsx
│       │   ├── SectionNav.tsx
│       │   ├── sections/
│       │   │   ├── BasicsSection.tsx
│       │   │   ├── WorkSection.tsx
│       │   │   ├── EducationSection.tsx
│       │   │   ├── SkillsSection.tsx
│       │   │   ├── ProjectsSection.tsx
│       │   │   ├── CertificationsSection.tsx
│       │   │   ├── LanguagesSection.tsx
│       │   │   ├── CustomSection.tsx
│       │   │   └── shared/
│       │   │       ├── SectionCard.tsx
│       │   │       ├── DateRangePicker.tsx
│       │   │       └── BulletPointEditor.tsx
│       │   └── Toolbar.tsx
│       ├── preview/
│       │   ├── PreviewPanel.tsx
│       │   └── PreviewIframe.tsx
│       ├── templates/
│       │   ├── registry.ts
│       │   ├── MinimalistTemplate.tsx
│       │   ├── TechStackTemplate.tsx
│       │   ├── ExecutiveProTemplate.tsx
│       │   ├── SalesAchieverTemplate.tsx
│       │   ├── CreativePortfolioTemplate.tsx
│       │   ├── HRProfessionalTemplate.tsx
│       │   ├── AcademicCVTemplate.tsx
│       │   └── ... (all 15 templates)
│       ├── dashboard/
│       │   ├── ResumeGrid.tsx
│       │   ├── ResumeCard.tsx
│       │   └── CreateResumeButton.tsx
│       ├── ats/
│       │   ├── AtsScoreBadge.tsx
│       │   ├── AtsBreakdownModal.tsx
│       │   └── KeywordScanner.tsx
│       ├── ai/
│       │   ├── AiEnhanceButton.tsx
│       │   ├── AiSummaryGenerator.tsx
│       │   └── AiTailorPanel.tsx
│       ├── share/
│       │   ├── ShareModal.tsx
│       │   └── PublicResumeView.tsx
│       └── onboarding/
│           └── OnboardingWizard.tsx
├── db/
│   ├── index.ts
│   ├── schema/
│   │   └── resume.ts                       # Drizzle schema (all tables)
│   └── migrations/
├── stores/
│   └── resume-store.ts                     # Zustand store
├── lib/
│   ├── validations/
│   │   └── resume.ts                       # Zod schemas
│   ├── pdf/
│   │   ├── generate-pdf.ts                 # Puppeteer
│   │   ├── generate-latex.ts               # LaTeX (optional)
│   │   └── print.css                       # @media print styles
│   ├── ats/
│   │   ├── scorer.ts                       # Scoring algorithm
│   │   └── keyword-scanner.ts
│   ├── ai/
│   │   ├── prompts.ts                      # All AI prompt templates
│   │   └── rate-limiter.ts
│   ├── import/
│   │   ├── pdf-importer.ts
│   │   ├── json-importer.ts
│   │   └── linkedin-importer.ts
│   ├── skills-catalog.ts                   # Curated skills database
│   └── industry-defaults.ts               # Industry profiles & section orders
└── hooks/
    ├── use-auto-save.ts
    ├── use-preview-sync.ts
    └── use-undo-redo.ts
```

---

## FINAL NOTES FOR CLAUDE OPUS 4.7

1. **Follow the phase order strictly.** Foundation (DB + API + Store) must be solid before building UI.
2. **All forms use react-hook-form + zod for validation.** Never use uncontrolled inputs.
3. **All resume data goes through the Zustand store.** Never mutate data directly in components. Always use store actions.
4. **Every user-facing string must be tooltip-friendly.** Add a `data-tooltip` attribute or wrap in shadcn `<Tooltip>`.
5. **Test edge cases from Phase 9 at every step.** Don't wait until QA week.
6. **The JSONB `data` column in Postgres is the single source of truth.** The Zod schema validates it on every API write.
7. **Templates are pure functions:** `(data, metadata) → HTML`. No side effects, no data fetching.
8. **ATS compatibility is not optional.** Every template must pass basic ATS checks (single-column text flow, standard headings, no images in content).
9. **AI features are additive.** Core resume builder must work fully without AI.
10. **PDF generation must work offline-first.** Use client-side `window.print()` as fallback when server PDF generation fails.

For any clarification or modifications before implementation, please let me know. Otherwise, you can hand this plan directly to your Antigravity IDE with Claude Opus 4.7 and expect a production-ready implementation. I look forward to seeing the results.
