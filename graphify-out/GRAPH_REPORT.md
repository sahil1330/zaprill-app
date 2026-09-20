# Graph Report - workspace  (2026-09-20)

## Corpus Check
- 361 files · ~237,450 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 4, .woff2 3, .mdc 2)

## Summary
- 2474 nodes · 6550 edges · 186 communities (124 shown, 62 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 441 edges (avg confidence: 0.96)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `85cb8058`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- db/index.ts
- dependencies
- react
- SkillsForm.tsx
- referral.service.ts
- WebhookService
- cn
- coupons-content.tsx
- analytics.ts
- analyze/page.tsx
- sidebar.tsx
- Resend
- What You Must Do When Invoked
- schema.ts
- Resume Editor
- biome.json
- user
- lib/auth.ts
- parse-resume/route.ts
- types/resume.ts
- package.json
- [id]/page.tsx
- Resume Architect — Implementation Plan
- webhook.service.ts
- admin-header.tsx
- Neon Serverless Postgres
- Neon Serverless Postgres
- components.json
- resumeSlice
- SettingsForm.tsx
- resumes/page.tsx
- checkout/route.ts
- 04-production-hardening.spec.ts
- helpers/audit.ts
- sanitize.ts
- 🌍 World-Class Multi-Industry Resume Architect — Complete Implementation Plan for Claude Opus 4.7
- onboarding/page.tsx
- Architecture Guidelines
- PHASE 9: KEY EDGE CASES & ERROR HANDLING
- card.tsx
- AnalyzePageContent (Main Analysis Engine)
- SkillGapPanel.tsx
- PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER
- data-table.tsx
- invoice-email.ts
- PHASE 7: AI-POWERED FEATURES
- Root Layout
- Resume Builder Actual Implementation Plan
- profile/page.tsx
- scripts
- coupon.service.ts
- PHASE 3: RESUME EDITOR & FORM BUILDER
- LearningRoadmap.tsx
- lucide-react
- compilerOptions
- Google Analytics 4
- subscription.service.ts
- resume-editor.ts
- PHASE 5: PDF GENERATION STRATEGY (DUAL-ENGINE)
- PHASE 2: TEMPLATE SYSTEM ARCHITECTURE
- AGENTS.md
- PHASE 6: ATS OPTIMIZATION ENGINE
- PHASE 1: DATABASE SCHEMA DESIGN (Drizzle ORM)
- PHASE 10: USER EXPERIENCE & TOOLTIPS
- README.md
- useAuth
- types/index.ts
- ats-score/route.ts
- app/layout.tsx
- avatar.tsx
- PHASE 0: PRE-IMPLEMENTATION PREPARATION
- PHASE 8: INDUSTRY-SPECIFIC SMART DEFAULTS
- AdminHeader â€” HQ top bar with breadcrumb nav, search, notifications, user menu
- seed-plans.ts
- app-shell.tsx
- next
- billing.ts
- job_titles
- user-actions-client.tsx
- ClientProvider.tsx
- badge.tsx
- GitHub project method (mandatory)
- scripts
- devDependencies
- chart.tsx
- sendMail
- Globe (World) Icon
- DataTable â€” Generic admin data table with sort/filter/paginate/export capabilities
- POST /api/referrals/claim
- saveToLocal
- utils.ts
- tailor/route.ts
- analyze-gaps/route.ts
- analytics/route.ts
- job-titles.ts
- validations/resume.ts
- Adzuna API
- Quick Reference
- career-insights/route.ts
- File Document Icon (SVG)
- Application Logo (Branding Asset)
- Next.js Logotype Brand Asset
- Vercel Logo
- Window Icon
- Apple Touch Icon
- postcss.config.mjs
- PNPM Workspace Configuration
- Next.js Starter README
- ChoiceCard (Onboarding Option)
- referrals/page.tsx
- GoogleIcon
- skill_category
- skill_priority
- influencer_commission_type
- useMobile
- useIsMobile
- useAnalytics
- useAuth
- captureReferralCode
- getStoredReferralCode
- claimStoredReferral
- useReferralClaim
- gtag
- track
- clearUserId
- startHeartbeat
- getCompanySettings
- getReferralSettings
- getSettingValue
- setSettingValue
- saveCompanySettings
- getBaseUrl
- CompanySettings
- ReferralSettings
- JobEventParams
- ResumeFileParams
- ResumeParseSuccessParams
- AppSettingKey
- APP_SETTING_KEYS
- MOBILE_BREAKPOINT
- GA_MEASUREMENT_ID
- STORAGE_KEY
- billing-invoice-table.tsx
- UI/UX Pro Max - Design Intelligence
- compilerOptions
- cashfree.ts
- input-group.tsx
- app/page.tsx
- Frontend Design
- generate-report.ts
- ResumeData
- Pre-Delivery Checklist
- How to Use This Skill
- @playwright/test
- PreviewPanel.tsx
- ErrorBoundary
- Common Rules for Professional UI
- Example Workflow
- ResumeScanResults.tsx
- JobCard.tsx
- PlansContent
- ResourcesContent
- ReferralsPage
- ReferralPanel
- Tips for Better Results
- When to Apply
- migrate.ts
- (protected)/billing/page.tsx
- rules/graphify.md
- workflows/graphify.md
- pre-commit
- test-result.js
- MemeLoader â€” Playful loading screen with animated GIFs during job search/analysis
- DELETE /api/billing/subscription
- { signIn, signOut, signUp, useSession, getSession }
- file-upload.tsx
- (auth)/layout.tsx
- drizzle.config.ts
- get-refresh-token.js
- invoice.service.ts
- GITHUB_PROJECT.md
- ProjectsForm.tsx
- app_settings

## God Nodes (most connected - your core abstractions)
1. `cn()` - 218 edges
2. `react` - 128 edges
3. `lucide-react` - 103 edges
4. `next` - 94 edges
5. `Button()` - 77 edges
6. `drizzle-orm` - 59 edges
7. `Card()` - 57 edges
8. `db` - 56 edges
9. `CardContent()` - 55 edges
10. `auth` - 54 edges

## Surprising Connections (you probably didn't know these)
- `Interaction (App)` --references--> `Button()`  [INFERRED]
  .agents/skills/ui-ux-pro-max/SKILL.md → src/components/ui/button.tsx
- `Burn-in (after every fix, before moving on)` --references--> `main()`  [INFERRED]
  .agents/GITHUB_PROJECT.md → e2e/ux-audit/generate-report.ts
- `Required workflow` --references--> `main()`  [INFERRED]
  .agents/GITHUB_PROJECT.md → e2e/ux-audit/generate-report.ts
- `Root Layout` --references--> `shadcn/ui Design System`  [INFERRED]
  src/app/layout.tsx → diff.txt
- `404 Not Found Page` --references--> `shadcn/ui Design System`  [INFERRED]
  src/app/not-found.tsx → diff.txt

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Dual-Layer Authentication Guard** — src_proxy_middleware, src_app_auth_layout, better_auth [EXTRACTED 1.00]
- **Neon PostgreSQL Infrastructure Setup** — neon_db, drizzle_config, scratch_test_neon_script [INFERRED 0.75]
- **Resume Builder Architecture Triad** — resume_builder_architecture, resume_data_schema, template_system [INFERRED 0.75]
- **Resume Template System** — CreativePortfolioTemplate, ExecutiveProTemplate, MinimalistTemplate, ModernSplitTemplate, TechStackTemplate [INFERRED]
- **Dialog Primitives Duo** — AlertDialog, Dialog [INFERRED]
- **External Specialized Library Consumers** — Chart, FileUpload [INFERRED]
- **Composition Over Primitives** — InputGroup, Command [INFERRED]
- **Inline Conditional Rendering Pattern** — ModernSplitTemplate, TechStackTemplate [INFERRED]
- **sectionRenderers Pattern** — CreativePortfolioTemplate, ExecutiveProTemplate, MinimalistTemplate [INFERRED]
- **class-variance-authority Consumers** — Button, Badge, InputGroup, Field [INFERRED]
- **@base-ui/react Primitive Consumers** — AlertDialog, Avatar, Button, Checkbox, Dialog, DropdownMenu, Input [INFERRED]
- **Subscription Plan Tiers** — seed_plans_ts, subscription_plans, subscription_service_ts, billing_types_ts [INFERRED]
- **Resume Type System** — resume_types_ts, resume_data_default, resume_metadata_default, inferred_job_titles_field, resume_slice_ts, index_types_ts [INFERRED]
- **Referral System Full Flow** — referral_service_ts, webhook_service_ts, coupon_service_ts, app_settings_lib, billing_utils_lib, nanoid, drizzle_orm [INFERRED]
- **Database Seeding Pipeline** — seed_job_titles_ts, seed_plans_ts, subscription_plans, title_normalizer_lib, drizzle_orm, neon_db, nanoid [INFERRED]
- **Redux State Architecture** — store_ts, auth_slice_ts, resume_slice_ts, providers_tsx, redux_toolkit, auth_types_ts, resume_types_ts [INFERRED]
- **Billing Module Dependency Chain** — webhook_service_ts, invoice_service_ts, payment_service_ts, subscription_service_ts, coupon_service_ts, referral_service_ts, billing_utils_lib, billing_types_ts, cashfree [INFERRED]
- **AI Usage Cost Tracking** — usage_service_ts, model_rates_table, drizzle_orm, nanoid [INFERRED]

## Communities (186 total, 62 thin omitted)

### Community 0 - "cn"
Cohesion: 0.07
Nodes (40): cmdk, INDIA_CITIES, LocationComboboxProps, CardAction(), Command(), CommandDialog(), CommandEmpty(), CommandGroup() (+32 more)

### Community 1 - "db/index.ts"
Cohesion: 0.07
Nodes (27): drizzle-orm, @neondatabase/serverless, ALLOWED_TABLES, GET(), GET(), GET(), GET(), GET() (+19 more)

### Community 2 - "dependencies"
Cohesion: 0.04
Nodes (54): dependencies, ai, @ai-sdk/google, @ai-sdk/openai, @base-ui/react, better-auth, cashfree-pg, class-variance-authority (+46 more)

### Community 3 - "react"
Cohesion: 0.09
Nodes (16): date-fns, react, recharts, AnalyticsContent(), AnalyticsData, AuditList(), AuditLog, BillingContent() (+8 more)

### Community 4 - "SkillsForm.tsx"
Cohesion: 0.09
Nodes (49): @hookform/resolvers, react-hook-form, react-redux, zod, AwardsForm(), awardsFormSchema, AwardsFormValues, BasicsForm() (+41 more)

### Community 5 - "referral.service.ts"
Cohesion: 0.09
Nodes (36): Referral Service (@/services/billing/referral.service), Referral Claim API (POST /api/referrals/claim), Referral Validate API (GET /api/referrals/validate), dynamic, GET(), POST(), requireAdmin(), dynamic (+28 more)

### Community 6 - "WebhookService"
Cohesion: 0.14
Nodes (25): app-settings, Billing Retry API (POST /api/billing/retry), Billing Subscription API (GET/DELETE /api/billing/subscription), BillingTypes, Billing Utilities (@/lib/billing-utils), Billing Webhook API (POST /api/billing/webhook), Cashfree, Cashfree Integration (@/lib/cashfree) (+17 more)

### Community 7 - "cn"
Cohesion: 0.11
Nodes (39): @base-ui/react, @tabler/icons-react, AlertDialog, Avatar, Badge, Breadcrumb, Button, Card (+31 more)

### Community 8 - "coupons-content.tsx"
Cohesion: 0.13
Nodes (21): @base-ui/react, CouponsContent(), EMPTY_FORM, Props, STATUS_VARIANT, EMPTY_FORM, Props, EMPTY_FORM (+13 more)

### Community 9 - "analytics.ts"
Cohesion: 0.16
Nodes (42): HomePage(), AnalyzePageContent(), AnalyticsProvider(), useAnalytics(), clearUserId(), GA_MEASUREMENT_ID, gtag(), GtagCommand (+34 more)

### Community 10 - "analyze/page.tsx"
Cohesion: 0.12
Nodes (23): TabId, TABS, AnalysisError(), AnalysisErrorProps, JobFilters(), JobFiltersProps, AnalyzeNeedsResume(), ParsingProgress() (+15 more)

### Community 11 - "sidebar.tsx"
Cohesion: 0.10
Nodes (31): AdminHeader(), AdminSidebar(), items, SheetDescription(), Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps (+23 more)

### Community 13 - "What You Must Do When Invoked"
Cohesion: 0.06
Nodes (33): For --cluster-only, For git commit hook, For /graphify add, For /graphify explain, For /graphify path, For /graphify query, For native CLAUDE.md integration, For --update (incremental re-extraction) (+25 more)

### Community 14 - "schema.ts"
Cohesion: 0.07
Nodes (25): resend, resend, account, aiActionEnum, billingCycleEnum, billingReasonEnum, couponStatusEnum, couponTypeEnum (+17 more)

### Community 15 - "Resume Editor"
Cohesion: 0.16
Nodes (31): AI Resume Features, POST /api/resumes/{id}/ai/ats-score, POST /api/resumes/{id}/ai/enhance, POST /api/resumes/{id}/ai/roast, POST /api/resumes/{id}/ai/summary, POST /api/resumes/{id}/ai/tailor, GET /api/billing/subscription, AtsScorePanel (+23 more)

### Community 16 - "biome.json"
Cohesion: 0.06
Nodes (31): source, assist, actions, next, react, files, ignoreUnknown, includes (+23 more)

### Community 17 - "user"
Cohesion: 0.06
Nodes (45): account, ai_usage_log, audit_log, coupon_usage, coupons, ai_action, billing_cycle, billing_reason (+37 more)

### Community 18 - "lib/auth.ts"
Cohesion: 0.08
Nodes (45): Admin Analytics (GA4) Endpoint, Admin Audit Log Endpoint, Admin Database Browser Endpoint, Admin Emails (Resend) Endpoint, Admin Referrals Management Endpoint, Admin Learning Resources CRUD Endpoint, Admin Settings (Plans & Coupons) Endpoint, Admin Stats (Revenue, AI, Growth) Endpoint (+37 more)

### Community 19 - "parse-resume/route.ts"
Cohesion: 0.12
Nodes (20): maxDuration, MODEL, POST(), ResumeSchema, GET(), PATCH(), PATCH(), RouteParams (+12 more)

### Community 20 - "types/resume.ts"
Cohesion: 0.09
Nodes (25): calculateTotalExperience(), extractJobTitles(), parseDate(), RESUME_LIMITS, initialState, resumeSlice, TailoredPayload, AtsBreakdown (+17 more)

### Community 21 - "package.json"
Cohesion: 0.06
Nodes (33): tsx, name, private, version, @ai-sdk/google, babel-plugin-react-compiler, @biomejs/biome, clsx (+25 more)

### Community 22 - "[id]/page.tsx"
Cohesion: 0.12
Nodes (20): ResumeEditorPage(), SECTIONS, TOOLS, ResumeEditorErrorFallback(), RoastDialog(), AtsScorePanel(), PublicationsForm(), SkillsForm() (+12 more)

### Community 23 - "Resume Architect — Implementation Plan"
Cohesion: 0.05
Nodes (37): API Routes, Architecture Overview, code:block1 (┌───────────────────────────────────────────────────────────), code:block2 (src/), Commit History, Creative Portfolio Template ✅, Dashboard Page (`/resumes`), Database Schema (+29 more)

### Community 24 - "webhook.service.ts"
Cohesion: 0.18
Nodes (21): GET(), GET(), getCompanySettings(), getCouponUsageByInvoice(), redeemCoupon(), attachSubscriptionToInvoice(), getInvoiceByCashfreeOrderId(), markInvoiceFailed() (+13 more)

### Community 25 - "admin-header.tsx"
Cohesion: 0.13
Nodes (24): MutatePayload, UserRowActionsProps, NavbarProps, ThemeToggle(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+16 more)

### Community 26 - "Neon Serverless Postgres"
Cohesion: 0.08
Nodes (24): Autoscaling, Branching, Connection Methods & Drivers, Connection Pooling, Developer Tools, Fetching Docs as Markdown, Finding the Right Page, Getting Started (+16 more)

### Community 27 - "Neon Serverless Postgres"
Cohesion: 0.08
Nodes (24): Autoscaling, Branching, Connection Methods & Drivers, Connection Pooling, Developer Tools, Fetching Docs as Markdown, Finding the Right Page, Getting Started (+16 more)

### Community 28 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 29 - "resumeSlice"
Cohesion: 0.22
Nodes (13): authSlice, AuthState, CoreTypes, inferred_job_titles, next-themes, Providers, Redux Toolkit, DEFAULT_RESUME_DATA (+5 more)

### Community 30 - "SettingsForm.tsx"
Cohesion: 0.10
Nodes (20): @dnd-kit/core, @dnd-kit/sortable, EducationForm(), educationFormSchema, EducationFormValues, FONT_OPTIONS, PAGE_FORMATS, SECTION_LABELS (+12 more)

### Community 31 - "resumes/page.tsx"
Cohesion: 0.10
Nodes (20): ResumeThumbnail (Template Preview), GET+PATCH+DELETE /api/resumes/[id], POST /api/resumes/[id]/duplicate, POST /api/resumes/[id]/export, db (Drizzle ORM Database), db/schema (Drizzle Tables - plan, subscription, invoice, coupons, userProfile, resume), resumeSlice (Redux Resume Editor State), Redux Store (+12 more)

### Community 32 - "checkout/route.ts"
Cohesion: 0.23
Nodes (17): maxDuration, POST(), POST(), BillingError, calculatePeriodEnd(), generateId(), generateIdempotencyKey(), nanoid (+9 more)

### Community 33 - "04-production-hardening.spec.ts"
Cohesion: 0.22
Nodes (14): deleteExtraResumes(), ensureResume(), getResume(), listResumes(), patchResume(), resetResumeToBaseline(), ResumeBasics, ResumeData (+6 more)

### Community 34 - "helpers/audit.ts"
Cohesion: 0.20
Nodes (14): CORE_ROUTES, assertPageLoaded(), captureScreen(), countVisibleCTAs(), ensureReportDir(), FINDINGS_FILE, FindingSeverity, getPrimaryHeadings() (+6 more)

### Community 35 - "sanitize.ts"
Cohesion: 0.17
Nodes (21): asRichText(), clampResumeData(), clampStringList(), clampTailoredPayload(), clampText(), escapeHtml(), isBlank(), isBlankAwardItem() (+13 more)

### Community 36 - "🌍 World-Class Multi-Industry Resume Architect — Complete Implementation Plan for Claude Opus 4.7"
Cohesion: 0.11
Nodes (17): 11.1 Export Formats, 11.2 Public Sharing, 12.1 User Dashboard, 12.2 Duplicate Resume, 14.1 Performance Optimizations, 14.2 Deployment Checklist, 4.1 Architecture, 4.2 Preview Communication (+9 more)

### Community 37 - "onboarding/page.tsx"
Cohesion: 0.10
Nodes (19): POST /api/parse-resume, GET+PATCH /api/profile, POST /api/resumes/[id]/ai/ats-score, GET+POST /api/resumes, motion, ResumeScanResults Component, ResumeScannerLoader Component, AtsResult (+11 more)

### Community 38 - "Architecture Guidelines"
Cohesion: 0.18
Nodes (11): 1. Separation of Frontend and Backend, 2. API Routes over Server Actions, 3. Client-Side Data Fetching, 4. When to use Server Components, 5. Security and Validation, 6.1. High-Level System Architecture, 6.2. Database Entity Relationship Diagram (ERD), 6.3. Directory Map & Responsibilities (+3 more)

### Community 39 - "PHASE 9: KEY EDGE CASES & ERROR HANDLING"
Cohesion: 0.15
Nodes (13): 9.10 Mobile/Tablet Responsiveness, 9.11 Skill Database / Autocomplete, 9.12 Import Existing Resume, 9.1 Content Overflow / Multi-Page, 9.2 Data Loss Prevention, 9.3 Rich Text HTML Injection (XSS), 9.4 Large File / Image Handling, 9.5 PDF Generation Timeouts (Serverless) (+5 more)

### Community 40 - "card.tsx"
Cohesion: 0.13
Nodes (17): GET+POST /api/referrals, OverviewStats, StatsCards(), AUTH_FEATURES, AuthConfigTab(), TRUSTED_ORIGINS, CompanyTab(), EMPTY (+9 more)

### Community 41 - "AnalyzePageContent (Main Analysis Engine)"
Cohesion: 0.14
Nodes (14): AnalyzePageContent (Main Analysis Engine), GET /api/analysis-history/[id], POST /api/analyze-gaps, POST /api/save-analysis, POST /api/search-jobs, JobCard (Job Match Card), JobTitleAutocomplete Component, LearningRoadmap Component (+6 more)

### Community 42 - "SkillGapPanel.tsx"
Cohesion: 0.20
Nodes (11): AnalyzeTypes â€” ReviewState and FilterState type definitions for the analyze workflow, JobFilters â€” Advanced job filter panel (title, city, work type, emp type, match score, salary), ParsingProgress â€” Resume parsing progress panel with ProgressTimeline and skill preview, ProfileReview â€” Post-parse profile editor for skills, job titles, and experience before analysis, ResultsHeader â€” Analysis results header with user profile card and summary stat cards, StatCard â€” Simple stat display card with large value + label (used in results header), SkillBadge(), SkillBadgeProps (+3 more)

### Community 43 - "PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER"
Cohesion: 0.18
Nodes (11): PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER, Week 10: Testing & QA, Week 1: Foundation, Week 2: Editor Shell, Week 3: All Form Sections, Week 4: Templates, Week 5: PDF Generation, Week 6: ATS Engine (+3 more)

### Community 44 - "data-table.tsx"
Cohesion: 0.14
Nodes (26): @tanstack/react-table, DatabasePage(), applyMutation(), buildColumns(), MutatePayload, User, UsersTable(), DataTable() (+18 more)

### Community 45 - "invoice-email.ts"
Cohesion: 0.15
Nodes (21): Invoice Generation, InvoicePdf, @react-pdf/renderer, GET(), CompanyTabProps, billingReasonLabel(), colors, fmtDate() (+13 more)

### Community 46 - "PHASE 7: AI-POWERED FEATURES"
Cohesion: 0.22
Nodes (9): 7.1 AI Bullet Point Writer, 7.2 AI Summary Generator, 7.3 AI Tailoring (Resume ↔ Job Description), 7.4 AI Resume Roast / Feedback, code:typescript (// Prompt template:), code:typescript (// Prompt template:), code:typescript (// Steps:), code:typescript (// Prompt: "You are a brutally honest career coach. Analyze ) (+1 more)

### Community 47 - "Root Layout"
Cohesion: 0.24
Nodes (9): Global CSS Migration to shadcn Theme, Home Page (Landing), nextConfig, Root Layout, shadcn/ui Design System, Global Error Boundary, Global Loading Component, 404 Not Found Page (+1 more)

### Community 48 - "Resume Builder Actual Implementation Plan"
Cohesion: 0.28
Nodes (9): Resume Builder Actual Implementation Plan, AI-Powered Resume Features, ATS (Applicant Tracking System) Scoring Engine, Deepseek Resume Builder Comprehensive Plan, Dual-Engine PDF Export, Resume Builder Architecture (3-Panel Editor), Resume Builder Database Schema, ResumeData JSONB Schema (JSON Resume Extended) (+1 more)

### Community 49 - "profile/page.tsx"
Cohesion: 0.13
Nodes (17): JobListItem (Tracked Job Card), POST+DELETE /api/save-job, GET /api/user-jobs, sonner, ResumeUploader Component, EmailsContent(), SettingsContent(), TrackedJob (+9 more)

### Community 50 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:generate, db:migrate, db:push, db:seed-plans, db:studio, db:test-user (+12 more)

### Community 51 - "coupon.service.ts"
Cohesion: 0.17
Nodes (13): pg, POST(), src_db_index_schema, buildDirectUrl(), getPool(), withTransaction(), coupons, couponUsage (+5 more)

### Community 52 - "PHASE 3: RESUME EDITOR & FORM BUILDER"
Cohesion: 0.25
Nodes (8): 3.1 Editor Layout (Three-Panel Design), 3.2 Section Components (shadcn/ui based), 3.3 Form State Management, 3.4 Validation Rules (Zod Schemas), code:block5 (+------------------+---------------------------+------------), code:typescript (// src/stores/resume-store.ts), code:typescript (// src/lib/validations/resume.ts), PHASE 3: RESUME EDITOR & FORM BUILDER

### Community 53 - "LearningRoadmap.tsx"
Cohesion: 0.31
Nodes (8): LearningRoadmap(), LearningRoadmapProps, PRIORITY_STYLES, RESOURCE_ICONS, RoadmapCard(), trackResourceLinkClicked(), trackRoadmapItemExpanded(), RoadmapItem

### Community 54 - "lucide-react"
Cohesion: 0.09
Nodes (27): SignInForm (Client Component), SignUpForm (Client Component), GET /api/referrals/validate, auth-client (Better-Auth Client), checkUserExists (Server Action), authSlice (Redux Auth State), lucide-react, SignInForm() (+19 more)

### Community 55 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 56 - "Google Analytics 4"
Cohesion: 0.29
Nodes (7): better-auth/client/plugins, Google Analytics 4, setUserId, trackPageView, analytics, auth-client, useAnalytics

### Community 57 - "subscription.service.ts"
Cohesion: 0.19
Nodes (13): ClientProvider (Session-User Bridge), GET(), BillingPage(), statusBadgeLabel(), CheckoutPageProps, metadata, AuthLayout(), plan (+5 more)

### Community 58 - "resume-editor.ts"
Cohesion: 0.20
Nodes (18): ResumeRecord, addSocialProfile(), dismissValidationDialog(), expectValidationDialog(), expectValidationFeedback(), fillBasicsEmail(), fillBasicsName(), fillPersonalWebsite() (+10 more)

### Community 59 - "PHASE 5: PDF GENERATION STRATEGY (DUAL-ENGINE)"
Cohesion: 0.33
Nodes (6): 5.1 Strategy Overview, 5.2 HTML-to-PDF Pipeline (Puppeteer), 5.3 LaTeX Pipeline (Optional Premium Feature), code:typescript (// src/lib/pdf/generate-pdf.ts), code:typescript (// src/lib/pdf/generate-latex.ts), PHASE 5: PDF GENERATION STRATEGY (DUAL-ENGINE)

### Community 60 - "PHASE 2: TEMPLATE SYSTEM ARCHITECTURE"
Cohesion: 0.33
Nodes (6): 2.1 Template Categories by Industry, 2.2 Template Component Interface, 2.3 Template Rendering Pipeline, 2.4 Metadata-Driven Customization, code:typescript (// src/components/resume/templates/types.ts), PHASE 2: TEMPLATE SYSTEM ARCHITECTURE

### Community 61 - "AGENTS.md"
Cohesion: 0.40
Nodes (4): graphify, Knowledge Graph, Project Architecture Rules, This is NOT the Next.js you know

### Community 62 - "PHASE 6: ATS OPTIMIZATION ENGINE"
Cohesion: 0.40
Nodes (5): 6.1 ATS Scoring Algorithm, 6.2 Keyword Scanner, 6.3 ATS Checker UI, code:typescript (// src/lib/ats/keyword-scanner.ts), PHASE 6: ATS OPTIMIZATION ENGINE

### Community 63 - "PHASE 1: DATABASE SCHEMA DESIGN (Drizzle ORM)"
Cohesion: 0.40
Nodes (5): 1.1 Core Tables, 1.2 JSONB Data Shape (the `data` column), code:typescript (// src/db/schema/resume.ts), code:typescript (// TypeScript type for resumes.data (not stored as a table, ), PHASE 1: DATABASE SCHEMA DESIGN (Drizzle ORM)

### Community 64 - "PHASE 10: USER EXPERIENCE & TOOLTIPS"
Cohesion: 0.40
Nodes (5): 10.1 Tooltip System, 10.2 Onboarding Flow, 10.3 Progress Tracker, code:block16 (Step 1: Welcome → "Let's build your professional resume in 5), PHASE 10: USER EXPERIENCE & TOOLTIPS

### Community 65 - "README.md"
Cohesion: 0.40
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

### Community 66 - "useAuth"
Cohesion: 0.40
Nodes (5): next/navigation, react-redux, useAuth, useAutoSave, /sign-in

### Community 67 - "types/index.ts"
Cohesion: 0.11
Nodes (25): CONTEXT_PATTERNS, SKILLS_TAXONOMY, SKILL_ALIASES, JOB_MEMES, JOB_MESSAGES, MemeLoader(), JobCardProps, LockedJobCardProps (+17 more)

### Community 68 - "ats-score/route.ts"
Cohesion: 0.13
Nodes (28): AI Usage Logging Service (@/services/ai/usage.service), Auth Library (@/lib/auth), Resume ATS Analysis DB Table (resumeAtsAnalysis), Resume Version DB Table (resumeVersion), User Profile DB Table (userProfile), Duplicate Resume API (POST /api/resumes/[id]/duplicate), Enhance Bullet AI API (POST /api/resumes/[id]/ai/enhance), Export Resume API (POST /api/resumes/[id]/export) (+20 more)

### Community 69 - "app/layout.tsx"
Cohesion: 0.15
Nodes (13): next-themes, @next/third-parties, @vercel/speed-insights, src_app_globals, inter, metadata, RootLayout(), satoshi (+5 more)

### Community 70 - "avatar.tsx"
Cohesion: 0.25
Nodes (9): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), getInitials(), UserAvatar() (+1 more)

### Community 71 - "PHASE 0: PRE-IMPLEMENTATION PREPARATION"
Cohesion: 0.50
Nodes (4): 0.1 Tech Stack Inventory (Already in Place), 0.2 New Dependencies to Install, code:bash (# Drag and Drop), PHASE 0: PRE-IMPLEMENTATION PREPARATION

### Community 72 - "PHASE 8: INDUSTRY-SPECIFIC SMART DEFAULTS"
Cohesion: 0.50
Nodes (4): 8.1 Industry Profiles, 8.2 Section Reordering Per Industry, code:typescript (const industrySectionOrder: Record<string, string[]> = {), PHASE 8: INDUSTRY-SPECIFIC SMART DEFAULTS

### Community 73 - "AdminHeader â€” HQ top bar with breadcrumb nav, search, notifications, user menu"
Cohesion: 0.50
Nodes (4): AdminHeader â€” HQ top bar with breadcrumb nav, search, notifications, user menu, AdminSidebar â€” HQ sidebar with navigation links (Overview, Users, Database, Analytics, etc.), ThemeProvider â€” Wrapper around next-themes NextThemesProvider, ThemeToggle â€” Light/dark/system toggle using next-themes useTheme

### Community 74 - "seed-plans.ts"
Cohesion: 0.20
Nodes (6): dotenv, cleanUrl, coupons, db, plans, sql

### Community 75 - "app-shell.tsx"
Cohesion: 0.19
Nodes (14): AppHeader(), AppShell(), AppShellProps, MobileBottomNav(), UserSidebar(), NavUser, ALL_APP_NAV, APP_NAV_PRIMARY (+6 more)

### Community 76 - "next"
Cohesion: 0.08
Nodes (26): Job Title Aliases DB Table (jobTitleAliases), Job Titles DB Table (jobTitles), Learning Resources DB Table (learningResources), Resource Clicks DB Table (resourceClicks), nanoid, next, dynamic, GET() (+18 more)

### Community 77 - "billing.ts"
Cohesion: 0.17
Nodes (11): BillingCycle, CheckoutRequest, CheckoutResponse, CouponStatus, CouponType, CouponUsage, CouponUsageStatus, InvoiceStatus (+3 more)

### Community 78 - "job_titles"
Cohesion: 0.67
Nodes (3): job_title_aliases, job_title_index, job_titles

### Community 79 - "user-actions-client.tsx"
Cohesion: 0.17
Nodes (20): useAdminActions(), banUserAction(), deleteUserAction(), ensureAdmin(), setRoleAction(), unbanUserAction(), UserRowActions(), UserActionsClient() (+12 more)

### Community 80 - "ClientProvider.tsx"
Cohesion: 0.13
Nodes (16): authSlice, @reduxjs/toolkit, checkUserExists(), SignUpForm(), captureReferralCode(), claimStoredReferral(), getStoredReferralCode(), useReferralClaim() (+8 more)

### Community 81 - "badge.tsx"
Cohesion: 0.13
Nodes (19): GET /api/career-insights, class-variance-authority, CareerInsightsData, ReferralData, formatInr(), formatInrLong(), Props, SalaryBlocker (+11 more)

### Community 82 - "GitHub project method (mandatory)"
Cohesion: 0.15
Nodes (14): Auth: two GitHub identities, Burn-in (after every fix, before moving on), Burn-in and defect harvesting (required), Commands cheat sheet, Defect harvesting (during and after burn-in), Failure modes we already hit, GitHub project method (mandatory), Persist login — never log out (+6 more)

### Community 83 - "scripts"
Cohesion: 0.14
Nodes (13): devDependencies, @playwright/test, tsx, tsx, name, private, scripts, report (+5 more)

### Community 84 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, babel-plugin-react-compiler, @biomejs/biome, drizzle-kit, tailwindcss, @tailwindcss/postcss, tsx, @types/node (+5 more)

### Community 85 - "chart.tsx"
Cohesion: 0.21
Nodes (11): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+3 more)

### Community 86 - "sendMail"
Cohesion: 0.12
Nodes (18): Resend, better-auth, referralRewards, referrals, sendOTPMail(), sendRefereeWelcomeEmail(), sendReferrerRewardEmail(), sendResetPasswordMail() (+10 more)

### Community 91 - "utils.ts"
Cohesion: 0.35
Nodes (13): @tabler/icons-react, ProfilePage(), ContactItem(), ContactItemProps, src_components_resume_templates_sharedcomponents_iconmail, src_components_resume_templates_sharedcomponents_iconmappin, src_components_resume_templates_sharedcomponents_iconphone, src_components_resume_templates_sharedcomponents_iconworld (+5 more)

### Community 92 - "tailor/route.ts"
Cohesion: 0.08
Nodes (32): HackClub AI Proxy, ai, @ai-sdk/openai, maxDuration, MODEL, POST(), RequestSchema, RouteParams (+24 more)

### Community 93 - "analyze-gaps/route.ts"
Cohesion: 0.23
Nodes (11): AnalysisResponseSchema, arraysMatch(), extractJSON(), filterGapsByRelevantNames(), maxDuration, MODEL, POST(), RoadmapItemSchema (+3 more)

### Community 94 - "analytics/route.ts"
Cohesion: 0.40
Nodes (8): Google Analytics 4, @google-analytics/data, google-auth-library, GET(), getCoreMetrics(), getEventMetrics(), getGA4Client(), getRealtimeUsers()

### Community 96 - "validations/resume.ts"
Cohesion: 0.09
Nodes (21): CreateResumeInput, createResumeSchema, createVersionSchema, customSectionItemSchema, customSectionSchema, optionalDate, optionalUrl, publicationItemSchema (+13 more)

### Community 98 - "Quick Reference"
Cohesion: 0.18
Nodes (11): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+3 more)

### Community 99 - "career-insights/route.ts"
Cohesion: 0.43
Nodes (6): Job Visit DB Table (jobVisit), Resume Analysis DB Table (resumeAnalysis), GET(), median(), parseSalaryToInr(), percentile()

### Community 111 - "referrals/page.tsx"
Cohesion: 0.20
Nodes (5): AdminSummary, fmt(), ReferralRow, ReferralSettings, ReferralsPage()

### Community 144 - "billing-invoice-table.tsx"
Cohesion: 0.20
Nodes (14): InvoiceModal (Invoice Detail Dialog), BillingInvoiceTable(), billingReasonLabel(), formatInvoiceNumber(), InvoiceModal(), statusVariant(), Table(), TableBody() (+6 more)

### Community 145 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.22
Nodes (8): Available Domains, Available Stacks, How to Use, Output Formats, Prerequisites, Rule Categories by Priority, Search Reference, UI/UX Pro Max - Design Intelligence

### Community 146 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, noEmit, skipLibCheck, strict, target, include

### Community 147 - "cashfree.ts"
Cohesion: 0.16
Nodes (14): Cashfree Client, cashfree-pg, ref_crypto, dynamic, POST(), CashfreeOrder, CashfreePaymentDetail, CashfreeRefundResult (+6 more)

### Community 148 - "input-group.tsx"
Cohesion: 0.22
Nodes (12): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+4 more)

### Community 149 - "app/page.tsx"
Cohesion: 0.27
Nodes (4): DashboardSkeleton(), Navbar(), authClient, src_lib_auth_client_usesession

### Community 150 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 151 - "generate-report.ts"
Cohesion: 0.29
Nodes (6): FINDINGS_FILE, OUTPUT, REPORT_DIR, UxFinding, ref_node_fs, ref_node_path

### Community 152 - "ResumeData"
Cohesion: 0.22
Nodes (12): ResumeEditorError(), ParsingProgressProps, ProfileReviewProps, ResultsHeaderProps, getResumeDraftKey(), getResumeIdFromPath(), hasResumeDraft(), loadResumeDraft() (+4 more)

### Community 153 - "Pre-Delivery Checklist"
Cohesion: 0.33
Nodes (6): Accessibility, Interaction, Layout, Light/Dark Mode, Pre-Delivery Checklist, Visual Quality

### Community 154 - "How to Use This Skill"
Cohesion: 0.33
Nodes (6): How to Use This Skill, Step 1: Analyze User Requirements, Step 2: Generate Design System (REQUIRED), Step 2b: Persist Design System (Master + Overrides Pattern), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines (React Native)

### Community 155 - "@playwright/test"
Cohesion: 0.53
Nodes (3): stabilizePageForScreenshot(), VISUAL_SCREENSHOT_OPTS, @playwright/test

### Community 156 - "PreviewPanel.tsx"
Cohesion: 0.29
Nodes (11): TEMPLATE_COMPONENTS, PreviewPanel(), TEMPLATE_COMPONENTS, usePageCount(), CreativePortfolioTemplate(), ExecutiveProTemplate(), MinimalistTemplate(), ModernSplitTemplate() (+3 more)

### Community 158 - "Common Rules for Professional UI"
Cohesion: 0.40
Nodes (5): Common Rules for Professional UI, Icons & Visual Elements, Interaction (App), Layout & Spacing, Light/Dark Mode Contrast

### Community 159 - "Example Workflow"
Cohesion: 0.40
Nodes (5): Example Workflow, Step 1: Analyze Requirements, Step 2: Generate Design System (REQUIRED), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines

### Community 160 - "ResumeScanResults.tsx"
Cohesion: 0.23
Nodes (11): AtsResult, AtsSuggestion, CategorizedSuggestion, categorizeSuggestion(), Category, CATEGORY_CONFIG, getScoreBg(), getScoreColor() (+3 more)

### Community 161 - "JobCard.tsx"
Cohesion: 0.31
Nodes (8): JobListItem(), JobCard(), timeAgo(), MatchRing(), MatchRingProps, buttonVariants, trackJobApplied(), trackJobCardImpression()

### Community 164 - "ReferralsPage"
Cohesion: 0.50
Nodes (4): fmtDate(), ReferralsPage(), copyLink(), shareLink()

### Community 165 - "ReferralPanel"
Cohesion: 0.50
Nodes (3): ReferralPanel(), copyLink(), shareLink()

### Community 166 - "Tips for Better Results"
Cohesion: 0.50
Nodes (4): Common Sticking Points, Pre-Delivery Checklist, Query Strategy, Tips for Better Results

### Community 167 - "When to Apply"
Cohesion: 0.50
Nodes (4): Must Use, Recommended, Skip, When to Apply

### Community 168 - "migrate.ts"
Cohesion: 0.22
Nodes (5): ref_fs, ref_path, ref_url, __dirname, migrationsFolder

### Community 169 - "(protected)/billing/page.tsx"
Cohesion: 0.13
Nodes (18): AnalysisError â€” Error screen for rate-limit / analysis failure with upgrade CTA, BillingError, POST /api/billing/checkout, POST /api/billing/coupons/validate, GET /api/billing/payment-status, POST /api/billing/retry, PaymentStatusPage, PricingPlans Component (+10 more)

### Community 177 - "file-upload.tsx"
Cohesion: 0.25
Nodes (7): react-dropzone, ResumeUploader(), ResumeUploaderProps, FileUpload(), GridPattern(), mainVariant, secondaryVariant

### Community 178 - "(auth)/layout.tsx"
Cohesion: 0.29
Nodes (5): Project Architecture Rules (AGENTS.md), CLAUDE.md â†’ AGENTS.md Redirect, Better Auth (Authentication Library), Next.js Breaking Changes Warning, Custom Next.js Middleware (proxy.ts)

### Community 179 - "drizzle.config.ts"
Cohesion: 0.29
Nodes (7): create-test-user, directUrl, Neon Serverless PostgreSQL, drizzle-kit, Neon Database Connection Test, seed-plans, SubscriptionPlans

### Community 180 - "get-refresh-token.js"
Cohesion: 0.29
Nodes (6): ref_googleapis, ref_readline, oauth2Client, rl, scopes, url

### Community 181 - "invoice.service.ts"
Cohesion: 0.43
Nodes (6): calculateInvoiceAmounts(), releaseCoupon(), CreateInvoiceParams, expireStaleInvoices(), voidInvoice(), BillingReason

### Community 182 - "GITHUB_PROJECT.md"
Cohesion: 0.33
Nodes (3): GitHub project method, GitHub project tracking, graphify

### Community 183 - "ProjectsForm.tsx"
Cohesion: 0.33
Nodes (5): ProjectsForm(), projectsFormSchema, ProjectsFormValues, projectItemSchema, ResumeProjectItem

## Knowledge Gaps
- **766 isolated node(s):** `$schema`, `enabled`, `clientKind`, `useIgnoreFile`, `ignoreUnknown` (+761 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1034 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `db/index.ts`, `referral.service.ts`, `analytics.ts`, `analyze/page.tsx`, `sidebar.tsx`, `schema.ts`, `lib/auth.ts`, `cashfree.ts`, `parse-resume/route.ts`, `package.json`, `app/page.tsx`, `[id]/page.tsx`, `webhook.service.ts`, `admin-header.tsx`, `ResumeData`, `resumes/page.tsx`, `checkout/route.ts`, `ResumeScanResults.tsx`, `onboarding/page.tsx`, `card.tsx`, `(protected)/billing/page.tsx`, `Root Layout`, `profile/page.tsx`, `(auth)/layout.tsx`, `lucide-react`, `subscription.service.ts`, `ats-score/route.ts`, `app/layout.tsx`, `app-shell.tsx`, `user-actions-client.tsx`, `ClientProvider.tsx`, `badge.tsx`, `sendMail`, `tailor/route.ts`, `analyze-gaps/route.ts`, `analytics/route.ts`, `career-insights/route.ts`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `cn`, `db/index.ts`, `SkillsForm.tsx`, `coupons-content.tsx`, `analytics.ts`, `analyze/page.tsx`, `sidebar.tsx`, `billing-invoice-table.tsx`, `input-group.tsx`, `package.json`, `app/page.tsx`, `[id]/page.tsx`, `ResumeData`, `admin-header.tsx`, `PreviewPanel.tsx`, `SettingsForm.tsx`, `resumes/page.tsx`, `JobCard.tsx`, `onboarding/page.tsx`, `card.tsx`, `(protected)/billing/page.tsx`, `SkillGapPanel.tsx`, `data-table.tsx`, `invoice-email.ts`, `profile/page.tsx`, `(auth)/layout.tsx`, `file-upload.tsx`, `LearningRoadmap.tsx`, `lucide-react`, `ProjectsForm.tsx`, `subscription.service.ts`, `types/index.ts`, `app/layout.tsx`, `avatar.tsx`, `app-shell.tsx`, `user-actions-client.tsx`, `ClientProvider.tsx`, `badge.tsx`, `chart.tsx`, `utils.ts`, `referrals/page.tsx`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `Project Architecture Rules (AGENTS.md)` connect `(auth)/layout.tsx` to `GITHUB_PROJECT.md`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `$schema`, `enabled`, `clientKind` to the rest of the system?**
  _766 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.07474747474747474 - nodes in this community are weakly interconnected._
- **Should `db/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0711864406779661 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.037037037037037035 - nodes in this community are weakly interconnected._