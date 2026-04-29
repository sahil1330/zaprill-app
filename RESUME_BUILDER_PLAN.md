# Resume Builder — Implementation Plan

> Production-grade resume builder integrated into the Zaprill platform.
> Branch: `feat/resume-builder`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Resume Builder                          │
├──────────┬──────────────────┬──────────────┬───────────────────┤
│ Dashboard│   3-Panel Editor │  Live Preview│   PDF Export      │
│ /resumes │   /resumes/[id]  │  (Template)  │   /resumes/[id]/  │
│          │                  │              │    export         │
├──────────┴──────────────────┴──────────────┴───────────────────┤
│                     Redux State (resumeSlice)                  │
│              Auto-Save: 2s local / 15s server                  │
├───────────────────────────────────────────────────────────────┤
│                     API Routes (/api/resumes)                  │
│         CRUD • Duplicate • Versions • Export                   │
├───────────────────────────────────────────────────────────────┤
│                   Neon Postgres (Drizzle ORM)                  │
│         resume • resumeVersion • resumeAtsAnalysis             │
└───────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation ✅

**Commit:** `baf406a`

### Database Schema
- [x] `resumeStatusEnum` — `draft | published | archived`
- [x] `resume` table — core table with JSONB data/metadata, template slug, version counter, download count
- [x] `resumeVersion` table — snapshot history with version numbers
- [x] `resumeAtsAnalysis` table — ATS scoring results storage
- [x] Extended `aiActionEnum` with resume-specific actions (`enhance_bullet`, `roast_resume`, `ats_score`, `tailor_resume`, `generate_summary`)
- [x] Migration generated (`0008_hot_the_santerians.sql`)
- [x] Migration applied via `npx drizzle-kit push`

### Types & Validation
- [x] `src/types/resume.ts` — Full TypeScript interfaces
  - `ResumeData` (basics, work, education, skills, projects, certifications, languages)
  - `ResumeMetadata` (theme, typography, page settings, section visibility)
  - `TemplateMeta`, `ResumeListItem`, section item types
  - Default factories for all types
- [x] `src/lib/validations/resume.ts` — Zod schemas for all sections + API request/response validation

### State Management
- [x] `src/store/resumeSlice.ts` — 560+ line Redux slice
  - Full CRUD for every section (add/update/remove/reorder items)
  - Metadata updates (theme, typography, page, section visibility)
  - Template switching, active section tracking
  - Dirty state tracking for auto-save
- [x] `src/store/store.ts` — Resume reducer integrated, `RootState` and `AppDispatch` exported

### API Routes
- [x] `POST /api/resumes` — Create new resume with defaults
- [x] `GET /api/resumes` — List user's resumes (sorted by updatedAt)
- [x] `GET /api/resumes/[id]` — Fetch single resume (auth-gated)
- [x] `PATCH /api/resumes/[id]` — Update with optimistic locking (version field)
- [x] `DELETE /api/resumes/[id]` — Soft delete
- [x] `POST /api/resumes/[id]/duplicate` — Clone resume with "Copy of" prefix
- [x] `POST /api/resumes/[id]/versions` — Save version snapshot
- [x] `GET /api/resumes/[id]/versions` — List version history

