# Lotchen — Feature User Stories Reference

> This document serves as the implementation backlog for the Lotchen CRM platform.
> Each module is broken down into epics and user stories with acceptance criteria.
> Priority: P0 (critical), P1 (high), P2 (medium), P3 (nice-to-have).

---

## Module 1: Contacts Management

### Epic 1.1 — Contact CRUD

**US-1.1.1** — Create a contact manually

> As a **sales agent**, I want to create a contact with personal and professional information, so that I can track interactions.

Acceptance Criteria:

- [x] Form captures: first name, last name, email, mobile, phone, job title, company, address, source, tags
- [x] Duplicate detection on email and mobile number before creation
- [x] Contact is automatically assigned to the creator's territory/agency
- [x] Audit fields populated (createdBy, createdByInfo, createdAt)

**US-1.1.2** — View contact detail

> As a **sales agent**, I want to see a contact's full profile with activity timeline, so that I have context before reaching out.

Acceptance Criteria:

- [x] Summary card: avatar, name, status, source, assigned agent
- [x] Tabs: Overview, Activities, Documents, Notes, Call logs
- [x] Activity timeline shows all interactions (calls, emails, meetings, notes) in chronological order

**US-1.1.3** — Edit a contact

> As a **sales agent**, I want to update a contact's information, so that records stay current.

Acceptance Criteria:

- [x] Inline editing on detail page or via edit drawer
- [x] Duplicate detection re-runs on email/mobile change
- [x] Audit trail records who changed what and when

**US-1.1.4** — Delete / archive a contact

> As a **manager**, I want to soft-delete or archive a contact, so that data is not permanently lost.

Acceptance Criteria:

- [x] Soft delete sets `deletedAt` timestamp
- [x] Archived contacts hidden from default list but searchable via filter
- [x] Bulk archive from list view

**US-1.1.5** — Import contacts from Excel

> As a **sales agent**, I want to import contacts from an Excel file, so that I can onboard existing data quickly.

Acceptance Criteria:

- [x] Download template (.xlsx) with expected columns
- [x] Upload file, parse client-side, show preview table with validation status
- [x] Valid rows imported; invalid rows flagged with reason
- [x] Duplicate detection during import
- [x] Import summary report (created, skipped, errors)

**US-1.1.6** — Export contacts

> As a **manager**, I want to export filtered contacts to Excel/CSV, so that I can share data with external teams.

Acceptance Criteria:

- [ ] Export respects active filters and search
- [ ] Columns match the import template format
- [ ] Export runs async for large datasets with download notification

### Epic 1.2 — Contact Organization

**US-1.2.1** — Assign contact to territory / agency / team

> As a **manager**, I want to assign contacts to organizational units, so that the right agents handle them.

Acceptance Criteria:

- [x] Contact has `territory`, `agency`, `team`, `assignedTo` fields
- [x] Reassignment logged in activity timeline
- [x] Bulk reassignment from list view

**US-1.2.2** — Contact status lifecycle

> As a **sales agent**, I want to move a contact through status stages, so that I can track progression.

Acceptance Criteria:

- [x] Statuses: New, Contacted, Qualified, Nurturing, Converted, Lost, Archived
- [x] Status change triggers workflow actions (see Module 8)
- [x] Status history with timestamps visible on contact detail

**US-1.2.3** — Advanced search and filters

> As a **sales agent**, I want to filter contacts by multiple criteria, so that I can find the right people.

Acceptance Criteria:

- [x] Filter by: status, source, territory, agency, team, tags, date range, assigned agent
- [x] Saved filters (personal and shared)
- [x] Full-text search across name, email, phone, company

---

## Module 2: Leads Management

### Epic 2.1 — Lead CRUD & Lifecycle

**US-2.1.1** — Create a lead

> As a **sales agent**, I want to create a lead with source and interest information, so that I can track potential opportunities.

Acceptance Criteria:

- [x] Lead captures: contact reference, source, product interest, estimated value, priority, notes
- [x] Lead auto-linked to contact record
- [x] Lead score computed from profile completeness + engagement signals

