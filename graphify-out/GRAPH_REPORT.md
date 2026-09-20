# Graph Report - workspace  (2026-09-20)

## Corpus Check
- 367 files · ~241,629 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 4, .woff2 3, .mdc 2)

## Summary
- 2524 nodes · 6708 edges · 177 communities (114 shown, 63 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 440 edges (avg confidence: 0.96)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `05082ccc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- next
- dependencies
- react
- SkillsForm.tsx
- referral.service.ts
- WebhookService
- Resume Editor
- button.tsx
- analytics.ts
- analyze/page.tsx
- sidebar.tsx
- Resend
- What You Must Do When Invoked
- schema.ts
- app-settings.ts
- biome.json
- user
- lib/auth.ts
- parse-resume/route.ts
- types/resume.ts
- package.json
- sheet.tsx
- Resume Architect — Implementation Plan
- invoice.service.ts
- admin-header.tsx
- Neon Serverless Postgres
- Neon Serverless Postgres
- components.json
- resumeSlice
- ResumeArchitectChat.tsx
- history/page.tsx
- checkout/route.ts
- 04-production-hardening.spec.ts
- helpers/audit.ts
- architect.service.ts
- 🌍 World-Class Multi-Industry Resume Architect — Complete Implementation Plan for Claude Opus 4.7
- onboarding/page.tsx
- Architecture Guidelines
- PHASE 9: KEY EDGE CASES & ERROR HANDLING
- lucide-react
- AnalyzePageContent (Main Analysis Engine)
- Billing Retry API (POST /api/billing/retry)
- PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER
- data-table.tsx
- invoice-email.ts
- PHASE 7: AI-POWERED FEATURES
- Root Layout
- Resume Builder Actual Implementation Plan
- profile/page.tsx
- scripts
- pool.ts
- PHASE 3: RESUME EDITOR & FORM BUILDER
- [id]/page.tsx
- sign-in/page.tsx
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
- ats-score/route.ts
- app/layout.tsx
- migrate.ts
- PHASE 0: PRE-IMPLEMENTATION PREPARATION
- PHASE 8: INDUSTRY-SPECIFIC SMART DEFAULTS
- AdminHeader â€” HQ top bar with breadcrumb nav, search, notifications, user menu
- seed-plans.ts
- app-shell.tsx
- search-jobs/route.ts
- billing.ts
- job_titles
- user-actions-client.tsx
- ClientProvider.tsx
- nanoid
- GitHub project method (mandatory)
- scripts
- devDependencies
- chart.tsx
- proxy.ts
- Globe (World) Icon
- DataTable â€” Generic admin data table with sort/filter/paginate/export capabilities
- POST /api/referrals/claim
- saveToLocal
- actions.ts
- tailor/route.ts
- RichTextEditor.tsx
- analytics/route.ts
- job-titles.ts
- validations/resume.ts
- Adzuna API
- Quick Reference
- CouponsContent
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
- invoices/route.ts
- UI/UX Pro Max - Design Intelligence
- compilerOptions
- cashfree.ts
- input-group.tsx
- Frontend Design
- generate-report.ts
- draft-recovery.ts
- Pre-Delivery Checklist
- How to Use This Skill
- @playwright/test
- ErrorBoundary
- Common Rules for Professional UI
- Example Workflow
- ResumeScanResults.tsx
- PlansContent
- ResourcesContent
- ReferralsPage
- ReferralPanel
- Tips for Better Results
- When to Apply
- billing-utils.ts
- rules/graphify.md
- workflows/graphify.md
- pre-commit
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
2. `react` - 129 edges
3. `lucide-react` - 104 edges
4. `next` - 95 edges
5. `Button()` - 78 edges
6. `drizzle-orm` - 60 edges
7. `Card()` - 57 edges
8. `db` - 57 edges
9. `CardContent()` - 55 edges
10. `auth` - 55 edges

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

## Communities (177 total, 63 thin omitted)

### Community 0 - "cn"
Cohesion: 0.08
Nodes (39): INDIA_CITIES, LocationCombobox(), LocationComboboxProps, BreadcrumbEllipsis(), CardAction(), Command(), CommandDialog(), CommandEmpty() (+31 more)

### Community 1 - "next"
Cohesion: 0.08
Nodes (23): drizzle-orm, nanoid, next, ALLOWED_TABLES, resend, dynamic, dynamic, RouteParams (+15 more)

### Community 2 - "dependencies"
Cohesion: 0.04
Nodes (57): dependencies, ai, @ai-sdk/google, @ai-sdk/openai, @ai-sdk/react, @base-ui/react, better-auth, cashfree-pg (+49 more)

### Community 3 - "react"
Cohesion: 0.09
Nodes (14): react, AnalyticsContent(), AuditList(), BillingContent(), Props, EmailsContent(), Props, Props (+6 more)

### Community 4 - "SkillsForm.tsx"
Cohesion: 0.13
Nodes (44): @dnd-kit/core, @dnd-kit/sortable, @hookform/resolvers, react-hook-form, react-redux, zod, AtsResult, AtsSuggestion (+36 more)

### Community 5 - "referral.service.ts"
Cohesion: 0.06
Nodes (49): Resend, resend, Referral Service (@/services/billing/referral.service), Referral Claim API (POST /api/referrals/claim), Referral Validate API (GET /api/referrals/validate), dynamic, GET(), POST() (+41 more)

### Community 6 - "WebhookService"
Cohesion: 0.44
Nodes (11): app-settings, BillingTypes, Billing Utilities (@/lib/billing-utils), Cashfree, CashfreeWebhookEvent, CouponService, InvoiceService, PaymentService (+3 more)

### Community 7 - "Resume Editor"
Cohesion: 0.07
Nodes (70): @base-ui/react, @tabler/icons-react, AI Resume Features, POST /api/resumes/{id}/ai/ats-score, POST /api/resumes/{id}/ai/enhance, POST /api/resumes/{id}/ai/roast, POST /api/resumes/{id}/ai/summary, POST /api/resumes/{id}/ai/tailor (+62 more)

### Community 8 - "button.tsx"
Cohesion: 0.12
Nodes (34): POST /api/billing/checkout, POST /api/billing/coupons/validate, @base-ui/react, EMPTY_FORM, STATUS_VARIANT, EMPTY_FORM, EMPTY_FORM, applyMutation() (+26 more)

### Community 9 - "analytics.ts"
Cohesion: 0.10
Nodes (59): AnalyzeTypes â€” ReviewState and FilterState type definitions for the analyze workflow, JobFilters â€” Advanced job filter panel (title, city, work type, emp type, match score, salary), ResultsHeader â€” Analysis results header with user profile card and summary stat cards, StatCard â€” Simple stat display card with large value + label (used in results header), HomePage(), AnalyzePageContent(), AnalyticsProvider(), JobFilters() (+51 more)

### Community 10 - "analyze/page.tsx"
Cohesion: 0.08
Nodes (27): ParsingProgress â€” Resume parsing progress panel with ProgressTimeline and skill preview, ProfileReview â€” Post-parse profile editor for skills, job titles, and experience before analysis, TabId, TABS, AnalysisError(), AnalysisErrorProps, JobFiltersProps, JOB_MEMES (+19 more)

### Community 11 - "sidebar.tsx"
Cohesion: 0.11
Nodes (30): AdminHeader(), AdminSidebar(), items, Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter() (+22 more)

### Community 13 - "What You Must Do When Invoked"
Cohesion: 0.06
Nodes (33): For --cluster-only, For git commit hook, For /graphify add, For /graphify explain, For /graphify path, For /graphify query, For native CLAUDE.md integration, For --update (incremental re-extraction) (+25 more)

### Community 14 - "schema.ts"
Cohesion: 0.07
Nodes (31): Public Plans Listing Endpoint, checkUserExists Server Action, Learning Resources DB Table (learningResources), Resource Clicks DB Table (resourceClicks), dynamic, GET(), POST(), requireAdmin() (+23 more)

### Community 15 - "app-settings.ts"
Cohesion: 0.24
Nodes (10): dynamic, GET(), POST(), requireAdmin(), appSettings, APP_SETTING_KEYS, AppSettingKey, ReferralSettings (+2 more)

### Community 16 - "biome.json"
Cohesion: 0.06
Nodes (31): source, assist, actions, next, react, files, ignoreUnknown, includes (+23 more)

### Community 17 - "user"
Cohesion: 0.06
Nodes (45): account, ai_usage_log, audit_log, coupon_usage, coupons, ai_action, billing_cycle, billing_reason (+37 more)

### Community 18 - "lib/auth.ts"
Cohesion: 0.09
Nodes (39): Admin Analytics (GA4) Endpoint, Admin Audit Log Endpoint, Admin Database Browser Endpoint, Admin Emails (Resend) Endpoint, Admin Referrals Management Endpoint, Admin Learning Resources CRUD Endpoint, Admin Settings (Plans & Coupons) Endpoint, Admin Stats (Revenue, AI, Growth) Endpoint (+31 more)

### Community 19 - "parse-resume/route.ts"
Cohesion: 0.11
Nodes (29): Auth Library (@/lib/auth), Resume Version DB Table (resumeVersion), User Profile DB Table (userProfile), Duplicate Resume API (POST /api/resumes/[id]/duplicate), Export Resume API (POST /api/resumes/[id]/export), Inference Library (@/lib/inference), Restore Version API (POST /api/resumes/[id]/versions/[versionId]/restore), Resume Versions API (GET/POST /api/resumes/[id]/versions) (+21 more)

### Community 20 - "types/resume.ts"
Cohesion: 0.05
Nodes (79): ResumeThumbnail (Template Preview), GET+PATCH+DELETE /api/resumes/[id], POST /api/resumes/[id]/duplicate, POST /api/resumes/[id]/export, resumeSlice (Redux Resume Editor State), Redux Store, @tabler/icons-react, Resume Editor Section Forms (Basics, Work, Education, Skills, Projects, etc.) (+71 more)

### Community 21 - "package.json"
Cohesion: 0.06
Nodes (31): engines, node, tsx, name, private, version, @ai-sdk/google, babel-plugin-react-compiler (+23 more)

### Community 22 - "sheet.tsx"
Cohesion: 0.18
Nodes (11): RoastDialog(), ScrollArea(), ScrollBar(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+3 more)

### Community 23 - "Resume Architect — Implementation Plan"
Cohesion: 0.05
Nodes (37): API Routes, Architecture Overview, code:block1 (┌───────────────────────────────────────────────────────────), code:block2 (src/), Commit History, Creative Portfolio Template ✅, Dashboard Page (`/resumes`), Database Schema (+29 more)

### Community 24 - "invoice.service.ts"
Cohesion: 0.20
Nodes (23): GET(), getCompanySettings(), fetchOrderPayments(), getCouponUsageByInvoice(), redeemCoupon(), releaseCoupon(), attachSubscriptionToInvoice(), CreateInvoiceParams (+15 more)

### Community 25 - "admin-header.tsx"
Cohesion: 0.10
Nodes (33): MutatePayload, UserRowActions(), UserRowActionsProps, NavbarProps, ThemeToggle(), Avatar(), AvatarBadge(), AvatarFallback() (+25 more)

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

### Community 30 - "ResumeArchitectChat.tsx"
Cohesion: 0.18
Nodes (12): @ai-sdk/react, streamdown, use-stick-to-bottom, AgentMark(), ArchitectSession(), isSnapshot(), MessageParts(), ReasoningBlock() (+4 more)

### Community 31 - "history/page.tsx"
Cohesion: 0.09
Nodes (19): GET /api/career-insights, CareerInsightsData, formatInr(), formatInrLong(), Props, SalaryBlocker, SalaryIntelligence, SalaryIntelligenceCard() (+11 more)

### Community 32 - "checkout/route.ts"
Cohesion: 0.20
Nodes (20): maxDuration, POST(), POST(), POST(), src_db_index_schema, coupons, couponUsage, invoice (+12 more)

### Community 33 - "04-production-hardening.spec.ts"
Cohesion: 0.22
Nodes (14): deleteExtraResumes(), ensureResume(), getResume(), listResumes(), patchResume(), resetResumeToBaseline(), ResumeBasics, ResumeData (+6 more)

### Community 34 - "helpers/audit.ts"
Cohesion: 0.20
Nodes (14): CORE_ROUTES, assertPageLoaded(), captureScreen(), countVisibleCTAs(), ensureReportDir(), FINDINGS_FILE, FindingSeverity, getPrimaryHeadings() (+6 more)

### Community 35 - "architect.service.ts"
Cohesion: 0.07
Nodes (52): GET(), maxDuration, POST(), requireResumeOwner(), RouteParams, extractJSON(), POST(), resumeChat (+44 more)

### Community 36 - "🌍 World-Class Multi-Industry Resume Architect — Complete Implementation Plan for Claude Opus 4.7"
Cohesion: 0.11
Nodes (17): 11.1 Export Formats, 11.2 Public Sharing, 12.1 User Dashboard, 12.2 Duplicate Resume, 14.1 Performance Optimizations, 14.2 Deployment Checklist, 4.1 Architecture, 4.2 Preview Communication (+9 more)

### Community 37 - "onboarding/page.tsx"
Cohesion: 0.10
Nodes (20): POST /api/parse-resume, GET+PATCH /api/profile, POST /api/resumes/[id]/ai/ats-score, GET+POST /api/resumes, motion, react-dropzone, ResumeScanResults Component, ResumeScannerLoader Component (+12 more)

### Community 38 - "Architecture Guidelines"
Cohesion: 0.18
Nodes (11): 1. Separation of Frontend and Backend, 2. API Routes over Server Actions, 3. Client-Side Data Fetching, 4. When to use Server Components, 5. Security and Validation, 6.1. High-Level System Architecture, 6.2. Database Entity Relationship Diagram (ERD), 6.3. Directory Map & Responsibilities (+3 more)

### Community 39 - "PHASE 9: KEY EDGE CASES & ERROR HANDLING"
Cohesion: 0.15
Nodes (13): 9.10 Mobile/Tablet Responsiveness, 9.11 Skill Database / Autocomplete, 9.12 Import Existing Resume, 9.1 Content Overflow / Multi-Page, 9.2 Data Loss Prevention, 9.3 Rich Text HTML Injection (XSS), 9.4 Large File / Image Handling, 9.5 PDF Generation Timeouts (Serverless) (+5 more)

### Community 40 - "lucide-react"
Cohesion: 0.09
Nodes (31): AnalysisError â€” Error screen for rate-limit / analysis failure with upgrade CTA, GET+POST /api/referrals, date-fns, lucide-react, AnalyticsData, AuditLog, ChartRow, GrowthChart() (+23 more)

### Community 41 - "AnalyzePageContent (Main Analysis Engine)"
Cohesion: 0.14
Nodes (14): AnalyzePageContent (Main Analysis Engine), GET /api/analysis-history/[id], POST /api/analyze-gaps, POST /api/save-analysis, POST /api/search-jobs, JobCard (Job Match Card), JobTitleAutocomplete Component, LearningRoadmap Component (+6 more)

### Community 42 - "Billing Retry API (POST /api/billing/retry)"
Cohesion: 0.28
Nodes (9): Billing Retry API (POST /api/billing/retry), Billing Subscription API (GET/DELETE /api/billing/subscription), Billing Webhook API (POST /api/billing/webhook), Cashfree Integration (@/lib/cashfree), Cashfree Payment Gateway, Invoice Service (@/services/billing/invoice.service), Payment Service (@/services/billing/payment.service), Subscription Service (@/services/billing/subscription.service) (+1 more)

### Community 43 - "PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER"
Cohesion: 0.18
Nodes (11): PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER, Week 10: Testing & QA, Week 1: Foundation, Week 2: Editor Shell, Week 3: All Form Sections, Week 4: Templates, Week 5: PDF Generation, Week 6: ATS Engine (+3 more)

### Community 44 - "data-table.tsx"
Cohesion: 0.13
Nodes (25): InvoiceModal (Invoice Detail Dialog), @tanstack/react-table, DatabasePage(), DataTable(), DataTableColumnHeader(), DataTableColumnHeaderProps, DataTableProps, getPageRange() (+17 more)

### Community 45 - "invoice-email.ts"
Cohesion: 0.11
Nodes (30): Invoice Generation, InvoicePdf, @react-pdf/renderer, GET(), CompanyTabProps, BillingInvoiceTable(), billingReasonLabel(), formatInvoiceNumber() (+22 more)

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
Cohesion: 0.09
Nodes (24): JobListItem (Tracked Job Card), POST+DELETE /api/save-job, GET /api/user-jobs, class-variance-authority, sonner, ResumeUploader Component, AuthConfigTab(), CompanyTab() (+16 more)

### Community 50 - "scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:generate, db:migrate, db:push, db:seed-plans, db:studio, db:test-user (+12 more)

### Community 51 - "pool.ts"
Cohesion: 0.60
Nodes (4): pg, buildDirectUrl(), getPool(), withTransaction()

### Community 52 - "PHASE 3: RESUME EDITOR & FORM BUILDER"
Cohesion: 0.25
Nodes (8): 3.1 Editor Layout (Three-Panel Design), 3.2 Section Components (shadcn/ui based), 3.3 Form State Management, 3.4 Validation Rules (Zod Schemas), code:block5 (+------------------+---------------------------+------------), code:typescript (// src/stores/resume-store.ts), code:typescript (// src/lib/validations/resume.ts), PHASE 3: RESUME EDITOR & FORM BUILDER

### Community 53 - "[id]/page.tsx"
Cohesion: 0.10
Nodes (21): SECTIONS, TOOLS, AtsIcon(), AtsIconProps, AtsScoreCtaProps, AtsScoreStickyBar(), ResumeEditorErrorFallback(), AtsScorePanel() (+13 more)

### Community 54 - "sign-in/page.tsx"
Cohesion: 0.13
Nodes (19): SignInForm (Client Component), SignUpForm (Client Component), GET /api/referrals/validate, auth-client (Better-Auth Client), checkUserExists (Server Action), authSlice (Redux Auth State), SignInForm(), GoogleSignInButton() (+11 more)

### Community 55 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 56 - "Google Analytics 4"
Cohesion: 0.29
Nodes (7): better-auth/client/plugins, Google Analytics 4, setUserId, trackPageView, analytics, auth-client, useAnalytics

### Community 57 - "(protected)/billing/page.tsx"
Cohesion: 0.11
Nodes (27): ClientProvider (Session-User Bridge), db (Drizzle ORM Database), db/schema (Drizzle Tables - plan, subscription, invoice, coupons, userProfile, resume), PricingPlans Component, PrimaryResumePage (Redirect), GET(), GET(), RenewalReminder() (+19 more)

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

### Community 67 - "analyze-gaps/route.ts"
Cohesion: 0.09
Nodes (40): CONTEXT_PATTERNS, SKILLS_TAXONOMY, SKILL_ALIASES, Job Visit DB Table (jobVisit), Resume Analysis DB Table (resumeAnalysis), AnalysisResponseSchema, arraysMatch(), extractJSON() (+32 more)

### Community 68 - "ats-score/route.ts"
Cohesion: 0.20
Nodes (17): AI Usage Logging Service (@/services/ai/usage.service), Resume ATS Analysis DB Table (resumeAtsAnalysis), Enhance Bullet AI API (POST /api/resumes/[id]/ai/enhance), AI Model (google/gemini-2.5-flash), HackClub AI Client (@/lib/hackClubClient), Roast Resume AI API (POST /api/resumes/[id]/ai/roast), AtsResultSchema, buildResumeText() (+9 more)

### Community 69 - "app/layout.tsx"
Cohesion: 0.15
Nodes (13): next-themes, @next/third-parties, @vercel/speed-insights, src_app_globals, inter, metadata, RootLayout(), satoshi (+5 more)

### Community 70 - "migrate.ts"
Cohesion: 0.15
Nodes (7): ref_fs, @neondatabase/serverless, ref_path, ref_url, __dirname, migrationsFolder, createTestUser()

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

### Community 76 - "search-jobs/route.ts"
Cohesion: 0.11
Nodes (20): Job Title Aliases DB Table (jobTitleAliases), Job Titles DB Table (jobTitles), GET(), GET(), GET(), GET(), dynamic, GET() (+12 more)

### Community 77 - "billing.ts"
Cohesion: 0.11
Nodes (17): dynamic, POST(), payment, verifyWebhookSignature(), getInitiatedPaymentForInvoice(), getInvoicePaymentStatus(), CashfreeWebhookEvent, CheckoutRequest (+9 more)

### Community 78 - "job_titles"
Cohesion: 0.67
Nodes (3): job_title_aliases, job_title_index, job_titles

### Community 79 - "user-actions-client.tsx"
Cohesion: 0.22
Nodes (12): UserActionsClient(), UserActionsClientProps, AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter() (+4 more)

### Community 80 - "ClientProvider.tsx"
Cohesion: 0.12
Nodes (18): authSlice, @reduxjs/toolkit, checkUserExists(), SignUpForm(), ProfilePage(), useAuth(), captureReferralCode(), claimStoredReferral() (+10 more)

### Community 81 - "nanoid"
Cohesion: 0.40
Nodes (5): MODEL_RATES, nanoid, seed-job-titles, title-normalizer, AiUsageService

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
Cohesion: 0.19
Nodes (12): recharts, ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload() (+4 more)

### Community 86 - "proxy.ts"
Cohesion: 0.40
Nodes (3): config, PROTECTED_ROUTES, NOTE: We intentionally do NOT redirect logged-in users away from auth

### Community 91 - "actions.ts"
Cohesion: 0.67
Nodes (7): useAdminActions(), banUserAction(), deleteUserAction(), ensureAdmin(), setRoleAction(), unbanUserAction(), logAuditAction()

### Community 92 - "tailor/route.ts"
Cohesion: 0.08
Nodes (33): HackClub AI Proxy, ai, @ai-sdk/openai, POST(), maxDuration, MODEL, POST(), RequestSchema (+25 more)

### Community 93 - "RichTextEditor.tsx"
Cohesion: 0.33
Nodes (5): @tiptap/extension-placeholder, @tiptap/react, @tiptap/starter-kit, RichTextEditor(), RichTextEditorProps

### Community 94 - "analytics/route.ts"
Cohesion: 0.40
Nodes (8): Google Analytics 4, @google-analytics/data, google-auth-library, GET(), getCoreMetrics(), getEventMetrics(), getGA4Client(), getRealtimeUsers()

### Community 96 - "validations/resume.ts"
Cohesion: 0.06
Nodes (30): awardItemSchema, basicsSchema, certificationItemSchema, CreateResumeInput, createResumeSchema, createVersionSchema, customSectionItemSchema, customSectionSchema (+22 more)

### Community 98 - "Quick Reference"
Cohesion: 0.18
Nodes (11): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+3 more)

### Community 111 - "hq/referrals/page.tsx"
Cohesion: 0.20
Nodes (5): AdminSummary, fmt(), ReferralRow, ReferralSettings, ReferralsPage()

### Community 145 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.22
Nodes (8): Available Domains, Available Stacks, How to Use, Output Formats, Prerequisites, Rule Categories by Priority, Search Reference, UI/UX Pro Max - Design Intelligence

### Community 146 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, noEmit, skipLibCheck, strict, target, include

### Community 147 - "cashfree.ts"
Cohesion: 0.22
Nodes (9): Cashfree Client, cashfree-pg, ref_crypto, CashfreeOrder, CashfreePaymentDetail, CashfreeRefundResult, createCashfreeRefund(), CreateOrderParams (+1 more)

### Community 148 - "input-group.tsx"
Cohesion: 0.22
Nodes (12): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+4 more)

### Community 150 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 151 - "generate-report.ts"
Cohesion: 0.29
Nodes (6): FINDINGS_FILE, OUTPUT, REPORT_DIR, UxFinding, ref_node_fs, ref_node_path

### Community 152 - "draft-recovery.ts"
Cohesion: 0.23
Nodes (10): ResumeEditorError(), ResumeEditorPage(), useAutoSave(), getResumeDraftKey(), getResumeIdFromPath(), hasResumeDraft(), loadResumeDraft(), MAX_RESUME_VERSION_RETRIES (+2 more)

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

### Community 160 - "ResumeScanResults.tsx"
Cohesion: 0.23
Nodes (11): AtsResult, AtsSuggestion, CategorizedSuggestion, categorizeSuggestion(), Category, CATEGORY_CONFIG, getScoreBg(), getScoreColor() (+3 more)

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

### Community 169 - "billing-utils.ts"
Cohesion: 0.22
Nodes (8): BillingError, GET /api/billing/payment-status, POST /api/billing/retry, PaymentStatusPage, calculateInvoiceAmounts(), generateIdempotencyKey(), nanoid, BillingCycle

### Community 179 - "(auth)/layout.tsx"
Cohesion: 0.20
Nodes (9): Better Auth (Authentication Library), create-test-user, directUrl, Neon Serverless PostgreSQL, drizzle-kit, Neon Database Connection Test, seed-plans, Custom Next.js Middleware (proxy.ts) (+1 more)

### Community 180 - "get-refresh-token.js"
Cohesion: 0.29
Nodes (6): ref_googleapis, ref_readline, oauth2Client, rl, scopes, url

### Community 182 - "Project Architecture Rules (AGENTS.md)"
Cohesion: 0.20
Nodes (6): Project Architecture Rules (AGENTS.md), CLAUDE.md â†’ AGENTS.md Redirect, GitHub project method, GitHub project tracking, graphify, Next.js Breaking Changes Warning

## Knowledge Gaps
- **777 isolated node(s):** `$schema`, `enabled`, `clientKind`, `useIgnoreFile`, `ignoreUnknown` (+772 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1045 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `cn`, `next`, `SkillsForm.tsx`, `button.tsx`, `analytics.ts`, `analyze/page.tsx`, `sidebar.tsx`, `types/resume.ts`, `package.json`, `sheet.tsx`, `input-group.tsx`, `draft-recovery.ts`, `admin-header.tsx`, `ResumeArchitectChat.tsx`, `history/page.tsx`, `onboarding/page.tsx`, `lucide-react`, `data-table.tsx`, `invoice-email.ts`, `profile/page.tsx`, `(auth)/layout.tsx`, `[id]/page.tsx`, `sign-in/page.tsx`, `(protected)/billing/page.tsx`, `app/layout.tsx`, `app-shell.tsx`, `user-actions-client.tsx`, `ClientProvider.tsx`, `chart.tsx`, `RichTextEditor.tsx`, `hq/referrals/page.tsx`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Why does `next` connect `next` to `referral.service.ts`, `button.tsx`, `analytics.ts`, `analyze/page.tsx`, `sidebar.tsx`, `schema.ts`, `app-settings.ts`, `invoices/route.ts`, `parse-resume/route.ts`, `types/resume.ts`, `package.json`, `invoice.service.ts`, `admin-header.tsx`, `draft-recovery.ts`, `history/page.tsx`, `checkout/route.ts`, `ResumeScanResults.tsx`, `architect.service.ts`, `onboarding/page.tsx`, `lucide-react`, `Root Layout`, `profile/page.tsx`, `(auth)/layout.tsx`, `[id]/page.tsx`, `sign-in/page.tsx`, `(protected)/billing/page.tsx`, `analyze-gaps/route.ts`, `ats-score/route.ts`, `app/layout.tsx`, `app-shell.tsx`, `search-jobs/route.ts`, `billing.ts`, `ClientProvider.tsx`, `proxy.ts`, `actions.ts`, `tailor/route.ts`, `analytics/route.ts`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `Project Architecture Rules (AGENTS.md)` connect `Project Architecture Rules (AGENTS.md)` to `(auth)/layout.tsx`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `$schema`, `enabled`, `clientKind` to the rest of the system?**
  _777 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.08084163898117387 - nodes in this community are weakly interconnected._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.07989464442493416 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03508771929824561 - nodes in this community are weakly interconnected._