# Back to Bucky — product requirements

**Status:** proposal for discussion, September 27, 2026. No production service, campus partnership, real inventory, or institutional approval is implied.

**Starting point:** the repository contains a local BuildFest prototype with eight fictional records, a Gemini chat, a claim draft, and a staff read view.
**Product bet:** a person who loses an item should be able to find the right holding desk, submit evidence once, and see what happens next; staff should be able to resolve claims without publishing the details that prove ownership.

## 1. Problem and position

Campus lost-and-found is distributed. UW–Madison Police advise checking the building manager first for most items, handle significant-value property differently, and direct found keys to the Lock Shop. Housing desks have their own intake and claimant process. A historical university article also describes a MyUW lost-and-found listing; its current availability and integration options must be verified before claiming this is the first or only campus search tool. Back to Bucky's differentiation should be **a clear cross-desk handoff, private ownership evidence, and visible claim status**, not merely a chat search box.

The first real version should serve **one consenting holding desk** with its own staff and custody procedures. The app is a discovery and workflow layer; physical custody and final release stay with that desk. Expansion to other desks depends on actual demand, signed-off workflows, and a data-sharing arrangement. Until then, the UI must state exactly which locations are covered and offer directions to the right existing office when it cannot search an item.

### Jobs to be done

- **Claimant:** “I lost something; tell me whether this participating desk may have it, help me give distinguishing evidence, and tell me where my claim stands.”
- **Desk staff:** “Record what we hold quickly, keep identifying details private, compare claims, contact the likely owner, and document a safe handoff.”
- **Desk lead:** “See backlog and custody history, control staff access, and remove expired records.”

### Non-goals for the first pilot

- No automatic declaration of ownership, automatic item release, or numeric match score shown to claimants.
- No campus-wide coverage claim, scraping of other units' records, or MyUW integration without permission.
- No public peer-to-peer meetup or direct exchange of claimant and finder contact information.
- No upload or display of Wiscard photos, passwords, financial information, keys/access codes, or sensitive document contents. Route these to existing processes.
- No mandatory chatbot. Search and claim must work without a model.

## 2. Pilot scope and personas

**Pilot site:** one desk, selected with an actual operator. Start with lower-risk everyday objects (headphones, bottles, umbrellas, notebooks). The desk chooses accepted categories, hours, holding period, and release protocol. Students, staff, and visitors may submit a claim using a verified email address; a campus affiliation is not assumed. Staff use institution-approved sign-in if available, and the desk lead assigns roles. The pilot must never imply official UW operation until approved.

**Coverage contract shown in UI:** participating desk name, covered building(s), intake start date, categories, update frequency, hours/contact method, and what to do for items outside coverage. This is critical to avoid a false “no match means not found” conclusion.

## 3. Core user experience

### Claimant flow

1. Landing page explains coverage and offers **Search found items** and **I lost something**. A short notice explains that results are possible matches and certain private details will be kept for staff.
2. Person enters item category, plain-language description, approximate loss date, and possible area. Search returns at most a few public cards with category, broad location, found date window, and holding desk. Public cards omit serial numbers, distinctive marks, contents, exact custody location, and detailed photos.
3. If no match, show nearby supported options and the desk's normal contact route. Offer an opt-in lost report for future matching only if the desk agrees to maintain this queue; do not pretend the service searches all of campus.
4. To claim a candidate, enter a verified email and privately describe one or more distinguishing details. The interface explicitly warns against entering passwords, ID numbers, or highly sensitive contents. Show a review screen listing the fields staff will see. Submission is an explicit action.
5. Show a receipt and plain status: **Received → Under review → Staff will contact you / Closed**. Do not expose whether a specific secret matched. Give a secure way to return to the status page and withdraw the claim.
6. Staff contact the claimant through the app with next steps. The actual pickup requires the desk's normal identity and custody checks.

### Staff flow