**US-2.1.2** — Lead qualification

> As a **sales agent**, I want to qualify or disqualify a lead, so that I focus on high-potential opportunities.

Acceptance Criteria:

- [x] Qualification form: budget, authority, need, timeline (BANT)
- [x] Qualified leads auto-move to pipeline stage (see Module 9)
- [x] Disqualified leads archived with reason

**US-2.1.3** — Convert lead to opportunity / client

> As a **sales agent**, I want to convert a qualified lead into an active opportunity or client, so that the sales cycle continues.

Acceptance Criteria:

- [x] Conversion creates an opportunity record linked to the contact
- [x] Lead status updates to "Converted"
- [x] All lead history preserved and accessible from the opportunity

### Epic 2.2 — Lead Capture from External Sources

**US-2.2.1** — Auto-capture leads from web forms

> As an **admin**, I want to auto-import leads from contact forms on external websites, so that no opportunity is missed.

Acceptance Criteria:

- [x] Auto-generated JavaScript snippet per capture config (tenant-scoped with API key)
- [x] Snippet sends form data to `POST /api/v1/leads/capture` endpoint
- [x] Captured lead assigned to territory/team/agent via routing rule (fixed or round-robin)
- [x] Snippet configuration UI: map form fields to CRM fields via `fieldMapping`
- [x] Settings > Capture de leads page with listing, add/edit, script preview, delete

**US-2.2.2** — Import leads from platforms (Google Forms, LinkedIn, Facebook, Website)

> As a **marketing manager**, I want leads from Google Forms, LinkedIn Lead Gen, and Facebook Lead Ads to flow into the CRM automatically, so that I can centralize lead management.

Acceptance Criteria:

- [x] Integration configuration per platform (API key, field mapping, routing rule) via CaptureConfig
- [x] Incoming leads deduplicated against existing contacts (email/mobile)
- [x] Source tracked (Google Form, LinkedIn, Facebook, Website, etc.)
- [x] Webhook endpoint `POST /api/v1/leads/webhook/:platform` passes API key for validation
- [x] LinkedIn post commenter import via dedicated endpoint + frontend dialog
- [ ] Real-time or near real-time sync with native platform APIs (OAuth-based)

**US-2.2.3** — Lead enrichment from comments and interests

> As a **sales agent**, I want the system to extract interest areas from lead comments and form data, so that I can personalize outreach.

Acceptance Criteria:

- [ ] Tags auto-generated from keywords in comments/notes
- [ ] Interest categories configurable per tenant (Banking, Insurance, etc.)
- [ ] Enrichment data visible on lead detail

---

## Module 3: Documents Management

### Epic 3.1 — Document Storage

**US-3.1.1** — Upload documents to a contact / lead / opportunity

> As a **sales agent**, I want to attach documents to records, so that all relevant files are centralized.

Acceptance Criteria:

- [ ] Supported formats: PDF, DOCX, XLSX, JPG, PNG
- [ ] Max file size configurable per tenant (default 10MB)
- [ ] Documents stored in tenant-scoped storage (S3 or equivalent)
- [ ] Document metadata: name, type, uploaded by, uploaded at, linked entity

**US-3.1.2** — Document categories and templates

> As an **admin**, I want to categorize documents and provide templates, so that agents use consistent formats.

Acceptance Criteria:

- [ ] Document categories: Identity, Contract, Financial, Other (configurable)
- [ ] Template library: upload reusable document templates
- [ ] Required document checklist per product/workflow stage

**US-3.1.3** — Document preview and download

> As a **sales agent**, I want to preview documents inline without downloading, so that I save time.

Acceptance Criteria:

- [ ] PDF inline viewer
- [ ] Image preview (JPG, PNG)
- [ ] Download button for all formats
- [ ] Document version history (re-upload replaces with version tracking)

---

## Module 4: Events Configuration

### Epic 4.1 — Event Types & Scheduling

**US-4.1.1** — Configure event types

