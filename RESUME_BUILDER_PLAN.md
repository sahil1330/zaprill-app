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

## Phase 4: AI Integration ✅

**Commits:** Phase 4a (`commit`), Phase 4b (`f2b8114`), Phase 4c (`efdb8d7`)

### Phase 4a: AI Content Enhancement ✅
- [x] `POST /api/resumes/[id]/ai/enhance` — Rewrites bullet points with stronger action verbs, STAR method, quantified impact
- [x] UI: "✨ Enhance" sparkle button next to each work/project highlight
- [x] Uses `aiActionEnum.enhance_bullet`
- [x] AI usage tracking with `logAiUsage` (inputTokens/outputTokens)

### Phase 4a: AI Summary Generation ✅
- [x] `POST /api/resumes/[id]/ai/summary` — Auto-generates professional summary from work/education/skills data
- [x] UI: "✨ Generate with AI" button in BasicsForm summary section
- [x] Uses `aiActionEnum.generate_summary`

### Phase 4b: ATS Scoring ✅
- [x] `POST /api/resumes/[id]/ai/ats-score` — Analyzes resume against optional job description
- [x] Returns: overall score, keyword matches, missing keywords, section-by-section suggestions
- [x] Results stored in `resumeAtsAnalysis` table + cached on `resume.lastAtsScore`
- [x] UI: `AtsScorePanel` with score visualization, keyword breakdown, actionable tips
- [x] Shield icon in editor sidebar navigation

### Phase 4c: Resume Roast ✅
- [x] `POST /api/resumes/[id]/ai/roast` — Stand-up comedy style resume critique
- [x] Humorous but actionable — highlights weak areas, clichés, formatting issues
- [x] UI: `RoastDialog` Sheet with chat-bubble style feedback, "Roast Again" button
- [x] 🔥 Roast button in editor header

### Rate Limiting
- [x] Client-side locking during AI requests (`isGenerating` / `enhancingKey` states)

---

## Phase 5: Premium Templates ✅

**Commit:** `61f63ff`

### Creative Portfolio Template ✅
- [x] Vibrant gradient header accent, colored skill tags, portfolio card grid
- [x] Designed for designers, marketers, content creators
- [x] ATS Score: 82% (visual elements reduce parseability)
- [x] Premium (Pro tier only)

### Modern Split Template ✅
- [x] Bold split header, sidebar layout with skills/education on left, experience on right
- [x] Designed for consulting, strategy, and business roles
- [x] ATS Score: 88%
- [x] Premium (Pro tier only)

### Infrastructure
- [x] CSS styles with CSS custom properties for theme support
- [x] Registered in `PreviewPanel` component map
- [x] Premium gating in template registry

---

## Phase 6: Polish & Advanced Features ✅ (Partial)

### Drag-and-Drop Reorder ✅
**Commit:** `159b5f0`
- [x] Created reusable `SortableItem` component with drag handle overlay
- [x] `WorkForm` — DndContext + SortableContext + SortableItem
- [x] `EducationForm` — drag-and-drop reordering
- [x] `SkillsForm` — drag-and-drop reordering
- [x] `ProjectsForm` — drag-and-drop reordering
- [x] All dispatch existing `reorder*Items` Redux actions

### Rich Text Editing ✅
**Commit:** `70fceb6`
- [x] `RichTextEditor` component — Tiptap with toolbar (bold/italic/strike/list/undo/redo)
- [x] Minimal mode option for inline fields
- [x] External value sync for AI-generated content
- [x] Placeholder extension support
- [x] Integrated in `BasicsForm` Professional Summary field

### Remaining (Future)
- [ ] Undo/Redo — Wire up `redux-undo` for resumeSlice, Ctrl+Z/Ctrl+Shift+Z
- [ ] Version History UI — Version list panel, preview past versions, restore
- [ ] Resume Analytics — Dashboard metrics, per-resume stats
- [ ] Job Tailoring — Connect to job analysis, `POST /api/resumes/[id]/ai/tailor`

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
│           ├── versions/route.ts      # POST/GET (versions)
│           └── ai/
│               ├── enhance/route.ts   # POST (bullet enhancement)
│               ├── summary/route.ts   # POST (summary generation)
│               ├── ats-score/route.ts # POST (ATS analysis)
│               └── roast/route.ts     # POST (resume roast)
├── components/resume/
│   ├── editor/
│   │   ├── PreviewPanel.tsx           # Dynamic template renderer
│   │   ├── RichTextEditor.tsx         # Tiptap rich text component
│   │   ├── RoastDialog.tsx            # AI roast sheet dialog
│   │   ├── SortableItem.tsx           # dnd-kit drag-and-drop wrapper
│   │   └── sections/
│   │       ├── AtsScorePanel.tsx
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
│       ├── ExecutiveProTemplate.tsx
│       ├── CreativePortfolioTemplate.tsx  # Premium
│       └── ModernSplitTemplate.tsx        # Premium
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
| Creative Portfolio | `creative-portfolio` | Hybrid | 82% | Pro | ✅ Done |
| Modern Split | `modern-split` | Sidebar | 88% | Pro | ✅ Done |

---

## Commit History

| Hash | Phase | Description |
|------|-------|-------------|
| `baf406a` | 1 | Foundation — DB schema, types, Redux, API routes |
| `862e68a` | 2 | Editor Core — 3-panel UI, forms, MinimalistTemplate, auto-save |
| `b138579` | 2b | Complete forms, settings, TechStackTemplate |
| `d3633d2` | 3 | ExecutiveProTemplate, PDF export, wiring |
| — | 4a | AI bullet enhancement + summary generation |
| `f2b8114` | 4b | ATS scoring engine with analysis panel |
| `efdb8d7` | 4c | Resume Roast with comedy-style AI critique |
| `61f63ff` | 5 | Premium templates (Creative Portfolio + Modern Split) |
| `159b5f0` | 6a | Drag-and-drop reordering with dnd-kit |
| `70fceb6` | 6b | Rich text editing with Tiptap |

