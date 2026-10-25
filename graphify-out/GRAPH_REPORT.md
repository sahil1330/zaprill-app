# Graph Report - workspace  (2026-10-25)

## Corpus Check
- 468 files · ~295,350 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: (none) 4, .woff2 3, .ico 2)

## Summary
- 3202 nodes · 10079 edges · 184 communities (128 shown, 56 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 449 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fc765b77`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- LocationCombobox.tsx
- sanitize.ts
- dependencies
- resumes/page.tsx
- practice.service.ts
- referral.service.ts
- limits.ts
- Button
- [id]/page.tsx
- analyze/page.tsx
- CardHeader
- cn
- Resend
- (protected)/billing/page.tsx
- coupons-content.tsx
- sign-up/page.tsx
- biome.json
- user
- schema.ts
- plans-content.tsx
- normalizeResumeData
- package.json
- derive.ts
- Resume Architect — Implementation Plan
- webhook.service.ts
- utils.ts
- Neon Serverless Postgres
- Neon Serverless Postgres
- components.json
- requireApiUserId
- review.ts
- parse-resume/route.ts
- Skill Coach
- checkout/route.ts
- career-profile.service.ts
- architect.service.ts
- 🌍 World-Class Multi-Industry Resume Architect — Complete Implementation Plan for Claude Opus 4.7
- onboarding/page.tsx
- env
- PHASE 9: KEY EDGE CASES & ERROR HANDLING
- react
- billing.ts
- profile/page.tsx
- PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER
- types/career-profile.ts
- invoice-email.ts
- PHASE 7: AI-POWERED FEATURES
- Root Layout
- Resume Builder Actual Implementation Plan
- intelligence-dashboard.tsx
- scripts
- types/resume.ts
- PHASE 3: RESUME EDITOR & FORM BUILDER
- resumeSlice.ts
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
- db/index.ts
- admin-header.tsx
- app/layout.tsx
- nanoid
- PHASE 0: PRE-IMPLEMENTATION PREPARATION
- PHASE 8: INDUSTRY-SPECIFIC SMART DEFAULTS
- AdminHeader â€” HQ top bar with breadcrumb nav, search, notifications, user menu
- dotenv
- Input
- next
- billing-invoice-table.tsx
- job_titles
- invoice.service.ts
- match-engine.ts
- program.service.ts
- GitHub project method (mandatory)
- [slug]/route.ts
- devDependencies
- chart.tsx
- sendMail
- Globe (World) Icon
- DataTable â€” Generic admin data table with sort/filter/paginate/export capabilities
- POST /api/referrals/claim
- saveToLocal
- app/page.tsx
- better-auth
- resume-owner-fixes.test.ts
- analytics/route.ts
- job-titles.ts
- validations/resume.ts
- Adzuna API
- Quick Reference
- Card
- File Document Icon (SVG)
- Application Logo (Branding Asset)
- Next.js Logotype Brand Asset
- Vercel Logo
- Window Icon
- Apple Touch Icon
- postcss.config.mjs
- pnpm-workspace.yaml
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
- analyze-gaps/route.ts
- helpers/audit.ts
- score.ts
- intelligence-insights.tsx
- WebhookService
- SkillsForm.tsx
- draft-recovery.ts
- MOBILE_BREAKPOINT
- coach-dashboard.tsx
- STORAGE_KEY
- ref_node_assert
- UI/UX Pro Max - Design Intelligence
- compilerOptions
- market.ts
- AnalyzePageContent (Main Analysis Engine)
- scripts
- Frontend Design
- backfill-migrations.ts
- Career profile
- Pre-Delivery Checklist
- How to Use This Skill
- ResumeEditorPage (Rich Resume Editor)
- actions.ts
- ai
- Common Rules for Professional UI
- Example Workflow
- Zaprill theme: Notion warm paper (tokens-first)
- app-settings.ts
- MODEL_RATES
- FileUpload
- Migrations
- (protected)/referrals/page.tsx
- Tips for Better Results
- When to Apply
- drizzle.config.ts
- Notion Warm Paper Tokens Implementation Plan
- resume-api.ts
- test-result.js
- MemeLoader â€” Playful loading screen with animated GIFs during job search/analysis
- DELETE /api/billing/subscription
- { signIn, signOut, signUp, useSession, getSession }
- @playwright/test
- resend
- [...all]/route.ts
- get-refresh-token.js
- seed-job-titles
- app_settings

## God Nodes (most connected - your core abstractions)
1. `cn()` - 226 edges
2. `Button()` - 176 edges
3. `react` - 139 edges
4. `next` - 124 edges
5. `Card()` - 121 edges
6. `CardContent()` - 115 edges
7. `lucide-react` - 113 edges
8. `drizzle-orm` - 75 edges
9. `Badge()` - 74 edges
10. `db` - 71 edges

## Surprising Connections (you probably didn't know these)
- `Interaction (App)` --references--> `Button()`  [INFERRED]
  .agents/skills/ui-ux-pro-max/SKILL.md → src/components/ui/button.tsx
- `Next steps` --references--> `isCoachEnabled()`  [INFERRED]
  docs/intelligence-dashboard.md → src/lib/app-settings.ts
- `4.9 Verified skill signal` --references--> `normalizeCareerKey()`  [INFERRED]
  docs/skill-coach.md → src/lib/career/derive.ts
- `What's left` --references--> `logAiUsage()`  [INFERRED]
  docs/intelligence-dashboard.md → src/services/ai/usage.service.ts
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
- **Redux State Architecture** — src_store_store_ts, src_store_authslice_authslice, src_store_resumeslice_resumeslice, src_providers_providers_tsx, redux_toolkit, src_types_auth_authstate, src_types_resume_types_ts [INFERRED]
- **Billing Module Dependency Chain** — src_services_billing_webhook_service_ts, src_services_billing_invoice_service_ts, src_services_billing_payment_service_ts, src_services_billing_subscription_service_ts, src_services_billing_coupon_service_ts, src_services_billing_referral_service_ts, billing_utils_lib, src_types_billing_types_ts, cashfree [INFERRED]

## Communities (184 total, 56 thin omitted)

### Community 0 - "LocationCombobox.tsx"
Cohesion: 0.16
Nodes (18): INDIA_CITIES, LocationCombobox(), LocationComboboxProps, Command(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem() (+10 more)

### Community 1 - "sanitize.ts"
Cohesion: 0.07
Nodes (42): @ai-sdk/openai, maxDuration, MODEL, POST(), RequestSchema, RouteParams, buildResumeText(), maxDuration (+34 more)

### Community 2 - "dependencies"
Cohesion: 0.05
Nodes (42): dependencies, ai@^7.0.107, @ai-sdk/openai@^4.0.71, @ai-sdk/react@^4.0.110, @base-ui/react@^1.4.1, class-variance-authority@^0.7.1, date-fns@^4.1.0, @dnd-kit/core@^6.3.1 (+34 more)

### Community 3 - "resumes/page.tsx"
Cohesion: 0.15
Nodes (37): ContactItem, Template Registry, POST /api/resumes/[id]/duplicate, formatProfileText, getProfileIcon, @tabler/icons-react, TEMPLATE_COMPONENTS, TEMPLATE_COMPONENTS (+29 more)

### Community 4 - "practice.service.ts"
Cohesion: 0.13
Nodes (46): bodySchema, maxDuration, POST(), RouteParams, coachAttempt, coachOutlineCache, coachProgress, coachSession (+38 more)

### Community 5 - "referral.service.ts"
Cohesion: 0.08
Nodes (38): Referral Claim API (POST /api/referrals/claim), Referral Validate API (GET /api/referrals/validate), dynamic, GET(), POST(), requireAdmin(), dynamic, POST() (+30 more)

### Community 6 - "limits.ts"
Cohesion: 0.08
Nodes (46): assertDevDatabase(), check(), main(), careerProfile, careerSkill, careerTargetRole, coachTask, getSettingValue() (+38 more)

### Community 7 - "Button"
Cohesion: 0.08
Nodes (24): InputGroup, class-variance-authority, motion, ErrorPage(), NotFound(), AnalysisErrorProps, ErrorBoundary, Props (+16 more)

### Community 8 - "[id]/page.tsx"
Cohesion: 0.12
Nodes (43): UserActionsClient(), UserActionsClientProps, CancelSubscriptionButton(), ResumeEditorPage(), SECTIONS, TOOLS, ResumeEditorErrorFallback(), RoastDialog() (+35 more)

### Community 9 - "analyze/page.tsx"
Cohesion: 0.07
Nodes (79): AnalyzeTypes â€” ReviewState and FilterState type definitions for the analyze workflow, JobFilters â€” Advanced job filter panel (title, city, work type, emp type, match score, salary), ResultsHeader â€” Analysis results header with user profile card and summary stat cards, StatCard â€” Simple stat display card with large value + label (used in results header), AnalyzePage(), AnalyzePageContent(), TabId, TABS (+71 more)

### Community 10 - "CardHeader"
Cohesion: 0.11
Nodes (36): AnalysisError â€” Error screen for rate-limit / analysis failure with upgrade CTA, POST /api/billing/checkout, POST /api/billing/coupons/validate, ForgotPasswordPage(), ResetPasswordForm(), ResetPasswordPage(), SignInForm(), SignInPage() (+28 more)

### Community 11 - "cn"
Cohesion: 0.10
Nodes (48): AdminLayout(), AdminSidebar(), items, UserSidebar(), CardAction(), DropdownMenuRadioItem(), DropdownMenuShortcut(), DropdownMenuSubTrigger() (+40 more)

### Community 13 - "(protected)/billing/page.tsx"
Cohesion: 0.12
Nodes (20): GET /api/billing/payment-status, POST /api/billing/retry, ClientProvider (Session-User Bridge), db (Drizzle ORM Database), db/schema (Drizzle Tables - plan, subscription, invoice, coupons, userProfile, resume), PaymentStatusPage, PricingPlans Component, PrimaryResumePage (Redirect) (+12 more)

### Community 14 - "coupons-content.tsx"
Cohesion: 0.11
Nodes (42): @tanstack/react-table, CouponsContent(), EMPTY_FORM, Props, STATUS_VARIANT, CouponsPage(), DatabasePage(), Coupon (+34 more)

### Community 15 - "sign-up/page.tsx"
Cohesion: 0.12
Nodes (24): SignInForm (Client Component), SignUpForm (Client Component), GET /api/referrals/validate, auth-client (Better-Auth Client), checkUserExists (Server Action), authSlice (Redux Auth State), checkUserExists(), SignUpForm() (+16 more)

### Community 16 - "biome.json"
Cohesion: 0.06
Nodes (31): source, assist, actions, next, react, files, ignoreUnknown, includes (+23 more)

### Community 17 - "user"
Cohesion: 0.08
Nodes (35): account, ai_usage_log, audit_log, coupon_usage, coupons, ai_action, billing_cycle, billing_reason (+27 more)

### Community 18 - "schema.ts"
Cohesion: 0.05
Nodes (65): Admin Analytics (GA4) Endpoint, Admin Audit Log Endpoint, Admin Database Browser Endpoint, Admin Emails (Resend) Endpoint, Admin Referrals Management Endpoint, Admin Learning Resources CRUD Endpoint, Admin Settings (Plans & Coupons) Endpoint, Admin Stats (Revenue, AI, Growth) Endpoint (+57 more)

### Community 19 - "plans-content.tsx"
Cohesion: 0.20
Nodes (9): sonner, EMPTY_FORM, PlansContent(), Props, PlansPage(), EMPTY_FORM, Props, LearningResource (+1 more)

### Community 20 - "normalizeResumeData"
Cohesion: 0.19
Nodes (16): ResumeExportPage(), ResumeThumbnail(), metadata, PublicResumePage(), PublicResume, PublicResumeView(), load(), restore() (+8 more)

### Community 21 - "package.json"
Cohesion: 0.06
Nodes (33): cashfree-pg@^5.1.3, clsx@^2.1.1, cmdk@^1.1.1, @dnd-kit/utilities@^3.2.2, @fontsource-variable/inter@^5.2.8, pdf-parse@^2.4.5, react-dom@19.3.0, svix@^1.92.2 (+25 more)

### Community 22 - "derive.ts"
Cohesion: 0.09
Nodes (47): 3.1 Keys Coach stores, 3. Contract check against `d691aea`, B — Role identity. Mismatch. Contract wins., C — Gap source. Mismatch. Match engine stays the producer., D — Verified skill. Partial. Signature changed., E — Segment. Mismatch. Contract wins., F — Soft skills and non-tech roles. Holds, with a limit., attachContextualEvidence() (+39 more)

### Community 23 - "Resume Architect — Implementation Plan"
Cohesion: 0.05
Nodes (37): API Routes, Architecture Overview, code:block1 (┌───────────────────────────────────────────────────────────), code:block2 (src/), Commit History, Creative Portfolio Template ✅, Dashboard Page (`/resumes`), Database Schema (+29 more)

### Community 24 - "webhook.service.ts"
Cohesion: 0.17
Nodes (22): POST(), GET(), payment, getCompanySettings(), fetchOrderPayments(), redeemCoupon(), attachSubscriptionToInvoice(), getInvoiceByCashfreeOrderId() (+14 more)

### Community 25 - "utils.ts"
Cohesion: 0.12
Nodes (30): buildColumns(), AgentMark(), ArchitectSession(), clampFrame(), defaultFrame(), Frame, isSnapshot(), limits() (+22 more)

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
Cohesion: 0.10
Nodes (40): DELETE(), PUT(), DELETE(), PUT(), GET(), PUT(), DELETE(), PUT() (+32 more)

### Community 30 - "review.ts"
Cohesion: 0.06
Nodes (57): AtsExplanation, clampScore(), DeterministicAtsResult, extractJdTerms(), keywordScores(), resumeHaystack(), scoreResumeAts(), STOP (+49 more)

### Community 31 - "parse-resume/route.ts"
Cohesion: 0.07
Nodes (35): Duplicate Resume API (POST /api/resumes/[id]/duplicate), Enhance Bullet AI API (POST /api/resumes/[id]/ai/enhance), Export Resume API (POST /api/resumes/[id]/export), Restore Version API (POST /api/resumes/[id]/versions/[versionId]/restore), Resume Versions API (GET/POST /api/resumes/[id]/versions), Resume CRUD API (GET/PATCH/DELETE /api/resumes/[id]), Resumes List/Create API (GET/POST /api/resumes), Roast Resume AI API (POST /api/resumes/[id]/ai/roast) (+27 more)

### Community 32 - "Skill Coach"
Cohesion: 0.06
Nodes (32): 10. Open questions, 2.1 Student journey, 2.2 Professional journey, 2.3 Shared rules, 2. Product shape, 4.1 `coach_program`, 4.2 `coach_plan`, 4.3 `coach_progress` (+24 more)

### Community 33 - "checkout/route.ts"
Cohesion: 0.19
Nodes (16): maxDuration, POST(), POST(), calculateDiscount(), calculateInvoiceAmounts(), generateId(), generateIdempotencyKey(), getDaysUntil() (+8 more)

### Community 34 - "career-profile.service.ts"
Cohesion: 0.09
Nodes (56): careerAcademic, careerExperience, yearsToMonths(), academicKey(), AcademicRow, asAnalysisJobs(), asEvidence(), asFieldSources() (+48 more)

### Community 35 - "architect.service.ts"
Cohesion: 0.10
Nodes (36): GET(), maxDuration, POST(), requireResumeOwner(), RouteParams, resumeChat, createResumeArchitectAgent(), RESUME_ARCHITECT_MODEL (+28 more)

### Community 36 - "🌍 World-Class Multi-Industry Resume Architect — Complete Implementation Plan for Claude Opus 4.7"
Cohesion: 0.11
Nodes (17): 11.1 Export Formats, 11.2 Public Sharing, 12.1 User Dashboard, 12.2 Duplicate Resume, 14.1 Performance Optimizations, 14.2 Deployment Checklist, 4.1 Architecture, 4.2 Preview Communication (+9 more)

### Community 37 - "onboarding/page.tsx"
Cohesion: 0.08
Nodes (27): POST /api/parse-resume, GET+PATCH /api/profile, POST /api/resumes/[id]/ai/ats-score, GET+POST /api/resumes, ResumeScanResults Component, ResumeScannerLoader Component, AtsResult, ChoiceCard() (+19 more)

### Community 38 - "env"
Cohesion: 0.05
Nodes (36): ADZUNA_APP_ID, ADZUNA_APP_KEY, BETTER_AUTH_SECRET, BETTER_AUTH_URL, CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET, CASHFREE_ENVIRONMENT, DATABASE_URL (+28 more)

### Community 39 - "PHASE 9: KEY EDGE CASES & ERROR HANDLING"
Cohesion: 0.15
Nodes (13): 9.10 Mobile/Tablet Responsiveness, 9.11 Skill Database / Autocomplete, 9.12 Import Existing Resume, 9.1 Content Overflow / Multi-Page, 9.2 Data Loss Prevention, 9.3 Rich Text HTML Injection (XSS), 9.4 Large File / Image Handling, 9.5 PDF Generation Timeouts (Serverless) (+5 more)

### Community 40 - "react"
Cohesion: 0.11
Nodes (31): date-fns, react, recharts, AnalyticsContent(), AnalyticsData, KpiSkeleton(), AnalyticsPage(), AuditList() (+23 more)

### Community 41 - "billing.ts"
Cohesion: 0.17
Nodes (11): BillingCycle, CheckoutRequest, CheckoutResponse, CouponStatus, CouponType, CouponUsage, CouponUsageStatus, InvoiceStatus (+3 more)

### Community 42 - "profile/page.tsx"
Cohesion: 0.14
Nodes (25): JobListItem (Tracked Job Card), POST+DELETE /api/save-job, GET /api/user-jobs, @base-ui/react, ResumeUploader Component, EmailsContent(), EmailSkeleton(), SettingsContent() (+17 more)

### Community 43 - "PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER"
Cohesion: 0.18
Nodes (11): PHASE 13: STEP-BY-STEP IMPLEMENTATION ORDER, Week 10: Testing & QA, Week 1: Foundation, Week 2: Editor Shell, Week 3: All Form Sections, Week 4: Templates, Week 5: PDF Generation, Week 6: ATS Engine (+3 more)

### Community 44 - "types/career-profile.ts"
Cohesion: 0.05
Nodes (46): A — Skill identity. Mismatch. Contract wins., NextStep, NextStepAction, recommendNextSteps(), base, toAnnualInr(), usesMonthlyStipend(), CareerAcademicWrite (+38 more)

### Community 45 - "invoice-email.ts"
Cohesion: 0.17
Nodes (18): GET(), CompanyTabProps, billingReasonLabel(), colors, fmtDate(), formatInvNum(), InvoicePdf(), InvoicePdfProps (+10 more)

### Community 46 - "PHASE 7: AI-POWERED FEATURES"
Cohesion: 0.22
Nodes (9): 7.1 AI Bullet Point Writer, 7.2 AI Summary Generator, 7.3 AI Tailoring (Resume ↔ Job Description), 7.4 AI Resume Roast / Feedback, code:typescript (// Prompt template:), code:typescript (// Prompt template:), code:typescript (// Steps:), code:typescript (// Prompt: "You are a brutally honest career coach. Analyze ) (+1 more)

### Community 47 - "Root Layout"
Cohesion: 0.24
Nodes (7): Global CSS Migration to shadcn Theme, Home Page (Landing), nextConfig, Root Layout, Global Error Boundary, Global Loading Component, 404 Not Found Page

### Community 49 - "intelligence-dashboard.tsx"
Cohesion: 0.13
Nodes (28): IntelligencePage(), metadata, PageEmpty(), PageError(), PageSkeleton(), annualEquivalent(), displayExpected(), displayPay() (+20 more)

### Community 50 - "scripts"
Cohesion: 0.09
Nodes (23): scripts, build, db:backfill-log, db:generate, db:migrate, db:push, db:seed-plans, db:studio (+15 more)

### Community 51 - "types/resume.ts"
Cohesion: 0.09
Nodes (22): PATCH(), TEMPLATE_REGISTRY, calculateTotalExperience(), enrichResumeMetadata(), extractJobTitles(), parseDate(), AtsBreakdown, AtsSuggestion (+14 more)

### Community 52 - "PHASE 3: RESUME EDITOR & FORM BUILDER"
Cohesion: 0.25
Nodes (8): 3.1 Editor Layout (Three-Panel Design), 3.2 Section Components (shadcn/ui based), 3.3 Form State Management, 3.4 Validation Rules (Zod Schemas), code:block5 (+------------------+---------------------------+------------), code:typescript (// src/stores/resume-store.ts), code:typescript (// src/lib/validations/resume.ts), PHASE 3: RESUME EDITOR & FORM BUILDER

### Community 53 - "resumeSlice.ts"
Cohesion: 0.09
Nodes (45): @hookform/resolvers, react-hook-form, react-redux, @reduxjs/toolkit, zod, AtsResult, AtsSuggestion, awardsFormSchema (+37 more)

### Community 54 - "subscription.service.ts"
Cohesion: 0.26
Nodes (11): GET(), DELETE(), GET(), BillingError, calculatePeriodEnd(), cancelSubscription(), endOfAccessDay(), getSubscriptionById() (+3 more)

### Community 55 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 56 - "Google Analytics 4"
Cohesion: 0.29
Nodes (5): setUserId, trackPageView, analytics, auth-client, useAnalytics

### Community 57 - "cashfree.ts"
Cohesion: 0.18
Nodes (10): dynamic, POST(), CashfreeOrder, CashfreePaymentDetail, CashfreeRefundResult, createCashfreeRefund(), CreateOrderParams, getCashfreeClient() (+2 more)

### Community 58 - "resume-editor.ts"
Cohesion: 0.17
Nodes (25): patchResume(), resetResumeToBaseline(), ResumeRecord, VALID_BASELINE_DATA, VALID_BASELINE_METADATA, addSocialProfile(), addWorkExperience(), clickSave() (+17 more)

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

### Community 67 - "db/index.ts"
Cohesion: 0.06
Nodes (26): jwks, received_email, drizzle-orm, ALLOWED_TABLES, resend, dynamic, dynamic, maxDuration (+18 more)

### Community 68 - "admin-header.tsx"
Cohesion: 0.17
Nodes (28): MutatePayload, UserRowActions(), UserRowActionsProps, BillingClientShell(), ResumesPage(), AdminHeader(), DataTableColumnHeader(), AppHeader() (+20 more)

### Community 69 - "app/layout.tsx"
Cohesion: 0.15
Nodes (14): next-themes@^0.4.6, @next/third-parties@^16.3.5, @vercel/speed-insights@^2.0.0, next-themes, @next/third-parties, @vercel/speed-insights, inter, metadata (+6 more)

### Community 70 - "nanoid"
Cohesion: 0.15
Nodes (19): nanoid, POST(), RouteParams, POST(), RouteParams, shareSchema, POST(), RouteParams (+11 more)

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
Cohesion: 0.11
Nodes (11): dotenv@^17.4.2, dotenv, @neondatabase/serverless, cleanUrl, __dirname, migrationsFolder, createTestUser(), coupons (+3 more)

### Community 75 - "Input"
Cohesion: 0.18
Nodes (30): CompanyTab(), EMPTY, AtsScorePanel(), AwardsForm(), BasicsForm(), CertificationsForm(), EducationForm(), educationFormSchema (+22 more)

### Community 76 - "next"
Cohesion: 0.12
Nodes (14): next, GET(), dynamic, AdzunaResult, buildSalaryString(), maxDuration, optimizeJobTitle(), POST() (+6 more)

### Community 77 - "billing-invoice-table.tsx"
Cohesion: 0.12
Nodes (23): AlertDialog, DropdownMenu, InvoiceModal (Invoice Detail Dialog), ResourcesContent(), ResourcesPage(), BillingInvoiceTable(), billingReasonLabel(), formatInvoiceNumber() (+15 more)

### Community 78 - "job_titles"
Cohesion: 0.67
Nodes (3): job_title_aliases, job_title_index, job_titles

### Community 79 - "invoice.service.ts"
Cohesion: 0.19
Nodes (15): buildDirectUrl(), getPool(), withTransaction(), couponUsage, invoice, getCouponUsageByInvoice(), releaseCoupon(), reserveCoupon() (+7 more)

### Community 80 - "match-engine.ts"
Cohesion: 0.16
Nodes (18): Career score, Skill gaps, JobCardProps, LockedJobCardProps, toJobMatch(), aggregateSkillGaps(), computeMatchScore(), findMatchedSkills() (+10 more)

### Community 81 - "program.service.ts"
Cohesion: 0.14
Nodes (25): PlanView, coachPlan, coachProgram, CoachOutline, CoachOutlineModule, gapFingerprint(), isShellOutline(), moduleKey() (+17 more)

### Community 82 - "GitHub project method (mandatory)"
Cohesion: 0.05
Nodes (30): Project Architecture Rules (AGENTS.md), CLAUDE.md â†’ AGENTS.md Redirect, 1. Separation of Frontend and Backend, 2. API Routes over Server Actions, 3. Client-Side Data Fetching, 4. When to use Server Components, 5. Security and Validation, 6.1. High-Level System Architecture (+22 more)

### Community 83 - "[slug]/route.ts"
Cohesion: 0.60
Nodes (4): GET(), RouteParams, publicViewCookieName(), shouldCountPublicView()

### Community 84 - "devDependencies"
Cohesion: 0.09
Nodes (23): devDependencies, babel-plugin-react-compiler@1.0.0, @biomejs/biome@2.2.0, tailwindcss@^4.3.0, @tailwindcss/postcss@^4.3.0, tsx@^4.23.15, @types/node@^26.6.2, @types/pg@^8.20.0 (+15 more)

### Community 85 - "chart.tsx"
Cohesion: 0.20
Nodes (12): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartStyle(), ChartTooltipContent(), getPayloadConfigFromPayload() (+4 more)

### Community 86 - "sendMail"
Cohesion: 0.26
Nodes (8): sendOTPMail(), sendRefereeWelcomeEmail(), sendReferrerRewardEmail(), resend, sendMail(), sendSubscriptionCanceledMail(), sendSubscriptionCreatedMail(), sendSubscriptionRenewedMail()

### Community 91 - "app/page.tsx"
Cohesion: 0.13
Nodes (19): HomePage(), AppShell(), AppShellProps, MobileBottomNav(), DashboardSkeleton(), NavUser, GRID_CELL_IDS, GridPattern() (+11 more)

### Community 92 - "better-auth"
Cohesion: 0.12
Nodes (12): better-auth@^1.6.9, better-auth, Providers, config, PROTECTED_ROUTES, authSlice, initialState, resumeSlice (+4 more)

### Community 93 - "resume-owner-fixes.test.ts"
Cohesion: 0.18
Nodes (18): @react-pdf/renderer@^4.5.1, @react-pdf/renderer, POST(), renderedLineHeight(), renderResumePdf(), contactLine(), dates(), Layout (+10 more)

### Community 94 - "analytics/route.ts"
Cohesion: 0.30
Nodes (9): @google-analytics/data@^5.2.1, google-auth-library@^10.6.2, @google-analytics/data, google-auth-library, GET(), getCoreMetrics(), getEventMetrics(), getGA4Client() (+1 more)

### Community 96 - "validations/resume.ts"
Cohesion: 0.09
Nodes (21): certificationItemSchema, CreateResumeInput, createResumeSchema, createVersionSchema, customSectionItemSchema, customSectionSchema, educationItemSchema, optionalDate (+13 more)

### Community 98 - "Quick Reference"
Cohesion: 0.18
Nodes (11): 10. Charts & Data (LOW), 1. Accessibility (CRITICAL), 2. Touch & Interaction (CRITICAL), 3. Performance (HIGH), 4. Style Selection (HIGH), 5. Layout & Responsive (HIGH), 6. Typography & Color (MEDIUM), 7. Animation (MEDIUM) (+3 more)

### Community 99 - "Card"
Cohesion: 0.12
Nodes (36): ParsingProgress â€” Resume parsing progress panel with ProgressTimeline and skill preview, ProfileReview â€” Post-parse profile editor for skills, job titles, and experience before analysis, GET /api/career-insights, lucide-react, CareerInsightsData, CareerInsightsPage(), JobListItem(), ParsingProgress() (+28 more)

### Community 108 - "pnpm-workspace.yaml"
Cohesion: 0.50
Nodes (3): ignoredBuiltDependencies, minimumReleaseAgeExclude, onlyBuiltDependencies

### Community 111 - "hq/referrals/page.tsx"
Cohesion: 0.22
Nodes (6): AdminSummary, fmt(), ReferralRow, ReferralSettings, ReferralsPage(), SummaryCards()

### Community 134 - "analyze-gaps/route.ts"
Cohesion: 0.14
Nodes (17): 1. What exists today, AnalysisResponseSchema, arraysMatch(), extractJSON(), filterGapsByRelevantNames(), maxDuration, MODEL, POST() (+9 more)

### Community 135 - "helpers/audit.ts"
Cohesion: 0.20
Nodes (14): CORE_ROUTES, assertPageLoaded(), captureScreen(), countVisibleCTAs(), ensureReportDir(), FINDINGS_FILE, FindingSeverity, getPrimaryHeadings() (+6 more)

### Community 136 - "score.ts"
Cohesion: 0.13
Nodes (19): API, Intelligence Dashboard, Market, Next steps, Score, What's left, CAREER_SCORE_WEIGHTS, COMPLETENESS_POINT (+11 more)

### Community 137 - "intelligence-insights.tsx"
Cohesion: 0.19
Nodes (16): collectGaps(), collectOnFile(), formatInr(), IntelligenceInsights(), MarketCard(), PrimaryCtaButton(), CtaReport, intelligenceGapNames() (+8 more)

### Community 138 - "WebhookService"
Cohesion: 0.19
Nodes (10): Billing Retry API (POST /api/billing/retry), Billing Subscription API (GET/DELETE /api/billing/subscription), Billing Webhook API (POST /api/billing/webhook), CouponService, InvoiceService, PaymentService, ReferralService, SubscriptionService (+2 more)

### Community 139 - "SkillsForm.tsx"
Cohesion: 0.14
Nodes (13): @dnd-kit/core, @dnd-kit/sortable, FONT_OPTIONS, PAGE_FORMATS, SECTION_LABELS, ThemeKey, SKILL_CATEGORIES, SKILL_LEVELS (+5 more)

### Community 140 - "draft-recovery.ts"
Cohesion: 0.57
Nodes (5): ResumeEditorError(), getResumeDraftKey(), getResumeIdFromPath(), hasResumeDraft(), loadResumeDraft()

### Community 142 - "coach-dashboard.tsx"
Cohesion: 0.19
Nodes (14): metadata, SkillCoachPage(), Allowance, CoachDashboard(), postJson(), sendTutor(), startMock(), startTest() (+6 more)

### Community 144 - "ref_node_assert"
Cohesion: 0.27
Nodes (5): hostnameOf(), isZaprillHost(), resolveAuthCookieDomain(), shouldUseCrossSubdomainCookies(), NOW

### Community 145 - "UI/UX Pro Max - Design Intelligence"
Cohesion: 0.22
Nodes (8): Available Domains, Available Stacks, How to Use, Output Formats, Prerequisites, Rule Categories by Priority, Search Reference, UI/UX Pro Max - Design Intelligence

### Community 146 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, noEmit, skipLibCheck, strict, target, include

### Community 147 - "market.ts"
Cohesion: 0.23
Nodes (13): buildMarketReport(), emptyRole(), MarketJob, MarketReport, MarketTarget, median(), parseIndianSalaryInr(), percentile() (+5 more)

### Community 148 - "AnalyzePageContent (Main Analysis Engine)"
Cohesion: 0.14
Nodes (14): AnalyzePageContent (Main Analysis Engine), GET /api/analysis-history/[id], POST /api/analyze-gaps, POST /api/save-analysis, POST /api/search-jobs, JobCard (Job Match Card), JobTitleAutocomplete Component, LearningRoadmap Component (+6 more)

### Community 149 - "scripts"
Cohesion: 0.15
Nodes (13): devDependencies, @playwright/test@1.51.1, tsx@^4.23.15, tsx, name, private, scripts, report (+5 more)

### Community 150 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 151 - "backfill-migrations.ts"
Cohesion: 0.12
Nodes (15): FINDINGS_FILE, OUTPUT, REPORT_DIR, UxFinding, all, apply, arg(), args (+7 more)

### Community 152 - "Career profile"
Cohesion: 0.25
Nodes (7): API, Career profile, Pay, Segment, Skills, evidence, and locks, Still open, Tables

### Community 153 - "Pre-Delivery Checklist"
Cohesion: 0.33
Nodes (6): Accessibility, Interaction, Layout, Light/Dark Mode, Pre-Delivery Checklist, Visual Quality

### Community 154 - "How to Use This Skill"
Cohesion: 0.33
Nodes (6): How to Use This Skill, Step 1: Analyze User Requirements, Step 2: Generate Design System (REQUIRED), Step 2b: Persist Design System (Master + Overrides Pattern), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines (React Native)

### Community 155 - "ResumeEditorPage (Rich Resume Editor)"
Cohesion: 0.15
Nodes (11): ResumeThumbnail (Template Preview), GET+PATCH+DELETE /api/resumes/[id], POST /api/resumes/[id]/export, resumeSlice (Redux Resume Editor State), Redux Store, PreviewPanel (Live Resume Preview), ResumeEditorPage (Rich Resume Editor), ResumeExportPage (PDF Export) (+3 more)

### Community 156 - "actions.ts"
Cohesion: 0.67
Nodes (7): useAdminActions(), banUserAction(), deleteUserAction(), ensureAdmin(), setRoleAction(), unbanUserAction(), logAuditAction()

### Community 157 - "ai"
Cohesion: 0.16
Nodes (9): ai, dynamic, GET(), POST(), requireAdmin(), dynamic, learningResources, resourceClicks (+1 more)

### Community 158 - "Common Rules for Professional UI"
Cohesion: 0.40
Nodes (5): Common Rules for Professional UI, Icons & Visual Elements, Interaction (App), Layout & Spacing, Light/Dark Mode Contrast

### Community 159 - "Example Workflow"
Cohesion: 0.40
Nodes (5): Example Workflow, Step 1: Analyze Requirements, Step 2: Generate Design System (REQUIRED), Step 3: Supplement with Detailed Searches (as needed), Step 4: Stack Guidelines

### Community 160 - "Zaprill theme: Notion warm paper (tokens-first)"
Cohesion: 0.17
Nodes (11): Approach, Component / chrome rules (token-level only), Dark mode, Decision log, Files touched, Follow-on phases (separate specs), Goal, Non-goals (this phase) (+3 more)

### Community 161 - "app-settings.ts"
Cohesion: 0.27
Nodes (10): dynamic, GET(), POST(), requireAdmin(), appSettings, APP_SETTING_KEYS, AppSettingKey, ReferralSettings (+2 more)

### Community 165 - "(protected)/referrals/page.tsx"
Cohesion: 0.28
Nodes (7): GET+POST /api/referrals, fmtDate(), ReferralData, ReferralsPage(), copyLink(), shareLink(), STATUS_CONFIG

### Community 166 - "Tips for Better Results"
Cohesion: 0.50
Nodes (4): Common Sticking Points, Pre-Delivery Checklist, Query Strategy, Tips for Better Results

### Community 167 - "When to Apply"
Cohesion: 0.50
Nodes (4): Must Use, Recommended, Skip, When to Apply

### Community 169 - "drizzle.config.ts"
Cohesion: 0.25
Nodes (6): directUrl, drizzle-kit@^0.31.10, drizzle-kit, Neon Database Connection Test, create-test-user, seed-plans

### Community 170 - "Notion Warm Paper Tokens Implementation Plan"
Cohesion: 0.25
Nodes (7): Done when, File map, Global Constraints, Implementation notes, Notion Warm Paper Tokens Implementation Plan, Task 1: Add design docs, Task 2: Remap light + dark tokens in globals.css

### Community 171 - "resume-api.ts"
Cohesion: 0.36
Nodes (7): deleteExtraResumes(), ensureResume(), getResume(), listResumes(), ResumeBasics, ResumeData, ResumeMetadata

### Community 177 - "@playwright/test"
Cohesion: 0.43
Nodes (3): stabilizePageForScreenshot(), VISUAL_SCREENSHOT_OPTS, @playwright/test

### Community 180 - "get-refresh-token.js"
Cohesion: 0.29
Nodes (4): oauth2Client, rl, scopes, url

## Knowledge Gaps
- **127 isolated node(s):** `{ signIn, signOut, signUp, useSession, getSession }`, `File Document Icon (SVG)`, `Next.js Starter README`, `Global Error Boundary`, `Global Loading Component` (+122 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1071 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **56 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `sanitize.ts`, `dependencies`, `resumes/page.tsx`, `practice.service.ts`, `referral.service.ts`, `analyze-gaps/route.ts`, `Button`, `[id]/page.tsx`, `analyze/page.tsx`, `CardHeader`, `cn`, `draft-recovery.ts`, `(protected)/billing/page.tsx`, `coach-dashboard.tsx`, `sign-up/page.tsx`, `intelligence-insights.tsx`, `normalizeResumeData`, `package.json`, `webhook.service.ts`, `actions.ts`, `requireApiUserId`, `ai`, `parse-resume/route.ts`, `app-settings.ts`, `checkout/route.ts`, `architect.service.ts`, `onboarding/page.tsx`, `profile/page.tsx`, `Root Layout`, `intelligence-dashboard.tsx`, `subscription.service.ts`, `cashfree.ts`, `db/index.ts`, `admin-header.tsx`, `app/layout.tsx`, `nanoid`, `GitHub project method (mandatory)`, `[slug]/route.ts`, `app/page.tsx`, `better-auth`, `analytics/route.ts`, `Card`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Button()` (e.g. with `Interaction (App)` and `Implementation notes`) actually correct?**
  _`Button()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `{ signIn, signOut, signUp, useSession, getSession }`, `File Document Icon (SVG)`, `Next.js Starter README` to the rest of the system?**
  _127 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `sanitize.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0730804810360777 - nodes in this community are weakly interconnected._
- **Why does `@neondatabase/serverless` connect `dotenv` to `dependencies`, `db/index.ts`, `package.json`, `backfill-migrations.ts`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `LocationCombobox.tsx`, `dependencies`, `resumes/page.tsx`, `Button`, `[id]/page.tsx`, `analyze/page.tsx`, `CardHeader`, `cn`, `draft-recovery.ts`, `(protected)/billing/page.tsx`, `coupons-content.tsx`, `sign-up/page.tsx`, `coach-dashboard.tsx`, `SkillsForm.tsx`, `plans-content.tsx`, `normalizeResumeData`, `package.json`, `utils.ts`, `onboarding/page.tsx`, `(protected)/referrals/page.tsx`, `profile/page.tsx`, `invoice-email.ts`, `intelligence-dashboard.tsx`, `resumeSlice.ts`, `db/index.ts`, `admin-header.tsx`, `app/layout.tsx`, `Input`, `billing-invoice-table.tsx`, `GitHub project method (mandatory)`, `chart.tsx`, `app/page.tsx`, `better-auth`, `Card`, `hq/referrals/page.tsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._