> As an **admin**, I want to define event types (meeting, call, demo, follow-up), so that agents use consistent event categories.

Acceptance Criteria:

- [x] Event type: name, icon, color, default duration, required fields
- [x] CRUD on event types (tenant-scoped)
- [x] System default types seeded on tenant creation

**US-4.1.2** — Schedule an event

> As a **sales agent**, I want to schedule events linked to contacts/leads, so that I organize my outreach.

Acceptance Criteria:

- [x] Calendar view (day, week, month)
- [x] Event form: type, title, date/time, duration, attendees, notes, linked entity
- [x] Conflict detection (agent double-booking warning)
- [x] Email/SMS reminder configurable per event

**US-4.1.3** — Event outcomes and follow-ups

> As a **sales agent**, I want to log event outcomes and schedule follow-ups, so that nothing falls through the cracks.

Acceptance Criteria:

- [x] Post-event form: outcome (completed, no-show, rescheduled), notes
- [x] Quick action to schedule follow-up from outcome form
- [ ] Outcome logged in contact/lead activity timeline

---

## Module 5: Organizational Structure (Offices, Agencies, Teams, Territories)

### Epic 5.1 — Hierarchy Management

**US-5.1.1** — Configure organizational hierarchy

> As an **admin**, I want to define Offices → Agencies → Teams → Affiliations (Territories), so that data and access are scoped correctly.

Acceptance Criteria:

- [ ] CRUD for each level: Office, Agency, Team, Territory
- [ ] Parent-child relationships enforced (Agency belongs to Office, etc.)
- [ ] Each entity has: name, code, manager, members, status (active/inactive)

**US-5.1.2** — Assign users to organizational units

> As an **admin**, I want to assign agents to teams and territories, so that workload is distributed properly.

Acceptance Criteria:

- [ ] User can belong to one team and one territory
- [ ] Manager role per unit (team lead, territory manager)
- [ ] Reassignment audit trail

**US-5.1.3** — Scoped data visibility

> As a **manager**, I want to see only the contacts/leads in my territory/team, so that data access follows org boundaries.

Acceptance Criteria:

- [ ] List views filtered by user's org scope by default
- [ ] Managers see their unit's data; directors see multiple units
- [ ] Admin/super-admin sees all data across the tenant
- [ ] Permission matrix: view, edit, delete, export per role per scope

### Epic 5.2 — Performance by Organization

**US-5.2.1** — Dashboard per organizational unit

> As a **director**, I want to see KPIs per office/agency/team, so that I compare performance.

Acceptance Criteria:

- [ ] Metrics: contacts created, leads generated, conversions, revenue, activities logged
- [ ] Date range filter
- [ ] Drill-down from office → agency → team → agent
- [ ] Exportable report

---

## Module 6: Electronic Signature (E-Sign)

### Epic 6.1 — E-Signature Workflow

**US-6.1.1** — Send document for e-signature

> As a **sales agent**, I want to send a contract to a client for electronic signature, so that deals close faster.

Acceptance Criteria:

- [ ] Select document (PDF) from the document store or upload new
- [ ] Define signature fields placement (drag-and-drop on PDF)
- [ ] Add signatories (name, email)
- [ ] Send via email with unique signing link

**US-6.1.2** — Sign a document (client-side)

> As a **client**, I want to sign a document from a link on my phone or computer, so that I don't need to print anything.

Acceptance Criteria:

- [ ] Mobile-responsive signing page
- [ ] Signature methods: draw, type, upload image
- [ ] Identity verification before signing (OTP via SMS/email)
- [ ] Signed document sealed with timestamp and audit trail

**US-6.1.3** — Track signature status

> As a **sales agent**, I want to see which documents are pending, signed, or declined, so that I follow up appropriately.

Acceptance Criteria:

- [ ] Status: Draft, Sent, Viewed, Signed, Declined, Expired
- [ ] Automatic reminders for unsigned documents
- [ ] Signed PDF stored back in document store with signature certificate

---