1. Staff sign in and choose their authorized desk. Intake form captures category, public description, broad found location and date, staff-only identifying details, custody location, and handling notes. A preview makes clear what claimants can see. For sensitive categories, the form redirects staff to existing procedures.
2. Queue shows new and aging claims, grouped by item. Staff can inspect claimant-supplied evidence and private item details side by side. The app may highlight overlapping terms for convenience, but does not decide ownership.
3. Staff record an outcome and reason, request additional information without leading hints, or mark a claim as duplicate/ineligible. Decision actions require confirmation and are logged with actor and time.
4. For an approved candidate, staff send pickup instructions, record handoff, and mark the item returned. A second staff confirmation can be required for high-value pilot categories if the desk wants it.
5. Lead can correct intake records, reassign claims, manage staff roles, export audit history, and set retention rules. Corrections retain an audit trail.

### UX quality bar

- Mobile-first layout, readable without chat, four or fewer form screens for a claim, clear progress and back navigation.
- Keyboard operable; visible focus, form labels and errors, reflow at 320 CSS pixels, screen-reader announcements for results and status, no color-only status meaning. Test against UW web accessibility guidance and WCAG 2.1 AA before institutional pilot.
- Plain language: “possible match,” “pending staff review,” and “this desk covers…”; never “verified owner” before staff action.
- Resilient to failed email, search, or AI: preserve draft locally for the session, show retry guidance, and avoid duplicate submissions.

## 4. Functional requirements and priority

**P0 — required for a real one-desk pilot**

1. Staff item intake/editing, public/private field preview, custody location, category rules, and item lifecycle.
2. Database-backed public search by category, description, area, and time; no model dependency.
3. Claim form with private evidence, email verification, explicit consent/review, receipt, status, withdrawal, and submission deduplication.
4. Staff authentication and role-based access scoped to a desk; queue, comparison, outcomes, claimant contact, pickup/handoff record, and immutable audit events.
5. Real transactional notifications for verification and status changes; delivery failure handling.
6. Privacy controls: field allowlist, secret isolation, retention/deletion, rate limiting, abuse reporting, backups, monitoring, and incident response owner.
7. Coverage and limitations copy, accessibility, mobile usability, and real operator/claimant validation.

**P1 — after the core workflow is proven**

- Optional AI phrasing and query interpretation that only receives a public search query and public results. It cannot view private notes, claimant evidence, email, or authentication state; it cannot submit or decide a claim.
- Lost-report opt-in with future-match notification and a clear expiry.
- Claim clarifications through a masked message thread, saved response templates, staff workload filters, and basic analytics.
- CSV import with preview and duplicate detection for a partner desk that already has records.

**P2 — expansion**

- Multiple partner desks, scoped roles, per-desk policies, integration adapters for approved systems, and campus navigation/routing.
- Richer matching (synonyms, semantic retrieval) on public text only, with measured recall and no secret leakage.
- Institution-approved NetID/OIDC sign-in if the service is adopted as a UW application. UW's identity guidance recommends OIDC for new integrations, but an actual integration requires an application owner and approval.

## 5. Business rules and state machines

**Item:** `intake_draft → held → pickup_pending → returned`; alternate exits `transferred`, `expired`, or `disposed` according to desk policy. Only `held` items can appear in public search. `pickup_pending` should stop new public claims or show limited status according to staff decision. Every transition records actor, time, and custody note.

**Claim:** `draft → submitted → in_review → awaiting_claimant → pickup_ready → resolved_returned`; alternate exits `closed_unverified`, `withdrawn`, or `expired`. Only staff can move a claim into a decision/pickup state. The claimant sees a coarser public status map, to avoid leaking which exact detail matched.

**Conflicts:** multiple people may claim the same item. Staff may compare them, but only one claim can be marked pickup ready at a time; the transaction must enforce this. Handoff closes the item and other claims with a neutral explanation. A rejected claimant cannot infer a private secret from iterative “try again” feedback.

**High-risk categories:** IDs/Wiscards, keys, access cards, cash, devices with personal data, medication, and official documents require category-specific routing or explicit desk policy before intake. For example, UW's Wiscard guidance says found cards go to the Wiscard Office; UWPD's FAQ directs keys to the Lock Shop. Do not show identifying photos or contents publicly.

## 6. Trust, privacy, and AI

