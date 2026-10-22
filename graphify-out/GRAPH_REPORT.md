# Graph Report - workspace  (2026-10-22)

## Corpus Check
- 373 files · ~246,649 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 4, .woff2 3, .ico 2)

## Summary
- 2512 nodes · 7848 edges · 159 communities (107 shown, 52 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 416 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `325ca99a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- next
- dependencies
- utils.ts
- LanguagesForm.tsx
- referral.service.ts
- Auth Library (@/lib/auth)
- ErrorBoundary
- coupons-content.tsx
- analyze/page.tsx
- Badge
- sidebar.tsx
- Resend
- CardContent
- database/page.tsx
- ClientProvider.tsx
- biome.json
- user
- lib/auth.ts
- data-table.tsx
- types/resume.ts
- package.json
- WorkForm.tsx
- Resume Architect — Implementation Plan
- checkout/route.ts
- ResumeArchitectChat.tsx
- Neon Serverless Postgres
- Neon Serverless Postgres
- components.json
- users-table.tsx
- @base-ui/react
- app/page.tsx
- Skill Coach
- 04-production-hardening.spec.ts
- helpers/audit.ts
- architect.service.ts
- 🌍 World-Class Multi-Industry Resume Architect — Complete Implementation Plan for Claude Opus 4.7
- onboarding/page.tsx
- Architecture Guidelines
- PHASE 9: KEY EDGE CASES & ERROR HANDLING
- Skeleton
- AnalyzePageContent (Main Analysis Engine)
- settings-content.tsx
- PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER
- 3. Contract check against `d691aea`
- invoice-email.ts
- PHASE 7: AI-POWERED FEATURES
- Root Layout
- Resume Builder Actual Implementation Plan
- react
- scripts
- pool.ts
- PHASE 3: RESUME EDITOR & FORM BUILDER
- Button
- sign-up/page.tsx
- compilerOptions
- Google Analytics 4
- (protected)/billing/page.tsx
- resume-editor.ts
- PHASE 5: PDF GENERATION STRATEGY (DUAL-ENGINE)
- PHASE 2: TEMPLATE SYSTEM ARCHITECTURE
- AGENTS.md
- PHASE 6: ATS OPTIMIZATION ENGINE
- PHASE 1: DATABASE SCHEMA DESIGN (Drizzle ORM)
- PHASE 10: USER EXPERIENCE & TOOLTIPS
- README.md
- useAuth
- analyze-gaps/route.ts
- jobs/page.tsx
- app/layout.tsx
- (protected)/referrals/page.tsx
- PHASE 0: PRE-IMPLEMENTATION PREPARATION
- PHASE 8: INDUSTRY-SPECIFIC SMART DEFAULTS
- AdminHeader â€” HQ top bar with breadcrumb nav, search, notifications, user menu
- dotenv
- 4. Data model
- next
- (auth)/layout.tsx
- job_titles
- VersionHistorySheet.tsx
- skill-extractor.ts
- match-engine.ts
- GitHub project method (mandatory)
- scripts
- devDependencies
- chart.tsx
- sendMail
- Globe (World) Icon
- DataTable â€” Generic admin data table with sort/filter/paginate/export capabilities
- POST /api/referrals/claim
- saveToLocal
- 5. AI tutor
- parse-resume/route.ts
- ProjectsForm.tsx
- analytics/route.ts
- job-titles.ts
- validations/resume.ts
- Adzuna API
- Quick Reference
- seed-plans.ts
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
- hq/referrals/page.tsx
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
- RichTextEditor.tsx
- invoices/route.ts
- MOBILE_BREAKPOINT
- STORAGE_KEY
- UI/UX Pro Max - Design Intelligence
- compilerOptions
- Frontend Design
- generate-report.ts
- Pre-Delivery Checklist
- How to Use This Skill
- @playwright/test
- Common Rules for Professional UI
- Example Workflow
- Tips for Better Results
- When to Apply
- test-result.js
- MemeLoader â€” Playful loading screen with animated GIFs during job search/analysis
- DELETE /api/billing/subscription
- { signIn, signOut, signUp, useSession, getSession }
- (auth)/layout.tsx
- get-refresh-token.js
- Project Architecture Rules (AGENTS.md)
- app_settings

## God Nodes (most connected - your core abstractions)
1. `cn()` - 223 edges
2. `Button()` - 163 edges
3. `react` - 134 edges
4. `Card()` - 114 edges
5. `CardContent()` - 109 edges
6. `lucide-react` - 108 edges
7. `next` - 100 edges
8. `Badge()` - 68 edges
9. `Input()` - 68 edges
10. `CardHeader()` - 64 edges

## Surprising Connections (you probably didn't know these)
- `Phase 1 — saved plans, no model calls` --references--> `LearningRoadmap()`  [INFERRED]
  docs/skill-coach.md → src/components/LearningRoadmap.tsx
- `Interaction (App)` --references--> `Button()`  [INFERRED]
  .agents/skills/ui-ux-pro-max/SKILL.md → src/components/ui/button.tsx
- `B — Role identity. Mismatch. Contract wins.` --references--> `normalizeJobTitle()`  [INFERRED]
  docs/skill-coach.md → src/lib/title-normalizer.ts
- `5.6 Usage actions` --references--> `logAiUsage()`  [INFERRED]
  docs/skill-coach.md → src/services/ai/usage.service.ts
- `6. Limits` --references--> `subscriptionGrantsAccess()`  [INFERRED]
  docs/skill-coach.md → src/services/billing/subscription.service.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Dual-Layer Authentication Guard** — src_proxy_middleware, src_app_auth_layout, better_auth [EXTRACTED 1.00]
- **Neon PostgreSQL Infrastructure Setup** — neon_db, drizzle_config, scratch_test_neon_script [INFERRED 0.75]
- **Resume Builder Architecture Triad** — resume_builder_architecture, resume_data_schema, template_system [INFERRED 0.75]
- **Resume Template System** — src_components_resume_templates_creativeportfoliotemplate, src_components_resume_templates_executiveprotemplate, src_components_resume_templates_minimalisttemplate, src_components_resume_templates_modernsplittemplate, src_components_resume_templates_techstacktemplate [INFERRED]
- **Dialog Primitives Duo** — AlertDialog, src_components_ui_dialog [INFERRED]
- **External Specialized Library Consumers** — src_components_ui_chart, FileUpload [INFERRED]
- **Composition Over Primitives** — InputGroup, src_components_ui_command [INFERRED]
- **Inline Conditional Rendering Pattern** — src_components_resume_templates_modernsplittemplate, src_components_resume_templates_techstacktemplate [INFERRED]
- **sectionRenderers Pattern** — src_components_resume_templates_creativeportfoliotemplate, src_components_resume_templates_executiveprotemplate, src_components_resume_templates_minimalisttemplate [INFERRED]
- **class-variance-authority Consumers** — src_components_ui_button, src_components_ui_badge, InputGroup, src_components_ui_field [INFERRED]
- **@base-ui/react Primitive Consumers** — AlertDialog, src_components_ui_avatar, src_components_ui_button, src_components_ui_checkbox, src_components_ui_dialog, DropdownMenu, src_components_ui_input [INFERRED]
- **Subscription Plan Tiers** — src_scripts_seed_plans_ts, subscription_plans, src_services_billing_subscription_service_ts, src_types_billing_types_ts [INFERRED]
- **Resume Type System** — src_types_resume_types_ts, resume_data_default, resume_metadata_default, inferred_job_titles_field, src_store_resumeslice_resumeslice, src_types_index_types_ts [INFERRED]
- **Referral System Full Flow** — src_services_billing_referral_service_ts, src_services_billing_webhook_service_ts, src_services_billing_coupon_service_ts, app_settings_lib, billing_utils_lib, nanoid, drizzle_orm [INFERRED]
- **Database Seeding Pipeline** — src_scripts_seed_job_titles_ts, src_scripts_seed_plans_ts, subscription_plans, title_normalizer_lib, drizzle_orm, neon_db, nanoid [INFERRED]
- **Redux State Architecture** — src_store_store_ts, src_store_authslice_authslice, src_store_resumeslice_resumeslice, src_providers_providers_tsx, redux_toolkit, src_types_auth_authstate, src_types_resume_types_ts [INFERRED]
- **Billing Module Dependency Chain** — src_services_billing_webhook_service_ts, src_services_billing_invoice_service_ts, src_services_billing_payment_service_ts, src_services_billing_subscription_service_ts, src_services_billing_coupon_service_ts, src_services_billing_referral_service_ts, billing_utils_lib, src_types_billing_types_ts, cashfree [INFERRED]
- **AI Usage Cost Tracking** — src_services_ai_usage_service_ts, model_rates_table, drizzle_orm, nanoid [INFERRED]

## Communities (159 total, 52 thin omitted)

### Community 0 - "cn"
Cohesion: 0.12
Nodes (30): INDIA_CITIES, LocationCombobox(), LocationComboboxProps, CardAction(), Command(), CommandEmpty(), CommandGroup(), CommandInput() (+22 more)

### Community 1 - "next"
Cohesion: 0.05
Nodes (47): jwks, received_email, drizzle-orm, nanoid, next, ALLOWED_TABLES, GET(), resend (+39 more)

### Community 2 - "dependencies"
Cohesion: 0.04
Nodes (56): dependencies, ai, @ai-sdk/openai, @ai-sdk/react, @base-ui/react, better-auth, cashfree-pg, class-variance-authority (+48 more)

### Community 3 - "utils.ts"
Cohesion: 0.08
Nodes (52): ContactItem, FileUpload, ResumeThumbnail (Template Preview), Template Registry, GET+PATCH+DELETE /api/resumes/[id], POST /api/resumes/[id]/duplicate, POST /api/resumes/[id]/export, formatProfileText (+44 more)

### Community 4 - "LanguagesForm.tsx"
Cohesion: 0.11
Nodes (29): @hookform/resolvers, react-hook-form, react-redux, @reduxjs/toolkit, zod, RichTextEditor(), BasicsFormValues, certificationsFormSchema (+21 more)

### Community 5 - "referral.service.ts"
Cohesion: 0.10
Nodes (32): dynamic, GET(), POST(), requireAdmin(), dynamic, POST(), dynamic, GET() (+24 more)

### Community 6 - "Auth Library (@/lib/auth)"
Cohesion: 0.07
Nodes (30): Billing Retry API (POST /api/billing/retry), Billing Subscription API (GET/DELETE /api/billing/subscription), Billing Webhook API (POST /api/billing/webhook), Duplicate Resume API (POST /api/resumes/[id]/duplicate), Enhance Bullet AI API (POST /api/resumes/[id]/ai/enhance), Export Resume API (POST /api/resumes/[id]/export), Referral Claim API (POST /api/referrals/claim), Referral Validate API (GET /api/referrals/validate) (+22 more)

### Community 8 - "coupons-content.tsx"
Cohesion: 0.11
Nodes (29): EMPTY_FORM, Props, STATUS_VARIANT, EmailsContent(), EmailSkeleton(), EMPTY_FORM, PlansContent(), Props (+21 more)

### Community 9 - "analyze/page.tsx"
Cohesion: 0.07
Nodes (78): AnalyzeTypes â€” ReviewState and FilterState type definitions for the analyze workflow, JobFilters â€” Advanced job filter panel (title, city, work type, emp type, match score, salary), ResultsHeader â€” Analysis results header with user profile card and summary stat cards, StatCard â€” Simple stat display card with large value + label (used in results header), 4.2 `coach_plan`, AnalyzePage(), AnalyzePageContent(), TabId (+70 more)

### Community 10 - "Badge"
Cohesion: 0.12
Nodes (26): ParsingProgress â€” Resume parsing progress panel with ProgressTimeline and skill preview, ProfileReview â€” Post-parse profile editor for skills, job titles, and experience before analysis, ParsingProgressProps, ResultsHeader(), StatCard(), formatInr(), UserDashboard(), UserDashboardProps (+18 more)

### Community 11 - "sidebar.tsx"
Cohesion: 0.08
Nodes (54): AdminLayout(), AdminSidebar(), items, AppShell(), AppShellProps, MobileBottomNav(), UserSidebar(), NavUser (+46 more)

### Community 13 - "CardContent"
Cohesion: 0.12
Nodes (37): AnalysisError â€” Error screen for rate-limit / analysis failure with upgrade CTA, POST /api/billing/checkout, POST /api/billing/coupons/validate, ForgotPasswordPage(), ResetPasswordForm(), ResetPasswordPage(), OverviewStats, StatsCards() (+29 more)

### Community 14 - "database/page.tsx"
Cohesion: 0.16
Nodes (25): DatabasePage(), DataTable(), getPageRange(), RoastDialog(), ShareResumeSheet(), ShareState, Pagination(), PaginationContent() (+17 more)

### Community 15 - "ClientProvider.tsx"
Cohesion: 0.08
Nodes (15): better-auth, GET, POST, AuthInitializer(), serializeUser(), Providers, config, PROTECTED_ROUTES (+7 more)

### Community 16 - "biome.json"
Cohesion: 0.06
Nodes (31): source, assist, actions, next, react, files, ignoreUnknown, includes (+23 more)

### Community 17 - "user"
Cohesion: 0.08
Nodes (35): account, ai_usage_log, audit_log, coupon_usage, coupons, ai_action, billing_cycle, billing_reason (+27 more)

### Community 18 - "lib/auth.ts"
Cohesion: 0.06
Nodes (58): Admin Analytics (GA4) Endpoint, Admin Audit Log Endpoint, Admin Database Browser Endpoint, Admin Emails (Resend) Endpoint, Admin Referrals Management Endpoint, Admin Learning Resources CRUD Endpoint, Admin Settings (Plans & Coupons) Endpoint, Admin Stats (Revenue, AI, Growth) Endpoint (+50 more)

### Community 19 - "data-table.tsx"
Cohesion: 0.16
Nodes (20): InvoiceModal (Invoice Detail Dialog), CouponsContent(), BillingInvoiceTable(), billingReasonLabel(), formatInvoiceNumber(), Invoice, InvoiceModal(), StatusIcon() (+12 more)

### Community 20 - "types/resume.ts"
Cohesion: 0.08
Nodes (26): SKILL_CATEGORIES, SKILL_LEVELS, skillsFormSchema, SkillsFormValues, TEMPLATE_REGISTRY, RESUME_LIMITS, skillItemSchema, initialState (+18 more)

### Community 21 - "package.json"
Cohesion: 0.06
Nodes (30): engines, node, tsx, name, private, version, babel-plugin-react-compiler, @biomejs/biome (+22 more)

### Community 22 - "WorkForm.tsx"
Cohesion: 0.13
Nodes (15): @dnd-kit/core, @dnd-kit/sortable, educationFormSchema, EducationFormValues, FONT_OPTIONS, PAGE_FORMATS, SECTION_LABELS, ThemeKey (+7 more)

### Community 23 - "Resume Architect — Implementation Plan"
Cohesion: 0.05
Nodes (37): API Routes, Architecture Overview, code:block1 (┌───────────────────────────────────────────────────────────), code:block2 (src/), Commit History, Creative Portfolio Template ✅, Dashboard Page (`/resumes`), Database Schema (+29 more)

### Community 24 - "checkout/route.ts"
Cohesion: 0.06
Nodes (73): cashfree-pg, maxDuration, POST(), POST(), GET(), GET(), POST(), dynamic (+65 more)

### Community 25 - "ResumeArchitectChat.tsx"
Cohesion: 0.07
Nodes (65): @ai-sdk/react, streamdown, use-stick-to-bottom, useAdminActions(), buildColumns(), banUserAction(), deleteUserAction(), ensureAdmin() (+57 more)

### Community 26 - "Neon Serverless Postgres"
Cohesion: 0.08
Nodes (24): Autoscaling, Branching, Connection Methods & Drivers, Connection Pooling, Developer Tools, Fetching Docs as Markdown, Finding the Right Page, Getting Started (+16 more)

### Community 27 - "Neon Serverless Postgres"
Cohesion: 0.08
Nodes (24): Autoscaling, Branching, Connection Methods & Drivers, Connection Pooling, Developer Tools, Fetching Docs as Markdown, Finding the Right Page, Getting Started (+16 more)

### Community 28 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 29 - "users-table.tsx"
Cohesion: 0.19
Nodes (13): @tanstack/react-table, applyMutation(), MutatePayload, TableSkeleton(), User, UsersTable(), SelectContent(), SelectGroup() (+5 more)

### Community 30 - "@base-ui/react"
Cohesion: 0.40
Nodes (3): AlertDialog, DropdownMenu, @base-ui/react

### Community 31 - "app/page.tsx"
Cohesion: 0.19
Nodes (9): lucide-react, HomePage(), RenewalReminder(), RenewalReminderProps, AnalyzeSkeleton(), DashboardSkeleton(), GridPattern(), WordFadeIn() (+1 more)

### Community 32 - "Skill Coach"
Cohesion: 0.13
Nodes (14): 10. Open questions, 2.1 Student journey, 2.2 Professional journey, 2.3 Shared rules, 2. Product shape, 6. Limits, 7. Phased plan, 8. Non-goals (+6 more)

### Community 33 - "04-production-hardening.spec.ts"
Cohesion: 0.22
Nodes (14): deleteExtraResumes(), ensureResume(), getResume(), listResumes(), patchResume(), resetResumeToBaseline(), ResumeBasics, ResumeData (+6 more)

### Community 34 - "helpers/audit.ts"
Cohesion: 0.20
Nodes (14): CORE_ROUTES, assertPageLoaded(), captureScreen(), countVisibleCTAs(), ensureReportDir(), FINDINGS_FILE, FindingSeverity, getPrimaryHeadings() (+6 more)

### Community 35 - "architect.service.ts"
Cohesion: 0.06
Nodes (61): GET(), maxDuration, POST(), requireResumeOwner(), RouteParams, metadata, PublicResumePage(), PublicResume (+53 more)

### Community 36 - "🌍 World-Class Multi-Industry Resume Architect — Complete Implementation Plan for Claude Opus 4.7"
Cohesion: 0.11
Nodes (17): 11.1 Export Formats, 11.2 Public Sharing, 12.1 User Dashboard, 12.2 Duplicate Resume, 14.1 Performance Optimizations, 14.2 Deployment Checklist, 4.1 Architecture, 4.2 Preview Communication (+9 more)

### Community 37 - "onboarding/page.tsx"
Cohesion: 0.06
Nodes (43): POST /api/parse-resume, GET+PATCH /api/profile, POST /api/resumes/[id]/ai/ats-score, GET+POST /api/resumes, motion, react-dropzone, ResumeScanResults Component, ResumeScannerLoader Component (+35 more)

### Community 38 - "Architecture Guidelines"
Cohesion: 0.18
Nodes (11): 1. Separation of Frontend and Backend, 2. API Routes over Server Actions, 3. Client-Side Data Fetching, 4. When to use Server Components, 5. Security and Validation, 6.1. High-Level System Architecture, 6.2. Database Entity Relationship Diagram (ERD), 6.3. Directory Map & Responsibilities (+3 more)

### Community 39 - "PHASE 9: KEY EDGE CASES & ERROR HANDLING"
Cohesion: 0.15
Nodes (13): 9.10 Mobile/Tablet Responsiveness, 9.11 Skill Database / Autocomplete, 9.12 Import Existing Resume, 9.1 Content Overflow / Multi-Page, 9.2 Data Loss Prevention, 9.3 Rich Text HTML Injection (XSS), 9.4 Large File / Image Handling, 9.5 PDF Generation Timeouts (Serverless) (+5 more)

### Community 40 - "Skeleton"
Cohesion: 0.10
Nodes (30): date-fns, recharts, AnalyticsContent(), AnalyticsData, KpiSkeleton(), AnalyticsPage(), AuditList(), AuditLog (+22 more)

### Community 41 - "AnalyzePageContent (Main Analysis Engine)"
Cohesion: 0.14
Nodes (14): AnalyzePageContent (Main Analysis Engine), GET /api/analysis-history/[id], POST /api/analyze-gaps, POST /api/save-analysis, POST /api/search-jobs, JobCard (Job Match Card), JobTitleAutocomplete Component, LearningRoadmap Component (+6 more)

### Community 42 - "settings-content.tsx"
Cohesion: 0.38
Nodes (9): SettingsContent(), SettingsPage(), EmptyState(), MyJobsPage(), Tabs(), TabsContent(), TabsList(), tabsListVariants (+1 more)

### Community 43 - "PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER"
Cohesion: 0.18
Nodes (11): PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER, Week 10: Testing & QA, Week 1: Foundation, Week 2: Editor Shell, Week 3: All Form Sections, Week 4: Templates, Week 5: PDF Generation, Week 6: ATS Engine (+3 more)

### Community 44 - "3. Contract check against `d691aea`"
Cohesion: 0.20
Nodes (10): 3.1 Keys Coach stores, 3. Contract check against `d691aea`, A — Skill identity. Mismatch. Contract wins., B — Role identity. Mismatch. Contract wins., C — Gap source. Mismatch. Match engine stays the producer., D — Verified skill. Partial. Signature changed., E — Segment. Mismatch. Contract wins., F — Soft skills and non-tech roles. Holds, with a limit. (+2 more)

### Community 45 - "invoice-email.ts"
Cohesion: 0.10
Nodes (30): @react-pdf/renderer, dynamic, GET(), POST(), requireAdmin(), dynamic, CompanyTabProps, billingReasonLabel() (+22 more)

### Community 46 - "PHASE 7: AI-POWERED FEATURES"
Cohesion: 0.22
Nodes (9): 7.1 AI Bullet Point Writer, 7.2 AI Summary Generator, 7.3 AI Tailoring (Resume ↔ Job Description), 7.4 AI Resume Roast / Feedback, code:typescript (// Prompt template:), code:typescript (// Prompt template:), code:typescript (// Steps:), code:typescript (// Prompt: "You are a brutally honest career coach. Analyze ) (+1 more)

### Community 47 - "Root Layout"
Cohesion: 0.24
Nodes (7): Global CSS Migration to shadcn Theme, Home Page (Landing), nextConfig, Root Layout, Global Error Boundary, Global Loading Component, 404 Not Found Page

### Community 49 - "react"
Cohesion: 0.16
Nodes (17): react, sonner, EMPTY, AtsResult, AtsScorePanel(), AtsSuggestion, awardsFormSchema, AwardsFormValues (+9 more)

### Community 50 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, build, db:generate, db:migrate, db:push, db:seed-plans, db:studio, db:test-user (+13 more)

### Community 51 - "pool.ts"
Cohesion: 0.60
Nodes (4): pg, buildDirectUrl(), getPool(), withTransaction()

### Community 52 - "PHASE 3: RESUME EDITOR & FORM BUILDER"
Cohesion: 0.25
Nodes (8): 3.1 Editor Layout (Three-Panel Design), 3.2 Section Components (shadcn/ui based), 3.3 Form State Management, 3.4 Validation Rules (Zod Schemas), code:block5 (+------------------+---------------------------+------------), code:typescript (// src/stores/resume-store.ts), code:typescript (// src/lib/validations/resume.ts), PHASE 3: RESUME EDITOR & FORM BUILDER

### Community 53 - "Button"
Cohesion: 0.28
Nodes (25): ResumeEditorPage(), SECTIONS, TOOLS, AwardsForm(), BasicsForm(), CertificationsForm(), EducationForm(), LanguagesForm() (+17 more)

### Community 54 - "sign-up/page.tsx"
Cohesion: 0.09
Nodes (34): InputGroup, SignInForm (Client Component), SignUpForm (Client Component), GET /api/referrals/validate, auth-client (Better-Auth Client), checkUserExists (Server Action), authSlice (Redux Auth State), class-variance-authority (+26 more)

### Community 55 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 56 - "Google Analytics 4"
Cohesion: 0.29
Nodes (5): setUserId, trackPageView, analytics, auth-client, useAnalytics

### Community 57 - "(protected)/billing/page.tsx"
Cohesion: 0.12
Nodes (26): GET /api/billing/payment-status, POST /api/billing/retry, ClientProvider (Session-User Bridge), db (Drizzle ORM Database), db/schema (Drizzle Tables - plan, subscription, invoice, coupons, userProfile, resume), PaymentStatusPage, PricingPlans Component, PrimaryResumePage (Redirect) (+18 more)

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
Nodes (3): useAuth, useAutoSave, /sign-in

### Community 67 - "analyze-gaps/route.ts"
Cohesion: 0.22
Nodes (12): 1. What exists today, AnalysisResponseSchema, arraysMatch(), extractJSON(), filterGapsByRelevantNames(), maxDuration, MODEL, POST() (+4 more)

### Community 68 - "jobs/page.tsx"
Cohesion: 0.14
Nodes (17): JobListItem (Tracked Job Card), GET /api/career-insights, POST+DELETE /api/save-job, GET /api/user-jobs, CareerInsightsData, CareerInsightsPage(), JobListItem(), TrackedJob (+9 more)

### Community 69 - "app/layout.tsx"
Cohesion: 0.18
Nodes (12): next-themes, @next/third-parties, @vercel/speed-insights, inter, metadata, RootLayout(), satoshi, ThemeProvider() (+4 more)

### Community 70 - "(protected)/referrals/page.tsx"
Cohesion: 0.28
Nodes (7): GET+POST /api/referrals, fmtDate(), ReferralData, ReferralsPage(), copyLink(), shareLink(), STATUS_CONFIG

### Community 71 - "PHASE 0: PRE-IMPLEMENTATION PREPARATION"
Cohesion: 0.50
Nodes (4): 0.1 Tech Stack Inventory (Already in Place), 0.2 New Dependencies to Install, code:bash (# Drag and Drop), PHASE 0: PRE-IMPLEMENTATION PREPARATION

### Community 72 - "PHASE 8: INDUSTRY-SPECIFIC SMART DEFAULTS"
Cohesion: 0.50
Nodes (4): 8.1 Industry Profiles, 8.2 Section Reordering Per Industry, code:typescript (const industrySectionOrder: Record<string, string[]> = {), PHASE 8: INDUSTRY-SPECIFIC SMART DEFAULTS

### Community 73 - "AdminHeader â€” HQ top bar with breadcrumb nav, search, notifications, user menu"
Cohesion: 0.50
Nodes (4): AdminHeader â€” HQ top bar with breadcrumb nav, search, notifications, user menu, AdminSidebar â€” HQ sidebar with navigation links (Overview, Users, Database, Analytics, etc.), ThemeProvider â€” Wrapper around next-themes NextThemesProvider, ThemeToggle â€” Light/dark/system toggle using next-themes useTheme

### Community 74 - "dotenv"
Cohesion: 0.22
Nodes (4): dotenv, cleanUrl, __dirname, migrationsFolder

### Community 75 - "4. Data model"
Cohesion: 0.22
Nodes (9): 4.1 `coach_program`, 4.3 `coach_progress`, 4.4 `coach_outline_cache`, 4.5 `coach_session`, tasks, attempts, 4.6 `coach_period_usage`, 4.7 What we will not store, 4.8 Gap refresh, 4.9 Verified skill signal (+1 more)

### Community 76 - "next"
Cohesion: 0.16
Nodes (12): dynamic, GET(), AdzunaResult, buildSalaryString(), maxDuration, optimizeJobTitle(), POST(), jobTitleAliases (+4 more)

### Community 77 - "(auth)/layout.tsx"
Cohesion: 0.29
Nodes (3): Project Architecture Rules (AGENTS.md), CLAUDE.md â†’ AGENTS.md Redirect, Custom Next.js Middleware (proxy.ts)

### Community 78 - "job_titles"
Cohesion: 0.67
Nodes (3): job_title_aliases, job_title_index, job_titles

### Community 79 - "VersionHistorySheet.tsx"
Cohesion: 0.27
Nodes (19): UserActionsClient(), UserActionsClientProps, CancelSubscriptionButton(), VersionHistorySheet(), loadVersions(), saveSnapshot(), versionLabel(), VersionRow (+11 more)

### Community 80 - "skill-extractor.ts"
Cohesion: 0.25
Nodes (4): CONTEXT_PATTERNS, normalizeSkillList(), SKILL_ALIASES, SKILLS_TAXONOMY

### Community 81 - "match-engine.ts"
Cohesion: 0.57
Nodes (7): aggregateSkillGaps(), computeMatchScore(), findMatchedSkills(), findMissingSkills(), matchJobsToResume(), categorizeSkill(), normalizeSkill()

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
Cohesion: 0.20
Nodes (12): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent(), getPayloadConfigFromPayload() (+4 more)

### Community 86 - "sendMail"
Cohesion: 0.18
Nodes (10): resend, sendOTPMail(), sendResetPasswordMail(), resend, sendMail(), sendSubscriptionCanceledMail(), sendSubscriptionCreatedMail(), sendSubscriptionRenewedMail() (+2 more)

### Community 91 - "5. AI tutor"
Cohesion: 0.29
Nodes (7): 5.1 Layout, 5.2 Tools, 5.3 Calls that spend money, 5.5 Ceiling, kill switch, refunds, 5.6 Usage actions, 5.7 Language, 5. AI tutor

### Community 92 - "parse-resume/route.ts"
Cohesion: 0.05
Nodes (57): 5.4 Cost model, ai, @ai-sdk/openai, maxDuration, MODEL, POST(), ResumeSchema, GET() (+49 more)

### Community 93 - "ProjectsForm.tsx"
Cohesion: 0.33
Nodes (4): projectsFormSchema, ProjectsFormValues, projectItemSchema, ResumeProjectItem

### Community 94 - "analytics/route.ts"
Cohesion: 0.40
Nodes (7): @google-analytics/data, google-auth-library, GET(), getCoreMetrics(), getEventMetrics(), getGA4Client(), getRealtimeUsers()

### Community 96 - "validations/resume.ts"
Cohesion: 0.10
Nodes (19): CreateResumeInput, createResumeSchema, createVersionSchema, customSectionItemSchema, customSectionSchema, optionalDate, optionalUrl, ResumeDataInput (+11 more)

### Community 98 - "Quick Reference"
Cohesion: 0.18
Nodes (11): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+3 more)

### Community 99 - "seed-plans.ts"
Cohesion: 0.33
Nodes (4): coupons, db, plans, sql

### Community 111 - "hq/referrals/page.tsx"
Cohesion: 0.22
Nodes (6): AdminSummary, fmt(), ReferralRow, ReferralSettings, ReferralsPage(), SummaryCards()

### Community 134 - "RichTextEditor.tsx"
Cohesion: 0.40
Nodes (4): @tiptap/extension-placeholder, @tiptap/react, @tiptap/starter-kit, RichTextEditorProps

### Community 145 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.22
Nodes (8): Available Domains, Available Stacks, How to Use, Output Formats, Prerequisites, Rule Categories by Priority, Search Reference, UI/UX Pro Max - Design Intelligence

### Community 146 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, noEmit, skipLibCheck, strict, target, include

### Community 150 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 151 - "generate-report.ts"
Cohesion: 0.29
Nodes (4): FINDINGS_FILE, OUTPUT, REPORT_DIR, UxFinding

### Community 153 - "Pre-Delivery Checklist"
Cohesion: 0.33
Nodes (6): Accessibility, Interaction, Layout, Light/Dark Mode, Pre-Delivery Checklist, Visual Quality

### Community 154 - "How to Use This Skill"
Cohesion: 0.33
Nodes (6): How to Use This Skill, Step 1: Analyze User Requirements, Step 2: Generate Design System (REQUIRED), Step 2b: Persist Design System (Master + Overrides Pattern), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines (React Native)

### Community 155 - "@playwright/test"
Cohesion: 0.53
Nodes (3): stabilizePageForScreenshot(), VISUAL_SCREENSHOT_OPTS, @playwright/test

### Community 158 - "Common Rules for Professional UI"
Cohesion: 0.40
Nodes (5): Common Rules for Professional UI, Icons & Visual Elements, Interaction (App), Layout & Spacing, Light/Dark Mode Contrast

### Community 159 - "Example Workflow"
Cohesion: 0.40
Nodes (5): Example Workflow, Step 1: Analyze Requirements, Step 2: Generate Design System (REQUIRED), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines

### Community 166 - "Tips for Better Results"
Cohesion: 0.50
Nodes (4): Common Sticking Points, Pre-Delivery Checklist, Query Strategy, Tips for Better Results

### Community 167 - "When to Apply"
Cohesion: 0.50
Nodes (4): Must Use, Recommended, Skip, When to Apply

### Community 179 - "(auth)/layout.tsx"
Cohesion: 0.29
Nodes (5): directUrl, drizzle-kit, Neon Database Connection Test, create-test-user, seed-plans

### Community 180 - "get-refresh-token.js"
Cohesion: 0.29
Nodes (4): oauth2Client, rl, scopes, url

### Community 182 - "Project Architecture Rules (AGENTS.md)"
Cohesion: 0.33
Nodes (3): GitHub project method, GitHub project tracking, graphify

## Knowledge Gaps
- **144 isolated node(s):** `tsx`, `@fontsource-variable/inter`, `@types/pdf-parse`, `geist`, `pdf-parse` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 988 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `utils.ts`, `referral.service.ts`, `Auth Library (@/lib/auth)`, `invoices/route.ts`, `analyze/page.tsx`, `Badge`, `sidebar.tsx`, `CardContent`, `ClientProvider.tsx`, `package.json`, `checkout/route.ts`, `ResumeArchitectChat.tsx`, `app/page.tsx`, `architect.service.ts`, `onboarding/page.tsx`, `invoice-email.ts`, `Root Layout`, `Button`, `sign-up/page.tsx`, `(protected)/billing/page.tsx`, `analyze-gaps/route.ts`, `jobs/page.tsx`, `app/layout.tsx`, `next`, `(auth)/layout.tsx`, `VersionHistorySheet.tsx`, `parse-resume/route.ts`, `analytics/route.ts`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **What connects `tsx`, `@fontsource-variable/inter`, `@types/pdf-parse` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.12436974789915967 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `cn`, `utils.ts`, `LanguagesForm.tsx`, `RichTextEditor.tsx`, `coupons-content.tsx`, `analyze/page.tsx`, `Badge`, `sidebar.tsx`, `CardContent`, `database/page.tsx`, `ClientProvider.tsx`, `data-table.tsx`, `types/resume.ts`, `package.json`, `WorkForm.tsx`, `ResumeArchitectChat.tsx`, `users-table.tsx`, `app/page.tsx`, `architect.service.ts`, `onboarding/page.tsx`, `Skeleton`, `settings-content.tsx`, `invoice-email.ts`, `Button`, `sign-up/page.tsx`, `(protected)/billing/page.tsx`, `jobs/page.tsx`, `app/layout.tsx`, `(protected)/referrals/page.tsx`, `(auth)/layout.tsx`, `VersionHistorySheet.tsx`, `chart.tsx`, `ProjectsForm.tsx`, `hq/referrals/page.tsx`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.0475635798874005 - nodes in this community are weakly interconnected._
- **Why does `Project Architecture Rules (AGENTS.md)` connect `(auth)/layout.tsx` to `Project Architecture Rules (AGENTS.md)`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03571428571428571 - nodes in this community are weakly interconnected._