## Module 7: Callback System

### Epic 7.1 — Callback Planning

**US-7.1.1** — Schedule a callback

> As a **sales agent**, I want to schedule a callback with a specific date/time and notes, so that I follow up on promises.

Acceptance Criteria:

- [ ] Callback form: contact, date/time, priority, reason/notes
- [ ] Callback appears in agent's calendar and task list
- [ ] Notification/alert at scheduled time

**US-7.1.2** — Callback queue dashboard

> As a **team lead**, I want to see all pending callbacks for my team, so that I ensure coverage.

Acceptance Criteria:

- [ ] List view: overdue, today, upcoming
- [ ] Filter by agent, priority, status
- [ ] Reassign callback to another agent

**US-7.1.3** — Log callback outcome

> As a **sales agent**, I want to log the callback result, so that the contact history is complete.

Acceptance Criteria:

- [ ] Outcome: reached, voicemail, no answer, rescheduled
- [ ] Notes field for conversation summary
- [ ] Quick action to schedule next callback
- [ ] Logged in contact activity timeline

---

## Module 8: Workflows — Predefined Product / Lead Lifecycle

### Epic 8.1 — Workflow Builder

**US-8.1.1** — Create a workflow template

> As an **admin**, I want to define automated workflows for leads and contacts, so that processes are consistent.

Acceptance Criteria:

- [x] Workflow builder UI: visual canvas with drag-and-drop nodes
- [x] Trigger types: status change, new lead, form submission, date-based, manual
- [x] Action types: assign to user/team, send email/SMS, create task, update field, wait, conditional branch
- [x] Workflow templates saveable and reusable

**US-8.1.2** — Assign workflow to a product or pipeline

> As an **admin**, I want to link a workflow to a product type or pipeline, so that it runs automatically.

Acceptance Criteria:

- [ ] Each product/pipeline can have one active workflow
- [x] Workflow version management (draft, active, archived)
- [x] Test mode: run workflow on a test record before going live

**US-8.1.3** — Monitor workflow execution

> As an **admin**, I want to see which workflows are running, stuck, or completed, so that I troubleshoot issues.

Acceptance Criteria:

- [x] Execution log per workflow instance: trigger, steps executed, current step, errors
- [x] Dashboard: active instances, completion rate, average duration
- [x] Manual intervention: retry failed step, skip, cancel

---

## Module 9: Sales Pipelines

### Epic 9.1 — Pipeline Configuration

**US-9.1.1** — Create and configure a sales pipeline

> As an **admin**, I want to define pipeline stages and rules, so that the sales process is structured.

Acceptance Criteria:

- [x] Pipeline has: name, stages (ordered), win probability per stage, required fields per stage
- [x] Multiple pipelines per tenant (e.g., Banking pipeline, Insurance pipeline)
- [x] Default pipeline configurable

**US-9.1.2** — Kanban board view

> As a **sales agent**, I want to see opportunities on a kanban board, so that I visually track progress.

Acceptance Criteria:

- [x] Columns = pipeline stages; cards = opportunities
- [x] Drag-and-drop to move between stages
- [x] Card shows: contact name, deal value, age, assigned agent
- [ ] Stage transition validates required fields

**US-9.1.3** — Pipeline analytics

> As a **sales manager**, I want pipeline reports, so that I forecast revenue.

Acceptance Criteria:

- [x] Funnel chart: count and value per stage
- [x] Conversion rate between stages
- [x] Average time in each stage
- [x] Win/loss analysis by source, agent, product

---

## Module 10: Modular Feature System

### Epic 10.1 — Module Marketplace

**US-10.1.1** — Browse available modules

> As an **admin**, I want to see a catalog of available modules, so that I extend the CRM for my business needs.

Acceptance Criteria:

- [ ] Module catalog UI: name, description, category, status (available, installed, coming soon)
- [ ] Categories: Sales, Marketing, Finance, Operations, Communication
- [ ] Each module has a detail page with screenshots, features list, dependencies