### Dependencies Installed
- `react-hook-form`, `@hookform/resolvers` — Form management
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — Drag-and-drop
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline` — Rich text editing
- `puppeteer-core` — Server-side PDF generation (future)
- `redux-undo` — Undo/redo support (future)

---

## Phase 2: Editor Core ✅

**Commits:** `862e68a` (Editor Core), `b138579` (Forms & Settings)

### Editor Page (`/resumes/[id]`)
- [x] 3-panel layout: Section Nav | Form Editor | Live Preview
- [x] Header with resume title, save status indicator, Save & Export buttons
- [x] `useAutoSave` hook — dual-tier debounce (2s localStorage, 15s server PATCH)
- [x] Redux hydration from API on page load

### Section Forms (7 total)
- [x] **BasicsForm** — Name, title, email, phone, location, URL, social profiles, summary
- [x] **WorkForm** — Company, position, dates, location, summary, bullet highlights
- [x] **EducationForm** — Institution, degree, area, dates, GPA, courses
- [x] **SkillsForm** — Skill groups with keyword tags, proficiency level
- [x] **ProjectsForm** — Name, description, tech stack tags, highlights, GitHub/live URLs, dates
- [x] **CertificationsForm** — Name, issuer, date, credential URL
- [x] **LanguagesForm** — Language name, fluency level dropdown

### Settings Panel
- [x] **Template Picker** — Visual grid with ATS scores, layout badges, premium locks
- [x] **Color Theme** — 4 color pickers (primary, accent, text, background) with hex input
- [x] **Typography** — Font family dropdown (8 fonts), font size slider, line height slider
- [x] **Page Layout** — A4/Letter format, margin slider
- [x] **Section Visibility** — Toggle switches for all 11 sections

### Template System
- [x] Code-driven registry (`src/components/resume/templates/registry.ts`)
- [x] 5 templates defined (3 free, 2 premium slots)
- [x] CSS custom properties for real-time theme updates
- [x] `PreviewPanel` with dynamic template component selection

### Templates Implemented
- [x] **MinimalistTemplate** — Clean single-column, ATS 95%, free
- [x] **TechStackTemplate** — Two-column with skills sidebar, ATS 90%, free

### Dashboard Page (`/resumes`)
- [x] Resume list with card layout
- [x] Create, duplicate, delete actions
- [x] Loading skeleton (`loading.tsx`)

---

## Phase 3: Templates & Export ✅

**Commit:** `d3633d2`

### Templates
- [x] **ExecutiveProTemplate** — Single-column, serif accents, double-border header, square bullets, ATS 92%, free
  - Executive-appropriate section naming: "Executive Summary", "Core Competencies", "Key Initiatives"

### PDF Export
- [x] `POST /api/resumes/[id]/export` — Auth-gated, increments download counter
- [x] `/resumes/[id]/export` page — Print-optimized, auto-triggers `window.print()`
- [x] Print CSS with `@page` rules, `print-color-adjust` for accurate color output
- [x] Export button in editor opens print page in new tab

---

## Phase 4: AI Integration 🔲

> **Status:** Not started

### AI Bullet Enhancement
- [ ] `POST /api/resumes/[id]/ai/enhance` — Takes a bullet point, returns enhanced version with stronger action verbs, quantified impact
- [ ] UI: "Enhance" sparkle button next to each work/project highlight
- [ ] Streaming response for real-time typing effect
- [ ] Uses existing `aiActionEnum.enhance_bullet`

### ATS Scoring
- [ ] `POST /api/resumes/[id]/ai/ats-score` — Analyzes resume against a job description
- [ ] Returns: overall score, keyword matches, missing keywords, section-by-section suggestions
- [ ] Results stored in `resumeAtsAnalysis` table
- [ ] UI: Score card with donut chart, keyword breakdown, actionable tips
- [ ] Uses existing `aiActionEnum.ats_score`

### Resume Roast
- [ ] `POST /api/resumes/[id]/ai/roast` — Brutally honest feedback on the resume
- [ ] Humorous but actionable — highlights weak areas, clichés, formatting issues
- [ ] UI: Chat-bubble style feedback panel
- [ ] Uses existing `aiActionEnum.roast_resume`

### AI Summary Generation
- [ ] `POST /api/resumes/[id]/ai/summary` — Auto-generates professional summary from work/education/skills data
- [ ] Uses existing `aiActionEnum.generate_summary`

### Job Tailoring
- [ ] Connect to existing job analysis data from the platform
- [ ] `POST /api/resumes/[id]/ai/tailor` — Takes a job ID, adjusts resume keywords and ordering
- [ ] Uses existing `aiActionEnum.tailor_resume`

---

## Phase 5: Premium Templates 🔲

> **Status:** Not started — depends on Pro tier payment integration

### Creative Portfolio Template
- [ ] Hybrid layout with color accents and portfolio section
- [ ] Designed for designers, marketers, content creators
- [ ] ATS Score: 82% (visual elements reduce parseability)
- [ ] Premium (Pro tier only)

### Modern Split Template
- [ ] Bold header with sidebar layout
- [ ] Designed for consulting, strategy, and business roles
- [ ] ATS Score: 88%
- [ ] Premium (Pro tier only)

---

## Phase 6: Polish & Advanced Features 🔲

> **Status:** Not started

### Drag-and-Drop Reorder
- [ ] Wire up `@dnd-kit` for reordering work entries, education, skills, projects
- [ ] Visual drag handle on each list item
- [ ] Reorder syncs to Redux → auto-save

### Undo/Redo
- [ ] Wire up `redux-undo` for resumeSlice
- [ ] Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts
- [ ] Undo/Redo buttons in editor header

### Rich Text Editing
- [ ] Replace plain textarea for summary/highlights with Tiptap editor
- [ ] Bold, italic, underline, bullet lists
- [ ] Markdown-style shortcuts

### Version History UI
- [ ] Version list panel in editor
- [ ] Preview past versions
- [ ] Restore to a previous version

### Resume Analytics
- [ ] Dashboard metrics: total downloads, views per resume
- [ ] Per-resume stats: last edited, download count, ATS score trend

---

## File Map

```
src/
├── app/
│   ├── (protected)/resumes/
│   │   ├── page.tsx                    # Dashboard
│   │   ├── loading.tsx                 # Dashboard skeleton
│   │   └── [id]/
│   │       ├── page.tsx                # 3-panel editor
│   │       └── export/page.tsx         # Print-optimized export
│   └── api/resumes/
│       ├── route.ts                    # POST/GET (create, list)
│       └── [id]/
│           ├── route.ts               # GET/PATCH/DELETE
│           ├── duplicate/route.ts     # POST (clone)
│           ├── export/route.ts        # POST (export data)
│           └── versions/route.ts      # POST/GET (versions)
├── components/resume/
│   ├── editor/
│   │   ├── PreviewPanel.tsx           # Dynamic template renderer
│   │   └── sections/
│   │       ├── BasicsForm.tsx
│   │       ├── WorkForm.tsx
│   │       ├── EducationForm.tsx
│   │       ├── SkillsForm.tsx
│   │       ├── ProjectsForm.tsx
│   │       ├── CertificationsForm.tsx
│   │       ├── LanguagesForm.tsx
│   │       └── SettingsForm.tsx
│   └── templates/
│       ├── registry.ts                # Template metadata registry
│       ├── resume-templates.css       # All template styles
│       ├── MinimalistTemplate.tsx
│       ├── TechStackTemplate.tsx
│       └── ExecutiveProTemplate.tsx
├── hooks/
│   └── use-auto-save.ts               # Dual-tier debounced save
├── lib/validations/
│   └── resume.ts                      # Zod schemas
├── store/
│   ├── resumeSlice.ts                 # Redux slice (560+ lines)
│   └── store.ts                       # Root store config
├── types/
│   └── resume.ts                      # TypeScript interfaces
└── db/
    └── schema.ts                      # resume, resumeVersion, resumeAtsAnalysis tables
```

---

## Template Registry

| Template | Slug | Layout | ATS | Tier | Status |
|----------|------|--------|-----|------|--------|
| Minimalist | `minimalist` | Single-column | 95% | Free | ✅ Done |
| Tech Stack | `tech-stack` | Two-column | 90% | Free | ✅ Done |
| Executive Pro | `executive-pro` | Single-column | 92% | Free | ✅ Done |
| Creative Portfolio | `creative-portfolio` | Hybrid | 82% | Pro | 🔲 Planned |
| Modern Split | `modern-split` | Sidebar | 88% | Pro | 🔲 Planned |

---

## Commit History

| Hash | Phase | Description |
|------|-------|-------------|
| `baf406a` | 1 | Foundation — DB schema, types, Redux, API routes |
| `862e68a` | 2 | Editor Core — 3-panel UI, forms, MinimalistTemplate, auto-save |
| `b138579` | 2b | Complete forms, settings, TechStackTemplate |
| `d3633d2` | 3 | ExecutiveProTemplate, PDF export, wiring |