- The server constructs public search records using an explicit field allowlist. Staff-only notes and custody location live in separate columns/tables and are never included in claimant API responses or model prompts.
- Claim evidence and contact details are sensitive user data. Only assigned desk staff can view them; use encrypted transport and encrypted storage/backups, minimal logs, and short, configurable retention approved by the desk. Deletion must cover backups on their lifecycle. Publish a plain-language privacy notice before collecting real data.
- Verify contact channels; apply per-IP/account rate limits, CAPTCHA or equivalent abuse step after suspicious use, and controls against repeated secret probing. Keep all staff actions and sensitive data reads auditable.
- The LLM is an optional interpreter for natural-language search and help text. Deterministic code owns search authorization, item/claim transitions, and response formatting. The safest initial pilot can launch without AI and add it only if it measurably improves finding items.
- External model use with real claim or staff data requires an institutional data review and approved vendor terms. Until then, keep all claimant evidence and staff details away from Gemini. The BuildFest prompt-injection evaluation is a useful test seed, not proof of safety.
- Never ask users to provide credentials, full ID numbers, or descriptions of sensitive contents in chat. Use human escalation when a user reports a potentially dangerous item, theft, or emergency.

## 7. Validation and success criteria

### Before building

Interview 5–8 potential claimants and 2–3 desk operators across at least two units. Verify where records are kept, who can authorize posting, whether a current MyUW listing exists, item volume, handling time, and what information can be public. Observe an intake and a release. These are research targets, not completed findings.

### Pilot go/no-go

- Named desk owner approves categories, public fields, custody/release workflow, staffing, retention, privacy notice, and incident contact.
- Ten representative items and end-to-end claims are tested with staff; no private fields appear in student API responses, UI, emails, logs, or AI inputs.
- At least five representative users complete search, claim, and status tasks unaided, including a mobile and keyboard-only run. Record actual completion and confusion before setting targets.
- Staff can process a claim from intake to handoff with an audit trail; duplicate/conflicting claims and failed notifications are handled.
- Accessibility review, backup restore drill, access-control test, and security review pass.

### Pilot metrics (instrumented, with consent and minimal analytics)

- Search-to-possible-match rate; no-results rate by category and coverage area.
- Claim-form completion rate; median time to submit; abandonment by step.
- Time from submission to first staff action and to resolution; backlog age.
- Share of claims with sufficient evidence for staff to decide; false-positive work created.
- Successful returns and claimant-reported clarity/trust. Count unknown outcomes separately.
- Safety: unauthorized data disclosures, staff access violations, duplicate releases, unresolved incident reports. Target zero, investigate every event.

Do not use “AI match accuracy” as the primary success measure. The operational outcome is a safe, understandable return process.

## 8. Open decisions for the owner and pilot partner

1. Which desk will pilot, and can it enter real found-item records? Who owns physical custody and release?
2. Is there a current MyUW lost-and-found service or desk database to coexist with? What data access is permitted?
3. Which claimant channels are allowed: campus email only, any verified email, or guest walk-up assistance?
4. What holding periods, high-risk categories, and identity checks does the desk already use?
5. Who acts as data owner, approves the privacy notice and vendor use, and handles incidents?
6. Is AI valuable after testing deterministic search with real descriptions?

## Sources for campus-specific assumptions

- [UW–Madison Police lost-and-found FAQ](https://uwpd.wisc.edu/about-us/faqs/)
- [UW–Madison Housing desk lost-and-found guidance](https://www.housing.wisc.edu/undergraduate/services/desks/)
- [Wiscard lost-and-found card guidance](https://wiscard.wisc.edu/id-card/general-information/)
- [UW News historical description of distributed lost-and-found and MyUW listing](https://news.wisc.edu/thousands-of-items-lost-found-across-campus/)
- [UW NetID integration overview](https://kb.wisc.edu/iam/130404)
- [UW website and web app accessibility guidance](https://digitalaccessibility.wisc.edu/make-it-accessible/websites/)

Sources were checked September 27, 2026. The historical MyUW article is evidence of a past listing, not confirmation that it remains available today.