**US-10.1.2** — Install / uninstall a module

> As an **admin**, I want to add or remove a module from my application, so that I only pay for and see what I need.

Acceptance Criteria:

- [ ] One-click install activates the module (adds routes, menu items, permissions)
- [ ] Uninstall removes access but preserves data (soft disable)
- [ ] Dependencies checked on install (e.g., "E-Sign requires Documents module")
- [ ] Tenant-scoped: each tenant has its own module set

**US-10.1.3** — Module permissions

> As an **admin**, I want to control which roles can access a module, so that features are role-appropriate.

Acceptance Criteria:

- [ ] Per-module role assignment
- [ ] Menu and routes hidden for unauthorized roles
- [ ] API guards enforce module access at endpoint level

---

## Module 11: Calling System (Twilio / Asterisk)

### Epic 11.1 — Twilio Integration

**US-11.1.1** — Click-to-call from CRM

> As a **sales agent**, I want to call a contact directly from the CRM, so that I don't switch between tools.

Acceptance Criteria:

- [x] Click-to-call button on contact detail and list view
- [x] Call initiated via Twilio (softphone widget via CallerService)
- [x] Softphone widget embedded in CRM UI (inbound + outbound CallerComponent)
- [x] Caller ID shows CRM contact info for incoming calls

**US-11.1.2** — Call logging

> As a **sales agent**, I want calls to be automatically logged, so that I have a complete interaction history.

Acceptance Criteria:

- [x] Call log: direction (inbound/outbound), duration, timestamp, recording URL, outcome
- [x] Auto-linked to contact record
- [x] Post-call disposition form: outcome, notes, follow-up action

**US-11.1.3** — Call recording and playback

> As a **manager**, I want to listen to recorded calls, so that I coach my team.

Acceptance Criteria:

- [x] Recordings stored (recording URL via Twilio callback, stored in call log)
- [x] Playback from call log entry (CallRecordingPlayerComponent with audio controls)
- [ ] Recording consent configurable (auto-announce or manual)

### Epic 11.2 — Custom Calling Application (Asterisk)

**US-11.2.1** — Self-hosted calling infrastructure

> As a **platform admin**, I want a self-hosted Asterisk-based calling system, so that large tenants reduce per-minute costs.

Acceptance Criteria:

- [ ] Asterisk server configuration per tenant
- [ ] SIP trunk management
- [ ] WebRTC softphone in CRM (same UI as Twilio integration)
- [ ] Fallback: if Asterisk unavailable, route through Twilio

---

## Module 12: Marketing Campaigns (SMS / Email / WhatsApp)

### Epic 12.1 — Campaign Builder

**US-12.1.1** — Create a campaign

> As a **marketing manager**, I want to build a campaign targeting a segment of contacts, so that I drive engagement.

Acceptance Criteria:

- [x] Campaign form: name, channel (Email, SMS, WhatsApp), audience segment, schedule
- [x] Audience builder: filter contacts by status, tags, territory, source, custom fields
- [x] Estimated audience count shown before send

**US-12.1.2** — Message templates

> As a **marketing manager**, I want to create reusable message templates with merge fields, so that messages are personalized.

Acceptance Criteria:

- [x] Template editor per channel (email, SMS, WhatsApp) with merge fields (`{{firstName}}`, `{{company}}`)
- [x] SMS character count tracking
- [x] Template library: save, categorize, preview

**US-12.1.3** — Send bulk messages

> As a **marketing manager**, I want to send a campaign to the selected audience, so that I reach contacts at scale.

Acceptance Criteria:

- [x] Send now or schedule for later
- [ ] Throttling to comply with provider rate limits
- [ ] Opt-out/unsubscribe link auto-included (email, SMS)
- [ ] WhatsApp: use approved templates via Business API

### Epic 12.2 — Campaign Analytics

**US-12.2.1** — Track campaign performance

> As a **marketing manager**, I want to see delivery, open, and click rates, so that I measure campaign effectiveness.

Acceptance Criteria:

