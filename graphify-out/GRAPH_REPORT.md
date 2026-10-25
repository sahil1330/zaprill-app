# Graph Report - workspace  (2026-10-23)

## Corpus Check
- 426 files · ~282,043 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 4, .woff2 3, .ico 2)

## Summary
- 2926 nodes · 9112 edges · 165 communities (111 shown, 54 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 440 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a248a8fa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- sanitize.ts
- dependencies
- ResumeData
- schema.ts
- referral.service.ts
- ats-score/route.ts
- ErrorBoundary
- VersionHistorySheet.tsx
- analytics.ts
- JobCard.tsx
- sidebar.tsx
- Resend
- (protected)/billing/page.tsx
- data-table.tsx
- sign-up/page.tsx
- biome.json
- user
- lib/auth.ts
- coupons-content.tsx
- resumes/page.tsx
- package.json
- derive.ts
- Resume Architect — Implementation Plan
- webhook.service.ts
- ResumeArchitectChat.tsx
- Neon Serverless Postgres
- Neon Serverless Postgres
- components.json
- requireApiUserId
- review.ts
- nanoid
- normalizeCareerKey
- checkout/route.ts
- getCareerProfile
- architect.service.ts
- 🌍 World-Class Multi-Industry Resume Architect — Complete Implementation Plan for Claude Opus 4.7
- onboarding/page.tsx
- validations/career-profile.ts
- PHASE 9: KEY EDGE CASES & ERROR HANDLING
- react
- billing.ts
- jobs/page.tsx
- PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER
- career-profile.service.ts
- invoice-email.ts
- PHASE 7: AI-POWERED FEATURES
- Root Layout
- Resume Builder Actual Implementation Plan
- intelligence-dashboard.tsx
- scripts
- types/resume.ts
- PHASE 3: RESUME EDITOR & FORM BUILDER
- Input
- subscription.service.ts
- compilerOptions
- Google Analytics 4
- cashfree.ts
- resume-editor.ts
- PHASE 5: PDF GENERATION STRATEGY (DUAL-ENGINE)
- PHASE 2: TEMPLATE SYSTEM ARCHITECTURE
- AGENTS.md
- PHASE 6: ATS OPTIMIZATION ENGINE
- PHASE 1: DATABASE SCHEMA DESIGN (Drizzle ORM)
- PHASE 10: USER EXPERIENCE & TOOLTIPS
- README.md
- useAuth
- auth
- admin-header.tsx
- app/layout.tsx
- versions/route.ts
- PHASE 0: PRE-IMPLEMENTATION PREPARATION
- PHASE 8: INDUSTRY-SPECIFIC SMART DEFAULTS
- AdminHeader â€” HQ top bar with breadcrumb nav, search, notifications, user menu
- seed-plans.ts
- analyze/page.tsx
- next
- api/referrals/route.ts
- job_titles
- invoice.service.ts
- types/index.ts
- normalizeResumeData
- GitHub project method (mandatory)
- [slug]/route.ts
- devDependencies
- chart.tsx
- sendMail
- Globe (World) Icon
- DataTable â€” Generic admin data table with sort/filter/paginate/export capabilities
- POST /api/referrals/claim
- saveToLocal
- pool.ts
- JobFilters â€” Advanced job filter panel (title, city, work type, emp type, match score, salary)
- resume-owner-fixes.test.ts
- analytics/route.ts
- job-titles.ts
- validations/resume.ts
- Adzuna API
- Quick Reference
- SkillGapPanel.tsx
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
- LearningRoadmap.tsx
- WebhookService
- draft-recovery.ts
- MOBILE_BREAKPOINT
- STORAGE_KEY
- auth-cookie-domain.ts
- UI/UX Pro Max - Design Intelligence
- compilerOptions
- Billing Retry API (POST /api/billing/retry)
- Frontend Design
- backfill-migrations.ts
- updateCareerProfile
- Pre-Delivery Checklist
- How to Use This Skill
- actions.ts
- r/route.ts
- Common Rules for Professional UI
- Example Workflow
- nanoid
- FileUpload
- Migrations
- Tips for Better Results
- When to Apply
- test-result.js
- MemeLoader â€” Playful loading screen with animated GIFs during job search/analysis
- DELETE /api/billing/subscription
- { signIn, signOut, signUp, useSession, getSession }
- get-refresh-token.js
- app_settings

## God Nodes (most connected - your core abstractions)
1. `cn()` - 226 edges
2. `Button()` - 166 edges
3. `react` - 135 edges
4. `Card()` - 118 edges
5. `CardContent()` - 113 edges
6. `next` - 111 edges
7. `lucide-react` - 109 edges
8. `Badge()` - 70 edges
9. `Input()` - 70 edges
10. `CardHeader()` - 67 edges

## Surprising Connections (you probably didn't know these)
- `Interaction (App)` --references--> `Button()`  [INFERRED]
  .agents/skills/ui-ux-pro-max/SKILL.md → src/components/ui/button.tsx
- `10. Open questions` --references--> `recordVerifiedSkill()`  [INFERRED]
  docs/skill-coach.md → src/services/career/career-profile.service.ts
- `D — Verified skill. Partial. Signature changed.` --references--> `recordVerifiedSkill()`  [INFERRED]
  docs/skill-coach.md → src/services/career/career-profile.service.ts
- `Phase 0 — this document` --references--> `recordVerifiedSkill()`  [INFERRED]
  docs/skill-coach.md → src/services/career/career-profile.service.ts
- `4.2 `coach_plan`` --references--> `RoadmapItem`  [INFERRED]
  docs/skill-coach.md → src/types/index.ts

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

## Communities (165 total, 54 thin omitted)

### Community 0 - "cn"
Cohesion: 0.08
Nodes (48): INDIA_CITIES, LocationCombobox(), LocationComboboxProps, BreadcrumbEllipsis(), CardAction(), Command(), CommandEmpty(), CommandGroup() (+40 more)

### Community 1 - "sanitize.ts"
Cohesion: 0.06
Nodes (54): 5.4 Cost model, maxDuration, POST(), RequestSchema, RouteParams, maxDuration, MODEL, POST() (+46 more)

### Community 2 - "dependencies"
Cohesion: 0.04
Nodes (56): dependencies, ai, @ai-sdk/openai, @ai-sdk/react, @base-ui/react, better-auth, cashfree-pg, class-variance-authority (+48 more)

### Community 3 - "ResumeData"
Cohesion: 0.18
Nodes (29): ContactItem, DropdownMenu, Template Registry, formatProfileText, getProfileIcon, @tabler/icons-react, HtmlContent(), HtmlContentProps (+21 more)

### Community 4 - "schema.ts"
Cohesion: 0.06
Nodes (33): dynamic, dynamic, account, aiActionEnum, auditLog, billingCycleEnum, billingReasonEnum, careerEmploymentTypeEnum (+25 more)

### Community 5 - "referral.service.ts"
Cohesion: 0.11
Nodes (28): dynamic, GET(), POST(), requireAdmin(), dynamic, POST(), dynamic, GET() (+20 more)

### Community 6 - "ats-score/route.ts"
Cohesion: 0.24
Nodes (10): Duplicate Resume API (POST /api/resumes/[id]/duplicate), Enhance Bullet AI API (POST /api/resumes/[id]/ai/enhance), Export Resume API (POST /api/resumes/[id]/export), Restore Version API (POST /api/resumes/[id]/versions/[versionId]/restore), Resume Versions API (GET/POST /api/resumes/[id]/versions), Resume CRUD API (GET/PATCH/DELETE /api/resumes/[id]), Resumes List/Create API (GET/POST /api/resumes), Roast Resume AI API (POST /api/resumes/[id]/ai/roast) (+2 more)

### Community 8 - "VersionHistorySheet.tsx"
Cohesion: 0.09
Nodes (52): AlertDialog, InputGroup, class-variance-authority, ErrorPage(), UserActionsClient(), UserActionsClientProps, CancelSubscriptionButton(), ResumeEditorPage() (+44 more)

### Community 9 - "analytics.ts"
Cohesion: 0.18
Nodes (34): AnalyticsProvider(), useAnalytics(), clearUserId(), GA_MEASUREMENT_ID, gtag(), GtagCommand, JobEventParams, ResumeFileParams (+26 more)

### Community 10 - "JobCard.tsx"
Cohesion: 0.39
Nodes (7): JobCard(), timeAgo(), MatchRing(), MatchRingProps, buttonVariants, trackJobApplied(), trackJobCardImpression()

### Community 11 - "sidebar.tsx"
Cohesion: 0.10
Nodes (41): AdminLayout(), AdminSidebar(), items, AppShell(), AppShellProps, MobileBottomNav(), UserSidebar(), NavUser (+33 more)

### Community 13 - "(protected)/billing/page.tsx"
Cohesion: 0.17
Nodes (13): ClientProvider (Session-User Bridge), db (Drizzle ORM Database), db/schema (Drizzle Tables - plan, subscription, invoice, coupons, userProfile, resume), PricingPlans Component, PrimaryResumePage (Redirect), RenewalReminder(), RenewalReminderProps, metadata (+5 more)

### Community 14 - "data-table.tsx"
Cohesion: 0.14
Nodes (32): InvoiceModal (Invoice Detail Dialog), DatabasePage(), BillingInvoiceTable(), billingReasonLabel(), formatInvoiceNumber(), Invoice, InvoiceModal(), StatusIcon() (+24 more)

### Community 15 - "sign-up/page.tsx"
Cohesion: 0.06
Nodes (37): SignInForm (Client Component), SignUpForm (Client Component), GET /api/referrals/validate, auth-client (Better-Auth Client), checkUserExists (Server Action), authSlice (Redux Auth State), @reduxjs/toolkit, checkUserExists() (+29 more)

### Community 16 - "biome.json"
Cohesion: 0.06
Nodes (31): source, assist, actions, next, react, files, ignoreUnknown, includes (+23 more)

### Community 17 - "user"
Cohesion: 0.08
Nodes (35): account, ai_usage_log, audit_log, coupon_usage, coupons, ai_action, billing_cycle, billing_reason (+27 more)

### Community 18 - "lib/auth.ts"
Cohesion: 0.08
Nodes (46): Admin Analytics (GA4) Endpoint, Admin Audit Log Endpoint, Admin Database Browser Endpoint, Admin Emails (Resend) Endpoint, Admin Referrals Management Endpoint, Admin Learning Resources CRUD Endpoint, Admin Settings (Plans & Coupons) Endpoint, Admin Stats (Revenue, AI, Growth) Endpoint (+38 more)

### Community 19 - "coupons-content.tsx"
Cohesion: 0.08
Nodes (51): POST /api/billing/checkout, POST /api/billing/coupons/validate, @base-ui/react, sonner, CouponsContent(), EMPTY_FORM, Props, STATUS_VARIANT (+43 more)

### Community 20 - "resumes/page.tsx"
Cohesion: 0.08
Nodes (33): ResumeThumbnail (Template Preview), GET+PATCH+DELETE /api/resumes/[id], POST /api/resumes/[id]/duplicate, POST /api/resumes/[id]/export, resumeSlice (Redux Resume Editor State), Redux Store, PreviewPanel (Live Resume Preview), ResumeEditorPage (Rich Resume Editor) (+25 more)

### Community 21 - "package.json"
Cohesion: 0.05
Nodes (36): engines, node, tsx, name, private, version, @ai-sdk/react, babel-plugin-react-compiler (+28 more)

### Community 22 - "derive.ts"
Cohesion: 0.14
Nodes (33): attachContextualEvidence(), blankToNull(), cleanDate(), countryCode(), deriveAcademics(), deriveCareerDraft(), deriveExperience(), deriveSkills() (+25 more)

### Community 23 - "Resume Architect — Implementation Plan"
Cohesion: 0.05
Nodes (37): API Routes, Architecture Overview, code:block1 (┌───────────────────────────────────────────────────────────), code:block2 (src/), Commit History, Creative Portfolio Template ✅, Dashboard Page (`/resumes`), Database Schema (+29 more)

### Community 24 - "webhook.service.ts"
Cohesion: 0.21
Nodes (19): POST(), GET(), getCompanySettings(), fetchOrderPayments(), redeemCoupon(), attachSubscriptionToInvoice(), getInvoiceByCashfreeOrderId(), markInvoicePaid() (+11 more)

### Community 25 - "ResumeArchitectChat.tsx"
Cohesion: 0.12
Nodes (29): @tanstack/react-table, applyMutation(), buildColumns(), MutatePayload, TableSkeleton(), User, UsersTable(), AgentMark() (+21 more)

### Community 26 - "Neon Serverless Postgres"
Cohesion: 0.08
Nodes (24): Autoscaling, Branching, Connection Methods & Drivers, Connection Pooling, Developer Tools, Fetching Docs as Markdown, Finding the Right Page, Getting Started (+16 more)

### Community 27 - "Neon Serverless Postgres"
Cohesion: 0.08
Nodes (24): Autoscaling, Branching, Connection Methods & Drivers, Connection Pooling, Developer Tools, Fetching Docs as Markdown, Finding the Right Page, Getting Started (+16 more)

### Community 28 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 29 - "requireApiUserId"
Cohesion: 0.23
Nodes (21): DELETE(), PUT(), DELETE(), PUT(), GET(), PUT(), DELETE(), PUT() (+13 more)

### Community 30 - "review.ts"
Cohesion: 0.08
Nodes (47): CORE_SECTIONS, fieldGuidance(), LAYOUT_RULES, maxPagesFor(), ORDER, regionGuidance(), sectionOrderFor(), stageGuidance() (+39 more)

### Community 31 - "nanoid"
Cohesion: 0.10
Nodes (32): drizzle-orm, nanoid, maxDuration, MODEL, POST(), ResumeSchema, GET(), PATCH() (+24 more)

### Community 32 - "normalizeCareerKey"
Cohesion: 0.06
Nodes (39): 10. Open questions, 2.1 Student journey, 2.2 Professional journey, 2.3 Shared rules, 2. Product shape, 3.1 Keys Coach stores, 3. Contract check against `d691aea`, 4.1 `coach_program` (+31 more)

### Community 33 - "checkout/route.ts"
Cohesion: 0.14
Nodes (20): GET /api/billing/payment-status, POST /api/billing/retry, PaymentStatusPage, maxDuration, POST(), coupons, couponUsage, invoice (+12 more)

### Community 34 - "getCareerProfile"
Cohesion: 0.17
Nodes (23): yearsToMonths(), asEvidence(), asFieldSources(), assertOwned(), CareerProfileError, cleanSources(), ensureCareerProfile(), getCareerProfile() (+15 more)

### Community 35 - "architect.service.ts"
Cohesion: 0.11
Nodes (35): ai, @ai-sdk/openai, GET(), maxDuration, POST(), requireResumeOwner(), RouteParams, resumeChat (+27 more)

### Community 36 - "🌍 World-Class Multi-Industry Resume Architect — Complete Implementation Plan for Claude Opus 4.7"
Cohesion: 0.11
Nodes (17): 11.1 Export Formats, 11.2 Public Sharing, 12.1 User Dashboard, 12.2 Duplicate Resume, 14.1 Performance Optimizations, 14.2 Deployment Checklist, 4.1 Architecture, 4.2 Preview Communication (+9 more)

### Community 37 - "onboarding/page.tsx"
Cohesion: 0.06
Nodes (42): POST /api/parse-resume, GET+PATCH /api/profile, POST /api/resumes/[id]/ai/ats-score, GET+POST /api/resumes, motion, react-dropzone, ResumeScanResults Component, ResumeScannerLoader Component (+34 more)

### Community 38 - "validations/career-profile.ts"
Cohesion: 0.08
Nodes (21): CareerAcademicWrite, careerAcademicWriteSchema, careerDate, CareerExperienceWrite, careerExperienceWriteSchema, CareerProfilePatch, careerProfilePatchSchema, CareerSkillWrite (+13 more)

### Community 39 - "PHASE 9: KEY EDGE CASES & ERROR HANDLING"
Cohesion: 0.15
Nodes (13): 9.10 Mobile/Tablet Responsiveness, 9.11 Skill Database / Autocomplete, 9.12 Import Existing Resume, 9.1 Content Overflow / Multi-Page, 9.2 Data Loss Prevention, 9.3 Rich Text HTML Injection (XSS), 9.4 Large File / Image Handling, 9.5 PDF Generation Timeouts (Serverless) (+5 more)

### Community 40 - "react"
Cohesion: 0.06
Nodes (94): AnalysisError â€” Error screen for rate-limit / analysis failure with upgrade CTA, GET /api/career-insights, GET+POST /api/referrals, date-fns, lucide-react, react, recharts, ResumeUploader Component (+86 more)

### Community 41 - "billing.ts"
Cohesion: 0.11
Nodes (18): dynamic, POST(), verifyWebhookSignature(), CashfreeWebhookEvent, CheckoutRequest, CheckoutResponse, Coupon, CouponStatus (+10 more)

### Community 42 - "jobs/page.tsx"
Cohesion: 0.15
Nodes (17): JobListItem (Tracked Job Card), POST+DELETE /api/save-job, GET /api/user-jobs, SettingsContent(), SettingsPage(), EmptyState(), JobListItem(), MyJobsPage() (+9 more)

### Community 43 - "PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER"
Cohesion: 0.18
Nodes (11): PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER, Week 10: Testing & QA, Week 1: Foundation, Week 2: Editor Shell, Week 3: All Form Sections, Week 4: Templates, Week 5: PDF Generation, Week 6: ATS Engine (+3 more)

### Community 44 - "career-profile.service.ts"
Cohesion: 0.05
Nodes (64): A — Skill identity. Mismatch. Contract wins., careerAcademic, careerExperience, careerProfile, careerSkill, careerTargetRole, CareerDraft, DraftAcademic (+56 more)

### Community 45 - "invoice-email.ts"
Cohesion: 0.18
Nodes (18): @react-pdf/renderer, CompanyTabProps, billingReasonLabel(), colors, fmtDate(), formatInvNum(), InvoicePdf(), InvoicePdfProps (+10 more)

### Community 46 - "PHASE 7: AI-POWERED FEATURES"
Cohesion: 0.22
Nodes (9): 7.1 AI Bullet Point Writer, 7.2 AI Summary Generator, 7.3 AI Tailoring (Resume ↔ Job Description), 7.4 AI Resume Roast / Feedback, code:typescript (// Prompt template:), code:typescript (// Prompt template:), code:typescript (// Steps:), code:typescript (// Prompt: "You are a brutally honest career coach. Analyze ) (+1 more)

### Community 47 - "Root Layout"
Cohesion: 0.24
Nodes (7): Global CSS Migration to shadcn Theme, Home Page (Landing), nextConfig, Root Layout, Global Error Boundary, Global Loading Component, 404 Not Found Page

### Community 49 - "intelligence-dashboard.tsx"
Cohesion: 0.14
Nodes (27): IntelligencePage(), metadata, annualEquivalent(), displayExpected(), displayPay(), expectedBand(), expectedForPeriod(), figureForPeriod() (+19 more)

### Community 50 - "scripts"
Cohesion: 0.09
Nodes (23): scripts, build, db:backfill-log, db:generate, db:migrate, db:push, db:seed-plans, db:studio (+15 more)

### Community 51 - "types/resume.ts"
Cohesion: 0.07
Nodes (24): getTemplateMeta(), TEMPLATE_REGISTRY, NOW, calculateTotalExperience(), extractJobTitles(), parseDate(), fresher, AtsBreakdown (+16 more)

### Community 52 - "PHASE 3: RESUME EDITOR & FORM BUILDER"
Cohesion: 0.25
Nodes (8): 3.1 Editor Layout (Three-Panel Design), 3.2 Section Components (shadcn/ui based), 3.3 Form State Management, 3.4 Validation Rules (Zod Schemas), code:block5 (+------------------+---------------------------+------------), code:typescript (// src/stores/resume-store.ts), code:typescript (// src/lib/validations/resume.ts), PHASE 3: RESUME EDITOR & FORM BUILDER

### Community 53 - "Input"
Cohesion: 0.10
Nodes (63): @dnd-kit/core, @dnd-kit/sortable, @hookform/resolvers, react-hook-form, react-redux, zod, AtsResult, AtsSuggestion (+55 more)

### Community 54 - "subscription.service.ts"
Cohesion: 0.22
Nodes (14): 6. Limits, GET(), DELETE(), GET(), BillingError, calculatePeriodEnd(), cancelSubscription(), endOfAccessDay() (+6 more)

### Community 55 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 56 - "Google Analytics 4"
Cohesion: 0.29
Nodes (5): setUserId, trackPageView, analytics, auth-client, useAnalytics

### Community 57 - "cashfree.ts"
Cohesion: 0.17
Nodes (12): cashfree-pg, GET(), POST(), CashfreeOrder, CashfreePaymentDetail, CashfreeRefundResult, createCashfreeOrder(), createCashfreeRefund() (+4 more)

### Community 58 - "resume-editor.ts"
Cohesion: 0.05
Nodes (62): devDependencies, @playwright/test, tsx, tsx, name, private, scripts, report (+54 more)

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

### Community 67 - "auth"
Cohesion: 0.10
Nodes (11): jwks, received_email, GET(), median(), parseSalaryToInr(), percentile(), jobVisit, resumeAnalysis (+3 more)

### Community 68 - "admin-header.tsx"
Cohesion: 0.15
Nodes (30): MutatePayload, UserRowActions(), UserRowActionsProps, NotFound(), BillingClientShell(), ResumesPage(), AdminHeader(), DataTableColumnHeader() (+22 more)

### Community 69 - "app/layout.tsx"
Cohesion: 0.18
Nodes (12): next-themes, @next/third-parties, @vercel/speed-insights, inter, metadata, RootLayout(), satoshi, ThemeProvider() (+4 more)

### Community 70 - "versions/route.ts"
Cohesion: 0.26
Nodes (9): POST(), RouteParams, POST(), RouteParams, resumeVersion, insertResumeSnapshot(), nextSnapshotVersion(), restoreIdentityPatch() (+1 more)

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

### Community 75 - "analyze/page.tsx"
Cohesion: 0.09
Nodes (31): AnalyzePage(), AnalyzePageContent(), TabId, TABS, AnalysisError(), AnalysisErrorProps, JobFiltersProps, JOB_MEMES (+23 more)

### Community 76 - "next"
Cohesion: 0.07
Nodes (21): next, resend, ALLOWED_TABLES, resend, GET(), dynamic, AdzunaResult, buildSalaryString() (+13 more)

### Community 77 - "api/referrals/route.ts"
Cohesion: 0.39
Nodes (7): Referral Claim API (POST /api/referrals/claim), Referral Validate API (GET /api/referrals/validate), dynamic, GET(), getSession(), POST(), getReferralStats()

### Community 78 - "job_titles"
Cohesion: 0.67
Nodes (3): job_title_aliases, job_title_index, job_titles

### Community 79 - "invoice.service.ts"
Cohesion: 0.50
Nodes (7): getCouponUsageByInvoice(), releaseCoupon(), CreateInvoiceParams, expireStaleInvoices(), markInvoiceFailed(), voidInvoice(), BillingReason

### Community 80 - "types/index.ts"
Cohesion: 0.05
Nodes (61): AnalyzePageContent (Main Analysis Engine), GET /api/analysis-history/[id], POST /api/analyze-gaps, POST /api/save-analysis, POST /api/search-jobs, Career score, 1. What exists today, JobCard (Job Match Card) (+53 more)

### Community 81 - "normalizeResumeData"
Cohesion: 0.10
Nodes (24): assertEndpoint(), costUsd(), EvalRow, Job, Level, main(), runOne(), worker() (+16 more)

### Community 82 - "GitHub project method (mandatory)"
Cohesion: 0.05
Nodes (35): Project Architecture Rules (AGENTS.md), CLAUDE.md â†’ AGENTS.md Redirect, 1. Separation of Frontend and Backend, 2. API Routes over Server Actions, 3. Client-Side Data Fetching, 4. When to use Server Components, 5. Security and Validation, 6.1. High-Level System Architecture (+27 more)

### Community 83 - "[slug]/route.ts"
Cohesion: 0.60
Nodes (4): GET(), RouteParams, publicViewCookieName(), shouldCountPublicView()

### Community 84 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, babel-plugin-react-compiler, @biomejs/biome, drizzle-kit, tailwindcss, @tailwindcss/postcss, tsx, @types/node (+5 more)

### Community 85 - "chart.tsx"
Cohesion: 0.20
Nodes (12): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent(), getPayloadConfigFromPayload() (+4 more)

### Community 86 - "sendMail"
Cohesion: 0.11
Nodes (17): better-auth, GET, POST, referralRewards, referrals, sendOTPMail(), sendRefereeWelcomeEmail(), sendReferrerRewardEmail() (+9 more)

### Community 91 - "pool.ts"
Cohesion: 0.60
Nodes (4): pg, buildDirectUrl(), getPool(), withTransaction()

### Community 92 - "JobFilters â€” Advanced job filter panel (title, city, work type, emp type, match score, salary)"
Cohesion: 0.50
Nodes (4): AnalyzeTypes â€” ReviewState and FilterState type definitions for the analyze workflow, JobFilters â€” Advanced job filter panel (title, city, work type, emp type, match score, salary), ResultsHeader â€” Analysis results header with user profile card and summary stat cards, StatCard â€” Simple stat display card with large value + label (used in results header)

### Community 93 - "resume-owner-fixes.test.ts"
Cohesion: 0.17
Nodes (18): fresher, main(), metadata, POST(), renderedLineHeight(), renderResumePdf(), contactLine(), dates() (+10 more)

### Community 94 - "analytics/route.ts"
Cohesion: 0.40
Nodes (7): @google-analytics/data, google-auth-library, GET(), getCoreMetrics(), getEventMetrics(), getGA4Client(), getRealtimeUsers()

### Community 96 - "validations/resume.ts"
Cohesion: 0.06
Nodes (29): awardItemSchema, basicsSchema, certificationItemSchema, CreateResumeInput, createResumeSchema, createVersionSchema, customSectionItemSchema, customSectionSchema (+21 more)

### Community 98 - "Quick Reference"
Cohesion: 0.18
Nodes (11): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+3 more)

### Community 99 - "SkillGapPanel.tsx"
Cohesion: 0.27
Nodes (9): ParsingProgress â€” Resume parsing progress panel with ProgressTimeline and skill preview, ProfileReview â€” Post-parse profile editor for skills, job titles, and experience before analysis, ResultsHeader(), ResultsHeaderProps, StatCard(), SkillBadge(), SkillBadgeProps, PriorityDot() (+1 more)

### Community 111 - "hq/referrals/page.tsx"
Cohesion: 0.22
Nodes (6): AdminSummary, fmt(), ReferralRow, ReferralSettings, ReferralsPage(), SummaryCards()

### Community 135 - "LearningRoadmap.tsx"
Cohesion: 0.43
Nodes (6): LearningRoadmap(), PRIORITY_STYLES, RESOURCE_ICONS, RoadmapCard(), trackResourceLinkClicked(), trackRoadmapItemExpanded()

### Community 138 - "WebhookService"
Cohesion: 0.44
Nodes (7): CouponService, InvoiceService, PaymentService, ReferralService, SubscriptionService, WebhookService, BillingTypes

### Community 140 - "draft-recovery.ts"
Cohesion: 0.35
Nodes (9): ResumeEditorError(), getResumeDraftKey(), getResumeIdFromPath(), hasResumeDraft(), loadResumeDraft(), ResumeDraftSnapshot, ResumeEditorState, ResumeData (+1 more)

### Community 144 - "auth-cookie-domain.ts"
Cohesion: 0.67
Nodes (4): hostnameOf(), isZaprillHost(), resolveAuthCookieDomain(), shouldUseCrossSubdomainCookies()

### Community 145 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.22
Nodes (8): Available Domains, Available Stacks, How to Use, Output Formats, Prerequisites, Rule Categories by Priority, Search Reference, UI/UX Pro Max - Design Intelligence

### Community 146 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, noEmit, skipLibCheck, strict, target, include

### Community 149 - "Billing Retry API (POST /api/billing/retry)"
Cohesion: 0.28
Nodes (3): Billing Retry API (POST /api/billing/retry), Billing Subscription API (GET/DELETE /api/billing/subscription), Billing Webhook API (POST /api/billing/webhook)

### Community 150 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 151 - "backfill-migrations.ts"
Cohesion: 0.12
Nodes (15): FINDINGS_FILE, OUTPUT, REPORT_DIR, UxFinding, all, apply, arg(), args (+7 more)

### Community 152 - "updateCareerProfile"
Cohesion: 0.25
Nodes (8): API, Career profile, Pay, Segment, Skills, evidence, and locks, Still open, Tables, setCurrentAnnualSalary()

### Community 153 - "Pre-Delivery Checklist"
Cohesion: 0.33
Nodes (6): Accessibility, Interaction, Layout, Light/Dark Mode, Pre-Delivery Checklist, Visual Quality

### Community 154 - "How to Use This Skill"
Cohesion: 0.33
Nodes (6): How to Use This Skill, Step 1: Analyze User Requirements, Step 2: Generate Design System (REQUIRED), Step 2b: Persist Design System (Master + Overrides Pattern), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines (React Native)

### Community 156 - "actions.ts"
Cohesion: 0.47
Nodes (8): useAdminActions(), banUserAction(), deleteUserAction(), ensureAdmin(), setRoleAction(), unbanUserAction(), logAuditAction(), authClient

### Community 157 - "r/route.ts"
Cohesion: 0.21
Nodes (7): dynamic, GET(), POST(), requireAdmin(), dynamic, learningResources, resourceClicks

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

### Community 180 - "get-refresh-token.js"
Cohesion: 0.29
Nodes (4): oauth2Client, rl, scopes, url

## Knowledge Gaps
- **143 isolated node(s):** `tsx`, `@fontsource-variable/inter`, `@types/pdf-parse`, `geist`, `shadcn` (+138 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1075 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **54 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `sanitize.ts`, `schema.ts`, `referral.service.ts`, `VersionHistorySheet.tsx`, `analytics.ts`, `sidebar.tsx`, `draft-recovery.ts`, `(protected)/billing/page.tsx`, `sign-up/page.tsx`, `lib/auth.ts`, `coupons-content.tsx`, `resumes/page.tsx`, `package.json`, `webhook.service.ts`, `actions.ts`, `requireApiUserId`, `r/route.ts`, `nanoid`, `checkout/route.ts`, `architect.service.ts`, `onboarding/page.tsx`, `react`, `billing.ts`, `Root Layout`, `intelligence-dashboard.tsx`, `subscription.service.ts`, `cashfree.ts`, `auth`, `admin-header.tsx`, `app/layout.tsx`, `versions/route.ts`, `analyze/page.tsx`, `api/referrals/route.ts`, `types/index.ts`, `GitHub project method (mandatory)`, `[slug]/route.ts`, `sendMail`, `analytics/route.ts`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **What connects `tsx`, `@fontsource-variable/inter`, `@types/pdf-parse` to the rest of the system?**
  _143 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.08376623376623377 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `cn`, `ResumeData`, `schema.ts`, `LearningRoadmap.tsx`, `VersionHistorySheet.tsx`, `analytics.ts`, `JobCard.tsx`, `sidebar.tsx`, `draft-recovery.ts`, `(protected)/billing/page.tsx`, `data-table.tsx`, `sign-up/page.tsx`, `coupons-content.tsx`, `resumes/page.tsx`, `package.json`, `ResumeArchitectChat.tsx`, `onboarding/page.tsx`, `jobs/page.tsx`, `invoice-email.ts`, `intelligence-dashboard.tsx`, `Input`, `admin-header.tsx`, `app/layout.tsx`, `analyze/page.tsx`, `GitHub project method (mandatory)`, `chart.tsx`, `SkillGapPanel.tsx`, `hq/referrals/page.tsx`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `sanitize.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055299539170506916 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `VersionHistorySheet.tsx` to `cn`, `ErrorBoundary`, `JobCard.tsx`, `sidebar.tsx`, `draft-recovery.ts`, `data-table.tsx`, `sign-up/page.tsx`, `coupons-content.tsx`, `resumes/page.tsx`, `ResumeArchitectChat.tsx`, `Common Rules for Professional UI`, `onboarding/page.tsx`, `react`, `jobs/page.tsx`, `intelligence-dashboard.tsx`, `Input`, `admin-header.tsx`, `analyze/page.tsx`, `SkillGapPanel.tsx`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.03571428571428571 - nodes in this community are weakly interconnected._