# Graph Report - workspace  (2026-10-22)

## Corpus Check
- 371 files · ~239,141 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 4, .woff2 3, .ico 2)

## Summary
- 2467 nodes · 7794 edges · 156 communities (102 shown, 54 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 426 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6814464f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- db/index.ts
- dependencies
- CreativePortfolioTemplate.tsx
- SkillsForm
- referral.service.ts
- parse-resume/route.ts
- button.tsx
- Badge
- analyze/page.tsx
- schema.ts
- sidebar.tsx
- Resend
- PricingPlans.tsx
- nanoid
- app-settings.ts
- biome.json
- user
- lib/auth.ts
- resumes/page.tsx
- types/resume.ts
- package.json
- profile/route.ts
- Resume Architect — Implementation Plan
- checkout/route.ts
- admin-header.tsx
- Neon Serverless Postgres
- Neon Serverless Postgres
- components.json
- cashfree.ts
- ResumeArchitectChat.tsx
- app/page.tsx
- sanitize.ts
- 04-production-hardening.spec.ts
- helpers/audit.ts
- architect.service.ts
- 🌍 World-Class Multi-Industry Resume Architect — Complete Implementation Plan for Claude Opus 4.7
- onboarding/page.tsx
- Architecture Guidelines
- PHASE 9: KEY EDGE CASES & ERROR HANDLING
- react
- AnalyzePageContent (Main Analysis Engine)
- billing.ts
- PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER
- WebhookService
- invoice-email.ts
- PHASE 7: AI-POWERED FEATURES
- Root Layout
- Resume Builder Actual Implementation Plan
- profile/page.tsx
- scripts
- coupon.service.ts
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
- history/page.tsx
- app/layout.tsx
- Billing Retry API (POST /api/billing/retry)
- PHASE 0: PRE-IMPLEMENTATION PREPARATION
- PHASE 8: INDUSTRY-SPECIFIC SMART DEFAULTS
- AdminHeader â€” HQ top bar with breadcrumb nav, search, notifications, user menu
- seed-plans.ts
- nanoid
- next
- FileUpload
- job_titles
- VersionHistorySheet.tsx
- GitHub project method (mandatory)
- scripts
- devDependencies
- chart.tsx
- sendMail
- Globe (World) Icon
- DataTable â€” Generic admin data table with sort/filter/paginate/export capabilities
- POST /api/referrals/claim
- saveToLocal
- tailor/route.ts
- analytics/route.ts
- job-titles.ts
- validations/resume.ts
- Adzuna API
- Quick Reference
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
- MOBILE_BREAKPOINT
- STORAGE_KEY
- UI/UX Pro Max - Design Intelligence
- compilerOptions
- Frontend Design
- generate-report.ts
- ResumeData
- Pre-Delivery Checklist
- How to Use This Skill
- @playwright/test
- Common Rules for Professional UI
- Example Workflow
- resend
- ReferralPanel
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
3. `react` - 133 edges
4. `Card()` - 114 edges
5. `CardContent()` - 109 edges
6. `lucide-react` - 108 edges
7. `next` - 100 edges
8. `Badge()` - 68 edges
9. `Input()` - 68 edges
10. `CardHeader()` - 64 edges

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

## Communities (156 total, 54 thin omitted)

### Community 0 - "cn"
Cohesion: 0.08
Nodes (42): LocationCombobox(), LocationComboboxProps, BreadcrumbEllipsis(), CardAction(), Command(), CommandEmpty(), CommandGroup(), CommandInput() (+34 more)

### Community 1 - "db/index.ts"
Cohesion: 0.08
Nodes (24): received_email, drizzle-orm, ALLOWED_TABLES, GET(), resend, dynamic, GET(), GET() (+16 more)

### Community 2 - "dependencies"
Cohesion: 0.04
Nodes (56): dependencies, ai, @ai-sdk/openai, @ai-sdk/react, @base-ui/react, better-auth, cashfree-pg, class-variance-authority (+48 more)

### Community 3 - "CreativePortfolioTemplate.tsx"
Cohesion: 0.18
Nodes (25): ContactItem, DropdownMenu, Template Registry, formatProfileText, getProfileIcon, @tabler/icons-react, TEMPLATE_COMPONENTS, PreviewPanel (+17 more)

### Community 4 - "SkillsForm"
Cohesion: 0.11
Nodes (55): @dnd-kit/core, @dnd-kit/sortable, @hookform/resolvers, react-hook-form, react-redux, zod, AtsScorePanel, AtsResult (+47 more)

### Community 5 - "referral.service.ts"
Cohesion: 0.09
Nodes (36): Referral Claim API (POST /api/referrals/claim), Referral Validate API (GET /api/referrals/validate), dynamic, GET(), POST(), requireAdmin(), dynamic, POST() (+28 more)

### Community 6 - "parse-resume/route.ts"
Cohesion: 0.11
Nodes (23): Duplicate Resume API (POST /api/resumes/[id]/duplicate), Enhance Bullet AI API (POST /api/resumes/[id]/ai/enhance), Export Resume API (POST /api/resumes/[id]/export), Restore Version API (POST /api/resumes/[id]/versions/[versionId]/restore), Resume Versions API (GET/POST /api/resumes/[id]/versions), Resume CRUD API (GET/PATCH/DELETE /api/resumes/[id]), Resumes List/Create API (GET/POST /api/resumes), Roast Resume AI API (POST /api/resumes/[id]/ai/roast) (+15 more)

### Community 7 - "button.tsx"
Cohesion: 0.11
Nodes (9): AlertDialog, InputGroup, ErrorPage(), NotFound(), ErrorBoundary, Props, State, RichTextEditor (+1 more)

### Community 8 - "Badge"
Cohesion: 0.05
Nodes (102): InvoiceModal (Invoice Detail Dialog), JobListItem (Tracked Job Card), POST /api/billing/checkout, POST /api/billing/coupons/validate, POST+DELETE /api/save-job, GET /api/user-jobs, @base-ui/react, class-variance-authority (+94 more)

### Community 9 - "analyze/page.tsx"
Cohesion: 0.05
Nodes (92): AnalyzeTypes â€” ReviewState and FilterState type definitions for the analyze workflow, JobFilters â€” Advanced job filter panel (title, city, work type, emp type, match score, salary), ParsingProgress â€” Resume parsing progress panel with ProgressTimeline and skill preview, ProfileReview â€” Post-parse profile editor for skills, job titles, and experience before analysis, ResultsHeader â€” Analysis results header with user profile card and summary stat cards, StatCard â€” Simple stat display card with large value + label (used in results header), AnalyzePage(), AnalyzePageContent() (+84 more)

### Community 10 - "schema.ts"
Cohesion: 0.06
Nodes (28): Public Plans Listing Endpoint, checkUserExists Server Action, RouteParams, RouteParams, account, aiActionEnum, billingCycleEnum, billingReasonEnum (+20 more)

### Community 11 - "sidebar.tsx"
Cohesion: 0.14
Nodes (33): AdminLayout(), AdminSidebar(), items, AppShell(), AppShellProps, MobileBottomNav(), UserSidebar(), NavUser (+25 more)

### Community 13 - "PricingPlans.tsx"
Cohesion: 0.21
Nodes (17): AnalysisError â€” Error screen for rate-limit / analysis failure with upgrade CTA, Plan, PricingPlans(), InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants (+9 more)

### Community 14 - "nanoid"
Cohesion: 0.12
Nodes (16): nanoid, dynamic, GET(), POST(), requireAdmin(), dynamic, POST(), RouteParams (+8 more)

### Community 15 - "app-settings.ts"
Cohesion: 0.24
Nodes (9): GET(), POST(), requireAdmin(), appSettings, APP_SETTING_KEYS, AppSettingKey, ReferralSettings, saveCompanySettings() (+1 more)

### Community 16 - "biome.json"
Cohesion: 0.06
Nodes (31): source, assist, actions, next, react, files, ignoreUnknown, includes (+23 more)

### Community 17 - "user"
Cohesion: 0.07
Nodes (38): account, ai_usage_log, audit_log, coupon_usage, coupons, ai_action, billing_cycle, billing_reason (+30 more)

### Community 18 - "lib/auth.ts"
Cohesion: 0.09
Nodes (38): Admin Analytics (GA4) Endpoint, Admin Audit Log Endpoint, Admin Database Browser Endpoint, Admin Emails (Resend) Endpoint, Admin Referrals Management Endpoint, Admin Learning Resources CRUD Endpoint, Admin Settings (Plans & Coupons) Endpoint, Admin Stats (Revenue, AI, Growth) Endpoint (+30 more)

### Community 19 - "resumes/page.tsx"
Cohesion: 0.10
Nodes (17): ResumeThumbnail (Template Preview), GET+PATCH+DELETE /api/resumes/[id], POST /api/resumes/[id]/duplicate, POST /api/resumes/[id]/export, resumeSlice (Redux Resume Editor State), Redux Store, PreviewPanel (Live Resume Preview), ResumeEditorPage (Rich Resume Editor) (+9 more)

### Community 20 - "types/resume.ts"
Cohesion: 0.08
Nodes (32): calculateTotalExperience(), enrichResumeMetadata(), extractJobTitles(), parseDate(), GENERIC_SKILL_GROUP_NAMES, RESUME_LIMITS, initialState, TailoredPayload (+24 more)

### Community 21 - "package.json"
Cohesion: 0.06
Nodes (33): engines, node, tsx, name, private, version, babel-plugin-react-compiler, @biomejs/biome (+25 more)

### Community 22 - "profile/route.ts"
Cohesion: 0.17
Nodes (12): GET(), PATCH(), PATCH(), RouteParams, POST(), userProfile, ensureUserProfile(), OnboardingStatus (+4 more)

### Community 23 - "Resume Architect — Implementation Plan"
Cohesion: 0.05
Nodes (37): API Routes, Architecture Overview, code:block1 (┌───────────────────────────────────────────────────────────), code:block2 (src/), Commit History, Creative Portfolio Template ✅, Dashboard Page (`/resumes`), Database Schema (+29 more)

### Community 24 - "checkout/route.ts"
Cohesion: 0.14
Nodes (32): maxDuration, POST(), GET(), invoice, payment, getCompanySettings(), calculateInvoiceAmounts(), fetchOrderPayments() (+24 more)

### Community 25 - "admin-header.tsx"
Cohesion: 0.15
Nodes (29): MutatePayload, UserRowActions(), UserRowActionsProps, BillingClientShell(), ResumesPage(), AdminHeader(), DataTableColumnHeader(), AppHeader() (+21 more)

### Community 26 - "Neon Serverless Postgres"
Cohesion: 0.08
Nodes (24): Autoscaling, Branching, Connection Methods & Drivers, Connection Pooling, Developer Tools, Fetching Docs as Markdown, Finding the Right Page, Getting Started (+16 more)

### Community 27 - "Neon Serverless Postgres"
Cohesion: 0.08
Nodes (24): Autoscaling, Branching, Connection Methods & Drivers, Connection Pooling, Developer Tools, Fetching Docs as Markdown, Finding the Right Page, Getting Started (+16 more)

### Community 28 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 29 - "cashfree.ts"
Cohesion: 0.15
Nodes (14): cashfree-pg, GET(), POST(), generateIdempotencyKey(), nanoid, CashfreeOrder, CashfreePaymentDetail, CashfreeRefundResult (+6 more)

### Community 30 - "ResumeArchitectChat.tsx"
Cohesion: 0.13
Nodes (26): @ai-sdk/react, streamdown, use-stick-to-bottom, buildColumns(), UserDetailPage(), AgentMark(), ArchitectSession(), isSnapshot() (+18 more)

### Community 31 - "app/page.tsx"
Cohesion: 0.33
Nodes (7): HomePage(), formatInr(), UserDashboard(), DashboardSkeleton(), GridPattern(), WordFadeIn(), WordFadeInProps

### Community 32 - "sanitize.ts"
Cohesion: 0.18
Nodes (19): asRichText(), clampStringList(), clampTailoredPayload(), clampText(), escapeHtml(), isBlank(), isBlankAwardItem(), isBlankCertificationItem() (+11 more)

### Community 33 - "04-production-hardening.spec.ts"
Cohesion: 0.22
Nodes (14): deleteExtraResumes(), ensureResume(), getResume(), listResumes(), patchResume(), resetResumeToBaseline(), ResumeBasics, ResumeData (+6 more)

### Community 34 - "helpers/audit.ts"
Cohesion: 0.20
Nodes (14): CORE_ROUTES, assertPageLoaded(), captureScreen(), countVisibleCTAs(), ensureReportDir(), FINDINGS_FILE, FindingSeverity, getPrimaryHeadings() (+6 more)

### Community 35 - "architect.service.ts"
Cohesion: 0.12
Nodes (33): GET(), maxDuration, POST(), requireResumeOwner(), RouteParams, load(), restore(), resumeChat (+25 more)

### Community 36 - "🌍 World-Class Multi-Industry Resume Architect — Complete Implementation Plan for Claude Opus 4.7"
Cohesion: 0.11
Nodes (17): 11.1 Export Formats, 11.2 Public Sharing, 12.1 User Dashboard, 12.2 Duplicate Resume, 14.1 Performance Optimizations, 14.2 Deployment Checklist, 4.1 Architecture, 4.2 Preview Communication (+9 more)

### Community 37 - "onboarding/page.tsx"
Cohesion: 0.07
Nodes (33): POST /api/parse-resume, GET+PATCH /api/profile, POST /api/resumes/[id]/ai/ats-score, GET+POST /api/resumes, react-dropzone, ResumeScanResults Component, ResumeScannerLoader Component, AtsResult (+25 more)

### Community 38 - "Architecture Guidelines"
Cohesion: 0.18
Nodes (11): 1. Separation of Frontend and Backend, 2. API Routes over Server Actions, 3. Client-Side Data Fetching, 4. When to use Server Components, 5. Security and Validation, 6.1. High-Level System Architecture, 6.2. Database Entity Relationship Diagram (ERD), 6.3. Directory Map & Responsibilities (+3 more)

### Community 39 - "PHASE 9: KEY EDGE CASES & ERROR HANDLING"
Cohesion: 0.15
Nodes (13): 9.10 Mobile/Tablet Responsiveness, 9.11 Skill Database / Autocomplete, 9.12 Import Existing Resume, 9.1 Content Overflow / Multi-Page, 9.2 Data Loss Prevention, 9.3 Rich Text HTML Injection (XSS), 9.4 Large File / Image Handling, 9.5 PDF Generation Timeouts (Serverless) (+5 more)

### Community 40 - "react"
Cohesion: 0.09
Nodes (61): GET+POST /api/referrals, date-fns, lucide-react, react, recharts, ForgotPasswordPage(), ResetPasswordForm(), ResetPasswordPage() (+53 more)

### Community 41 - "AnalyzePageContent (Main Analysis Engine)"
Cohesion: 0.14
Nodes (14): AnalyzePageContent (Main Analysis Engine), GET /api/analysis-history/[id], POST /api/analyze-gaps, POST /api/save-analysis, POST /api/search-jobs, JobCard (Job Match Card), JobTitleAutocomplete Component, LearningRoadmap Component (+6 more)

### Community 42 - "billing.ts"
Cohesion: 0.13
Nodes (15): dynamic, POST(), verifyWebhookSignature(), CreateInvoiceParams, BillingReason, CashfreeWebhookEvent, CheckoutRequest, CheckoutResponse (+7 more)

### Community 43 - "PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER"
Cohesion: 0.18
Nodes (11): PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER, Week 10: Testing & QA, Week 1: Foundation, Week 2: Editor Shell, Week 3: All Form Sections, Week 4: Templates, Week 5: PDF Generation, Week 6: ATS Engine (+3 more)

### Community 44 - "WebhookService"
Cohesion: 0.33
Nodes (8): seed-plans, CouponService, InvoiceService, PaymentService, ReferralService, SubscriptionService, WebhookService, BillingTypes

### Community 45 - "invoice-email.ts"
Cohesion: 0.18
Nodes (19): @react-pdf/renderer, CompanyTabProps, InvoicePdf, billingReasonLabel(), colors, fmtDate(), formatInvNum(), InvoicePdf() (+11 more)

### Community 46 - "PHASE 7: AI-POWERED FEATURES"
Cohesion: 0.22
Nodes (9): 7.1 AI Bullet Point Writer, 7.2 AI Summary Generator, 7.3 AI Tailoring (Resume ↔ Job Description), 7.4 AI Resume Roast / Feedback, code:typescript (// Prompt template:), code:typescript (// Prompt template:), code:typescript (// Steps:), code:typescript (// Prompt: "You are a brutally honest career coach. Analyze ) (+1 more)

### Community 47 - "Root Layout"
Cohesion: 0.24
Nodes (7): Global CSS Migration to shadcn Theme, Home Page (Landing), nextConfig, Root Layout, Global Error Boundary, Global Loading Component, 404 Not Found Page

### Community 49 - "profile/page.tsx"
Cohesion: 0.22
Nodes (7): ResumeUploader Component, ProtectedLoading(), JobTitleAutocomplete(), JobTitleAutocompleteProps, Navbar (Global Navigation), FieldSeparator(), Separator()

### Community 50 - "scripts"
Cohesion: 0.10
Nodes (21): scripts, build, db:generate, db:migrate, db:push, db:seed-plans, db:studio, db:test-user (+13 more)

### Community 51 - "coupon.service.ts"
Cohesion: 0.20
Nodes (11): pg, POST(), buildDirectUrl(), getPool(), withTransaction(), couponUsage, calculateDiscount(), reserveCoupon() (+3 more)

### Community 52 - "PHASE 3: RESUME EDITOR & FORM BUILDER"
Cohesion: 0.25
Nodes (8): 3.1 Editor Layout (Three-Panel Design), 3.2 Section Components (shadcn/ui based), 3.3 Form State Management, 3.4 Validation Rules (Zod Schemas), code:block5 (+------------------+---------------------------+------------), code:typescript (// src/stores/resume-store.ts), code:typescript (// src/lib/validations/resume.ts), PHASE 3: RESUME EDITOR & FORM BUILDER

### Community 53 - "Button"
Cohesion: 0.17
Nodes (36): motion, ResumeEditorPage(), SECTIONS, TOOLS, AtsIcon(), AtsIconProps, AtsScoreCtaProps, AtsScoreStickyBar() (+28 more)

### Community 54 - "sign-up/page.tsx"
Cohesion: 0.06
Nodes (38): SignInForm (Client Component), SignUpForm (Client Component), GET /api/referrals/validate, auth-client (Better-Auth Client), checkUserExists (Server Action), authSlice (Redux Auth State), @reduxjs/toolkit, checkUserExists() (+30 more)

### Community 55 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 56 - "Google Analytics 4"
Cohesion: 0.29
Nodes (5): setUserId, trackPageView, analytics, auth-client, useAnalytics

### Community 57 - "(protected)/billing/page.tsx"
Cohesion: 0.10
Nodes (34): GET /api/billing/payment-status, POST /api/billing/retry, ClientProvider (Session-User Bridge), db (Drizzle ORM Database), db/schema (Drizzle Tables - plan, subscription, invoice, coupons, userProfile, resume), PaymentStatusPage, PricingPlans Component, PrimaryResumePage (Redirect) (+26 more)

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
Cohesion: 0.09
Nodes (32): AnalysisResponseSchema, arraysMatch(), extractJSON(), filterGapsByRelevantNames(), maxDuration, MODEL, POST(), RoadmapItemSchema (+24 more)

### Community 68 - "history/page.tsx"
Cohesion: 0.29
Nodes (9): GET /api/career-insights, CareerInsightsData, CareerInsightsPage(), formatInr(), formatInrLong(), Props, SalaryBlocker, SalaryIntelligence (+1 more)

### Community 69 - "app/layout.tsx"
Cohesion: 0.18
Nodes (11): next-themes, @next/third-parties, @vercel/speed-insights, inter, metadata, RootLayout(), satoshi, ThemeProvider() (+3 more)

### Community 70 - "Billing Retry API (POST /api/billing/retry)"
Cohesion: 0.28
Nodes (3): Billing Retry API (POST /api/billing/retry), Billing Subscription API (GET/DELETE /api/billing/subscription), Billing Webhook API (POST /api/billing/webhook)

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
Cohesion: 0.12
Nodes (10): dotenv, @neondatabase/serverless, cleanUrl, __dirname, migrationsFolder, createTestUser(), coupons, db (+2 more)

### Community 76 - "next"
Cohesion: 0.10
Nodes (17): next, GET(), dynamic, GET(), AdzunaResult, buildSalaryString(), maxDuration, optimizeJobTitle() (+9 more)

### Community 78 - "job_titles"
Cohesion: 0.67
Nodes (3): job_title_aliases, job_title_index, job_titles

### Community 79 - "VersionHistorySheet.tsx"
Cohesion: 0.12
Nodes (40): useAdminActions(), banUserAction(), deleteUserAction(), ensureAdmin(), setRoleAction(), unbanUserAction(), UserActionsClient(), UserActionsClientProps (+32 more)

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
Cohesion: 0.20
Nodes (11): coupons, referralRewards, referrals, sendOTPMail(), sendRefereeWelcomeEmail(), sendReferrerRewardEmail(), resend, sendMail() (+3 more)

### Community 92 - "tailor/route.ts"
Cohesion: 0.08
Nodes (30): ai, @ai-sdk/openai, POST(), maxDuration, MODEL, POST(), RequestSchema, RouteParams (+22 more)

### Community 94 - "analytics/route.ts"
Cohesion: 0.40
Nodes (7): @google-analytics/data, google-auth-library, GET(), getCoreMetrics(), getEventMetrics(), getGA4Client(), getRealtimeUsers()

### Community 96 - "validations/resume.ts"
Cohesion: 0.06
Nodes (29): awardItemSchema, basicsSchema, certificationItemSchema, CreateResumeInput, createResumeSchema, createVersionSchema, customSectionItemSchema, customSectionSchema (+21 more)

### Community 98 - "Quick Reference"
Cohesion: 0.18
Nodes (11): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+3 more)

### Community 111 - "hq/referrals/page.tsx"
Cohesion: 0.22
Nodes (6): AdminSummary, fmt(), ReferralRow, ReferralSettings, ReferralsPage(), SummaryCards()

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

### Community 152 - "ResumeData"
Cohesion: 0.16
Nodes (16): ResumeEditorError(), metadata, PublicResumePage(), PublicResume, PublicResumeView(), ResultsHeaderProps, ResumeDocument(), getResumeDraftKey() (+8 more)

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

### Community 165 - "ReferralPanel"
Cohesion: 0.50
Nodes (3): ReferralPanel(), copyLink(), shareLink()

### Community 166 - "Tips for Better Results"
Cohesion: 0.50
Nodes (4): Common Sticking Points, Pre-Delivery Checklist, Query Strategy, Tips for Better Results

### Community 167 - "When to Apply"
Cohesion: 0.50
Nodes (4): Must Use, Recommended, Skip, When to Apply

### Community 179 - "(auth)/layout.tsx"
Cohesion: 0.24
Nodes (5): directUrl, drizzle-kit, Neon Database Connection Test, Custom Next.js Middleware (proxy.ts), create-test-user

### Community 180 - "get-refresh-token.js"
Cohesion: 0.29
Nodes (4): oauth2Client, rl, scopes, url

### Community 182 - "Project Architecture Rules (AGENTS.md)"
Cohesion: 0.20
Nodes (5): Project Architecture Rules (AGENTS.md), CLAUDE.md â†’ AGENTS.md Redirect, GitHub project method, GitHub project tracking, graphify

## Knowledge Gaps
- **144 isolated node(s):** `tsx`, `@fontsource-variable/inter`, `@types/pdf-parse`, `geist`, `pdf-parse` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 955 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `db/index.ts`, `referral.service.ts`, `parse-resume/route.ts`, `button.tsx`, `Badge`, `analyze/page.tsx`, `schema.ts`, `sidebar.tsx`, `PricingPlans.tsx`, `nanoid`, `resumes/page.tsx`, `package.json`, `profile/route.ts`, `checkout/route.ts`, `admin-header.tsx`, `ResumeData`, `cashfree.ts`, `ResumeArchitectChat.tsx`, `app/page.tsx`, `architect.service.ts`, `onboarding/page.tsx`, `react`, `billing.ts`, `Root Layout`, `profile/page.tsx`, `(auth)/layout.tsx`, `Button`, `sign-up/page.tsx`, `(protected)/billing/page.tsx`, `analyze-gaps/route.ts`, `history/page.tsx`, `app/layout.tsx`, `VersionHistorySheet.tsx`, `tailor/route.ts`, `analytics/route.ts`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **What connects `tsx`, `@fontsource-variable/inter`, `@types/pdf-parse` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.07955596669750231 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `cn`, `db/index.ts`, `CreativePortfolioTemplate.tsx`, `SkillsForm`, `button.tsx`, `Badge`, `analyze/page.tsx`, `sidebar.tsx`, `PricingPlans.tsx`, `resumes/page.tsx`, `package.json`, `ResumeData`, `admin-header.tsx`, `ResumeArchitectChat.tsx`, `app/page.tsx`, `onboarding/page.tsx`, `invoice-email.ts`, `profile/page.tsx`, `(auth)/layout.tsx`, `Button`, `sign-up/page.tsx`, `(protected)/billing/page.tsx`, `history/page.tsx`, `app/layout.tsx`, `VersionHistorySheet.tsx`, `chart.tsx`, `hq/referrals/page.tsx`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Should `db/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08315863032844165 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `Button` to `cn`, `SkillsForm`, `button.tsx`, `Badge`, `analyze/page.tsx`, `sidebar.tsx`, `PricingPlans.tsx`, `resumes/page.tsx`, `ResumeData`, `admin-header.tsx`, `ResumeArchitectChat.tsx`, `Common Rules for Professional UI`, `app/page.tsx`, `onboarding/page.tsx`, `ReferralPanel`, `react`, `profile/page.tsx`, `sign-up/page.tsx`, `history/page.tsx`, `VersionHistorySheet.tsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03571428571428571 - nodes in this community are weakly interconnected._