- [x] Metrics per campaign: sent, delivered, bounced, opened, clicked, unsubscribed
- [ ] Per-contact delivery status
- [ ] Comparison view across campaigns
- [ ] Export campaign report

---

## Module 13: Sales Products Configuration (FinTech / InsurTech)

### Epic 13.1 — Product Catalog

**US-13.1.1** — Configure financial products

> As an **admin**, I want to define micro-finance and banking products, so that agents sell the right offerings.

Acceptance Criteria:

- [x] Product fields: name, type (loan, savings, insurance), interest rate, duration, fees, eligibility criteria, metadata
- [x] Product variants (e.g., different loan tiers)
- [x] Product status: Draft, Active, Deprecated

**US-13.1.2** — Configure insurance products

> As an **admin**, I want to define insurance products with policy structure, so that agents manage policies accurately.

Acceptance Criteria:

- [x] Insurance product fields: type (life, health, property), premium structure, coverage, deductible, terms
- [x] Multi-contract support: a client can have multiple active policies
- [x] Policy lifecycle: Quote → Application → Underwriting → Active → Renewal → Lapsed

**US-13.1.3** — Insurance policy management

> As a **sales agent**, I want to create and manage insurance policies linked to contacts, so that I track coverage.

Acceptance Criteria:

- [x] Policy creation linked to product and contact
- [x] Policy details: policy number, start/end date, premium amount, payment frequency, beneficiaries
- [ ] Renewal reminders and lapse warnings
- [x] Claims tracking (basic: open, in review, approved, denied)

### Epic 13.2 — Sandbox Environment

**US-13.2.1** — Product sandbox mode

> As an **admin**, I want to configure products in a sandbox, so that I test accuracy before going live.

Acceptance Criteria:

- [x] Product has environment flag: `sandbox` or `production`
- [ ] Sandbox products visible only to admins and testers
- [ ] Simulate product application flow with test data
- [ ] Validation report: interest calculations, fee breakdowns, eligibility checks

**US-13.2.2** — Promote product to production

> As an **admin**, I want to toggle a sandbox product to production, so that agents can start selling it.

Acceptance Criteria:

- [x] One-click promote with confirmation dialog
- [ ] Pre-promotion checklist (all required fields configured, at least one test run passed)
- [x] Promotion audit log (who, when, product version)
- [x] Rollback: demote back to sandbox if issues found

---

## Module 14: Lead Capture Script Generator + LinkedIn Capture

### Epic 14.1 — Embeddable Capture Script

**US-14.1.1** — Generate JavaScript embed script

> As an **admin**, I want to generate a JS snippet for my website, so that form submissions auto-create leads in the CRM.

Acceptance Criteria:

- [x] Configuration UI: select target form fields, map to CRM fields, choose routing rule
- [x] Generated script is tenant-scoped (includes API key / tenant identifier)
- [x] Script captures form submit event and POSTs to CRM API
- [x] CORS policy: whitelist allowed domains per capture config
- [x] CaptureConfig CRUD (`POST/GET/PATCH/DELETE /api/v1/lead-capture-configs`)
- [x] Auto-generated UUID API key per configuration
- [x] Script preview dialog with copy-to-clipboard
- [x] API key validation on `POST /api/v1/leads/capture` (invalid key → 401)
- [x] Backward compatible: requests without API key still accepted

**US-14.1.2** — Lead routing rules

> As an **admin**, I want to define rules for how captured leads are routed, so that the right team handles them.

Acceptance Criteria:

- [x] Routing rules: round-robin (team rotation) and fixed assignment (specific user)
- [x] Routing rule configured per capture config via add/edit dialog
- [x] Round-robin increments `lastAssignedIndex` atomically on each capture
- [x] Captured leads auto-assigned `assignedToUserId` / `assignedToTeamId` based on rule
- [ ] Rule priority ordering (multiple rules per config)
- [ ] Fallback: unmatched leads go to a default queue
- [ ] Rule testing: simulate a lead submission and show routing result

### Epic 14.2 — LinkedIn Post Capture

**US-14.2.1** — Import leads from LinkedIn post commenters

> As a **marketing manager**, I want to import commenters from a LinkedIn post as leads, so that I capture engaged prospects.

Acceptance Criteria:

- [x] LinkedIn-type capture config with dedicated import endpoint (`POST /api/v1/lead-capture-configs/:id/import-linkedin-post`)
- [x] Input: post URL + array of commenters (firstName, lastName, profileUrl, headline)
- [x] Deduplication by `customFields.capture_linkedin_profile_url`
- [x] Each commenter creates a lead via the existing capture pipeline (with routing rule applied)
- [x] Response returns `{ imported, skipped }` counts
- [x] Frontend dialog for manual commenter entry with add/remove rows
- [ ] Browser extension for auto-extracting commenters from LinkedIn DOM

---

## Module 15: Mobile Application — Beneficiary Portal

### Epic 15.1 — Beneficiary Account & Payments

**US-15.1.1** — Beneficiary payment tracking

> As a **beneficiary (client)**, I want to see my payment schedule and history on my phone, so that I stay on top of my obligations.

Acceptance Criteria:

- [ ] Dashboard: next payment date, amount due, total remaining, payment history
- [ ] Push notifications for upcoming and overdue payments
- [ ] Payment receipt download (PDF)

**US-15.1.2** — Mobile payment integration

> As a **beneficiary**, I want to make payments via Wave, Orange Money, MoMo, Visa, or bank transfer, so that I pay conveniently.

Acceptance Criteria:

- [ ] Payment gateway integration: Wave, Orange Money, MoMo, Visa, bank account
- [ ] Payment confirmation with reference number
- [ ] Auto-reconciliation: payment updates loan balance in CRM
- [ ] Failed payment retry and notification

**US-15.1.3** — Automated debit / standing orders

> As a **beneficiary**, I want to set up automatic deductions, so that I never miss a payment.

Acceptance Criteria:

- [ ] Configure auto-debit: amount, frequency, payment method, start/end date
- [ ] Pre-debit notification (24h before)
- [ ] Debit failure handling: retry logic, notification, grace period

### Epic 15.2 — Collection Optimization

**US-15.2.1** — Collection dashboard (agent-side)

> As a **collection agent**, I want to see overdue accounts prioritized, so that I focus recovery efforts.

Acceptance Criteria:

- [ ] Overdue accounts list: days overdue, amount, contact info, last interaction
- [ ] Priority scoring (amount × days overdue)
- [ ] Quick actions: call, SMS reminder, schedule visit
- [ ] Collection performance metrics per agent

---

## Module 16: Public Account Opening (Mobile)

### Epic 16.1 — Digital Onboarding

**US-16.1.1** — Self-service account registration

> As a **prospect**, I want to open an account from my smartphone, so that I don't need to visit an office.

Acceptance Criteria:

- [ ] Multi-step mobile form: personal info, address, employment, financial info
- [ ] Progress indicator and save/resume capability
- [ ] Terms and conditions acceptance
- [ ] Application submitted to CRM as a new contact + lead

### Epic 16.2 — KYC & Identity Verification

**US-16.2.1** — Identity verification (KYC)

> As a **compliance officer**, I want applicants to verify their identity digitally, so that we meet regulatory requirements.

Acceptance Criteria:

- [ ] Integration with KYC providers: Confido, Veriff, or Tesseract (OCR)
- [ ] Document capture: ID card (front/back), selfie for liveness check
- [ ] Verification result: approved, pending review, rejected
- [ ] Manual review queue for edge cases

**US-16.2.2** — Required document upload

> As a **prospect**, I want to upload my required documents during registration, so that my application is complete.

Acceptance Criteria:

- [ ] Document checklist per product type:
  - Identity document (national ID, passport)
  - Proof of address (utility bill, lease contract)
  - Bank statement / RIB
  - Birth certificate (if applicable)
- [ ] Camera capture or file upload
- [ ] Document quality check (blur, readability)
- [ ] Status per document: uploaded, verified, rejected (with reason)

### Epic 16.3 — Remote Loan Application

**US-16.3.1** — Online contract signing

> As a **prospect**, I want to sign my contract online, so that I finalize my account remotely.

Acceptance Criteria:

- [ ] Contract generated from product template with applicant data
- [ ] E-signature flow (see Module 6)
- [ ] Signed contract stored in applicant's document store

**US-16.3.2** — Remote loan application

> As a **prospect**, I want to apply for a loan from my phone, so that I get financing without visiting an office.

Acceptance Criteria:

- [ ] Loan application form: amount requested, purpose, duration, income info
- [ ] Supporting document upload (payslips, bank statements)
- [ ] Application status tracking: Submitted, Under Review, Approved, Disbursed, Rejected
- [ ] Applicant notified at each status change (push + SMS)

**US-16.3.3** — Automated internal loan validation

> As a **credit manager**, I want the system to auto-validate loan applications based on rules, so that processing is faster.

Acceptance Criteria:

- [ ] Rule engine: credit score threshold, debt-to-income ratio, document completeness, blacklist check
- [ ] Auto-approve if all rules pass (configurable)
- [ ] Auto-reject with reason if critical rules fail
- [ ] Escalate to human review if borderline
- [ ] Validation audit trail (rules evaluated, scores, decision)

---

## Module 17: Settings & Configuration

### Epic 17.1 — Currency Management

### Epic 17.2 — Lead Capture Settings

**US-17.2.1** — Lead capture settings page

> As an **admin**, I want a centralized settings page for lead capture integrations, so that I manage all capture sources in one place.

Acceptance Criteria:

- [x] Settings > Capture de leads menu item in "Leads, Contacts & Compte" group
- [x] LinkedIn and Site internet menu items in "Canaux de communication" link to lead-capture page
- [x] Table listing all capture configs (name, platform, masked API key, status, domains, actions)
- [x] Add/edit via side drawer dialog (name, platform, domains, routing rule, field mapping)
- [x] Script preview dialog for website configs
- [x] LinkedIn import dialog for LinkedIn configs
- [x] `lead_capture_manage` permission added to RBAC system

**US-17.1.1** — Configure currencies

> As an **admin**, I want to manage currencies used across the platform (deals, products, payments), so that the system reflects the correct monetary units.

Acceptance Criteria:

- [x] CRUD for currencies: code (ISO 4217), name, symbol, exchange rate, active status
- [x] Only one currency can be set as default per tenant
- [x] Soft delete prevents deleting the default currency
- [x] Duplicate code detection on create/update
- [x] Mutation endpoints restricted to `currency_manage` permission
- [x] Settings > Monnaie page displays currencies in a table (code, name, symbol, rate, default badge)
- [x] Add/Edit currency via side drawer dialog with form validation
- [x] "Set as default" action on non-default currencies
- [x] Permission group "Devises" added to role configuration

---

## Cross-Cutting Concerns

### Security & Compliance

- [ ] All API endpoints enforce tenant isolation via `x-tenant-fqdn`
- [ ] Role-based access control (RBAC) across all modules
- [ ] Audit logging for all create, update, delete operations
- [ ] GDPR-compliant data export and deletion
- [ ] Payment data encryption at rest and in transit (PCI DSS for payment modules)

### Multi-Tenancy

- [ ] Each tenant has isolated database
- [ ] Tenant-scoped configuration for all modules
- [ ] Module enablement per tenant

### Performance

- [ ] Pagination on all list endpoints (fix `$skip`/`$sort` ordering bug)
- [ ] Background job processing for bulk operations (import, export, campaigns)
- [ ] Caching for frequently accessed configuration (products, workflows, org hierarchy)

### Mobile

- [ ] Responsive web for agent-facing features
- [ ] Native mobile app (React Native or Flutter) for beneficiary portal (Module 15) and public onboarding (Module 16)
- [ ] Offline-capable for field agents (sync on reconnect)
