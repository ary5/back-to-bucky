# Back to Bucky — implementation roadmap and agent delegation

**Status:** planning proposal, September 27, 2026. This does not authorize production deployment or collection of real records.

**Companion:** [Product requirements](PRODUCT_REQUIREMENTS.md). The BuildFest implementation plan in the repository describes the completed local demo; this roadmap describes a possible one-desk pilot and later expansion.

## 1. Build strategy

Keep the current prototype available as a demo reference. Build the pilot in a separate `codex/production-pilot` branch after a partner desk and data owner agree to the workflow. Preserve the prototype's good design rule—private identifying details are absent from public search and model context—but replace demo-only persistence, access, and claim handling. Do not bulk-import fictional items or demo claims into production.

Suggested stack, subject to the hosting and campus partner's constraints:

- **Web:** React + TypeScript + Vite; a small route-based app with shared design tokens and accessible forms. Reuse the current visual direction, copy, and interaction ideas rather than porting the entire vanilla JS code unchanged.
- **API:** Node.js + TypeScript + Fastify. Define request and response schemas for every route, especially explicit public response schemas. Organize into `auth`, `items`, `search`, `claims`, `notifications`, `audit`, and `admin` modules.
- **Database:** managed PostgreSQL, versioned SQL migrations, parameterized queries, and transactional state transitions. Use separate public and private item tables or views plus application authorization checks; consider PostgreSQL row-level security as defense in depth for multi-desk expansion.
- **Email:** a provider approved by the data owner, with signed single-use verification links, a delivery event log, and a retry queue. Provider choice is deliberately open until hosting and data review.
- **AI:** disabled by default in the first release. Later, a server-side Gemini adapter can rewrite a query or explain public results using public fields only, behind a feature flag and evaluation gate.
- **Deployment:** one managed web service, managed database, TLS, secret manager, separate staging and production environments, automated migrations with rollback plan, health checks, backups, and monitoring. Select the actual host with the partner's IT/data owner.

This is an incremental product rebuild because the current `server.mjs` keeps sessions in memory, stores claims in one local JSON file, uses a shared staff bearer token, has no item intake or decisions, and silently switches to a demo fallback when Gemini fails. These are acceptable demo shortcuts but do not support reliable multi-user operations.

## 2. Target architecture and boundaries

```text
Claimant browser ──TLS──> Web/API ──> Public item search view ──> PostgreSQL
        │                    │
        └── verified link ───┤──> Claim service ────────────────> private evidence
                             │
Desk staff browser ──SSO─────┤──> Staff workflow ───────────────> private item notes + audit
                             │
                             └──> Notification queue ──────────> approved email provider
                             └──> Optional public-only AI adapter
```

Rules enforced on the server:

1. A public item DTO contains only `id`, `category`, `publicDescription`, `approximateFoundAt`, `broadArea`, `holdingDeskDisplayName`, and `publicStatus`. It never inherits or spreads a full database row.
2. Staff-only details, claimant evidence, contact information, custody notes, and audit data are in separate service paths and require scoped authorization.
3. AI tools are read-only and receive only the public DTO/query. A model output is explanatory text, never a database write, claim decision, or authorization result.
4. All mutations specify an authenticated actor, desk scope, expected current state/version, and idempotency key where replay is plausible.
5. The database transaction is the source of truth; background notification delivery follows committed events. A failed email does not roll back a successfully saved claim, and the UI says whether delivery is pending.

## 3. Data model (first pass)

Use UUID identifiers, UTC timestamps, `created_at`, `updated_at`, and `version` columns for mutable records. Suggested tables:

- `desks`: name, covered areas, hours/contact route, active flag, coverage dates, category and retention policy references.
- `staff_users`: external identity subject, display name, active flag; `desk_memberships`: desk ID, role (`intake`, `reviewer`, `lead`), granted/revoked timestamps.
- `items_public`: desk ID, category, public description, broad area, approximate found time, searchable status, intake actor, lifecycle status. Public descriptions are reviewed/previewed at intake.
- `items_private`: item ID, identifying marks/contents, precise custody location, handling notes, restricted category flag. Keep separate from public search queries and serializers.
- `custody_events`: item ID, type, actor, timestamp, from/to location, note; append-only.
- `claimants`: verified email hash for lookup plus encrypted email for contact, verification status, consent timestamp. Avoid collecting a student ID.
- `claims`: item ID, claimant ID, lifecycle status, private distinguishing description, loss time/place, submitted time, assigned staff, optimistic version, decision code and staff-only explanation.
- `claim_messages`: claim ID, sender/role, body, timestamp; separate public-to-claimant and staff-only fields.
- `claim_events`: append-only status/decision history, actor, time, reason code, correlation ID.
- `notification_jobs`: type, recipient reference, template version, payload reference, status, attempt count, next retry, provider message ID; avoid storing secret-rich email bodies in logs.
- `audit_events`: actor, desk, action, target ID, timestamp, request ID, minimal metadata; include sensitive read events. No raw evidence or secrets in audit metadata.
- `login_tokens`: hashed token, purpose, claimant/claim reference, expiry, used timestamp. Single use, short lived, rate limited.

Indexes: active public items by desk/category/found date, text search on normalized public descriptions, claims by desk/status/created time, unique active pickup-ready claim per item, and idempotency keys for claim submission and notifications. Write retention jobs against policy and test their effect on all related rows, search indexes, and backups. Pilot data migrations should be reversible in staging and reviewed before production.

## 4. API contract proposal

Prefix `/api/v1`. Use JSON, consistent error `{code, message, requestId}`, pagination, server-side validation, and explicit serializers. Do not expose stack traces or provider errors.

### Public/claimant

- `GET /coverage` → participating desk(s), categories, areas, hours, last updated, next steps outside coverage.
- `GET /items?query=&category=&area=&foundAfter=&cursor=` → public item DTOs and paging cursor. Empty results include coverage guidance.
- `POST /claimant/verification` `{email}` → generic acknowledgment, regardless of account existence.
- `POST /claimant/verification/consume` `{token}` → secure short-lived claimant session cookie (`HttpOnly`, `Secure`, `SameSite=Lax`).
- `POST /claims` `{itemId, lossDescription, privateEvidence, lossArea, lossDateRange, consentVersion}` plus `Idempotency-Key` → receipt ID and coarse status. The server never echoes private evidence in the response.
- `GET /claims/:id` → only claims owned by the verified claimant; coarse status, public item summary, next step, and own submitted text if the privacy design permits.
- `POST /claims/:id/withdraw` → withdrawal acknowledgment; staff still retain the audit record per approved policy.
- `POST /claims/:id/messages` → claimant clarification response after staff request; rate limited.

### Staff

- `POST /staff/items` and `PATCH /staff/items/:id` → scoped intake/edit, public/private field validation and preview.
- `GET /staff/items/:id` → item, private details, custody history, and claims for authorized desk staff.
- `GET /staff/claims?status=&deskId=&cursor=` → queue; `GET /staff/claims/:id` → evidence, activity, and allowed actions.
- `POST /staff/claims/:id/transitions` `{action, expectedVersion, reasonCode, note}` → validated transition and audit event. Pickup-ready must be exclusive per item within one transaction.
- `POST /staff/claims/:id/messages` → template/typed response with content review, queued notification.
- `POST /staff/items/:id/custody-events` → pickup/transfer/expiry with actor and desk policy checks.
- `GET /staff/audit` → lead-only filtered export; never public.

`GET /health/live` and `/health/ready` are operational endpoints; readiness verifies critical dependencies without revealing configuration or secrets. Generated API schema and fixtures become the contract for frontend and tests. Staff sign-in callback and session endpoints depend on the approved identity provider and should be finalized during Phase 0.

## 5. Security and privacy implementation

- Use the partner's approved identity provider for staff, plus a local allowlist of desk membership and role. Authentication alone does not grant access to a desk. A shared `STAFF_TOKEN` must be removed before real data.
- Claimants use verified email session links in the pilot. Store token hashes, expire and consume once, rotate sessions after verification, protect state-changing routes from CSRF, and enforce session expiry/revocation.
- Enforce authorization in service functions and query scopes, not just routes. Add negative tests across desks, users, and claims; never trust an `itemId` or `deskId` from the client to authorize access.
- Define a public field allowlist and response schemas. Test every public endpoint and notification for absence of private strings. Block indexing by search engines for claimant/staff pages and do not put tokens in referrers or analytics.
- Rate limit search, verification, claim creation, and messaging; detect repeated probing of one item. No public correctness feedback, match score, or hint generation from private details.
- Encrypt data in transit and at rest using managed services; restrict database roles, use least-privilege secrets, rotate credentials, and scan commits/dependencies. Do not log email bodies, evidence, staff notes, tokens, or model prompts containing personal data.
- Write a retention matrix with the partner (items, claims, messages, audit, backups), a deletion/withdrawal process, an incident runbook, and a real privacy notice before launch. Treat policy and legal review as a named work item, not an assumption.
- Keep the prototype/evaluation environment separate from production; synthetic fixtures only in public demos.

## 6. Search and optional AI design

**First ship:** deterministic PostgreSQL full-text search plus category, date, and broad-area filters. Normalize common item terms and spelling variants from user testing. Rank by text, category, recency, and area; show clear filters rather than opaque scores. Measure no-result queries and missed known items with a labeled evaluation set provided by the desk. Do not put private notes into the index.

**AI experiment after launch:** for users who type a sentence, the model proposes structured query terms and may explain public result cards. The server validates the structured output, runs the same public search, and renders canonical cards itself. Feature flag per desk; timeout falls back to deterministic search with an honest message. The prompt receives no claimant evidence, email, private item field, or staff note. Reuse and expand the BuildFest attack suite to include multi-turn probing, fabricated staff authority, prompt injection in public descriptions, and false ownership claims. Human review scores both retrieval usefulness and disclosure/fabrication; retain model/version and test transcripts with synthetic data. Release only when it improves task completion without introducing unacceptable failure modes.

## 7. Phases, deliverables, and gates

Timings are rough **elapsed weeks for a small team**, not promises; institutional access and approval can dominate the schedule.

### Phase 0 — discovery and pilot contract (1–3 weeks)

- Interview claimant and desk users; observe intake, review, and release. Inventory the desk's current system and rules; verify existing MyUW options.
- Choose one desk, data owner, approved hosting/email/auth path, public/private fields, supported categories, retention, and escalation route.
- Prototype screens and content using fictional data; test with five users. Freeze P0 workflows and API contracts.
- **Exit:** written partner approval and a short data-flow/security review. Without a partner, build only a synthetic-data usability beta and do not call it a live lost-and-found service.

### Phase 1 — production foundation (1–2 weeks)

- Add TypeScript API/web workspaces, database migrations, local/staging setup, CI, deployment pipeline, config validation, logging, request IDs, and backup/restore instructions.
- Build staff/claimant auth and desk-scoped roles, public/private item storage, coverage endpoint, and intake preview.
- **Exit:** staff can create an item in staging and public search sees only the approved fields; a cross-desk request is denied.

### Phase 2 — complete service loop (2–3 weeks)

- Search and mobile web flow; verified claimant email; claim review/submission/status/withdrawal; staff queue, transitions, notifications, custody events, audit.
- Test duplicate claims, conflict handling, reload/retry, expiry, wrong user/desk, and failed email. Add accessible errors/loading states and no-result guidance.
- **Exit:** a synthetic item moves from intake to human-approved handoff in staging, with two competing claims and a complete audit trail.

### Phase 3 — pilot hardening and launch (1–2 weeks plus approvals)

- Run accessibility and security reviews, restore drill, retention test, load test at expected volume, staff training, operational runbook, privacy notice, and incident exercise.
- Seed only real items approved by the desk; use a limited launch with clear coverage. Review metrics and feedback weekly.
- **Exit:** pilot owner signs off, launch checklist is complete, and staff have a rollback/manual operating path.

### Phase 4 — evidence-based expansion (after several weeks of pilot data)

- Improve the highest-friction step, consider lost reports and multi-desk coverage, then test whether AI improves search. Add integrations only with approval.
- **Exit:** partner decision based on measured returns, staff workload, privacy incidents, and user clarity.

## 8. Verification matrix

Minimum automated coverage should include:

- **Unit:** public DTO allowlist, normalization/ranking, category routing, state transitions, retention rules, token expiry, role checks.
- **Integration:** database transaction and exclusive pickup-ready constraint, idempotent claim submission, notification outbox/retry, migration forward/back, staff desk scoping.
- **End-to-end:** mobile claimant search → verify → submit → status; staff intake → compare → contact → handoff; no-results and email outage; keyboard and screen-reader smoke.
- **Security:** direct-object-reference attempts, cross-desk reads/writes, claim access by another claimant, CSRF/session replay, brute force/rate limits, public payload snapshots with planted secret strings, prompt injection against optional AI.
- **Operations:** staging deploy, backup restore, health checks, alert delivery, secret rotation, retention purge, manual fallback.

Use synthetic data in CI and staging until the partner explicitly permits real records. Record test evidence and unresolved risks for the pilot owner; passing tests alone does not grant institutional approval.

## 9. Future subagent design and delegations

Agents are **proposed roles**, not active workers in this planning pass. The lead keeps product decisions, integration, approvals, and final review. Give every agent a frozen contract, acceptance criteria, test fixture, and exclusive file ownership before parallel work. Agents should report open questions and evidence, not independently redefine privacy rules or contact external parties.

### Wave A — discovery and contracts (up to three agents, after partner access)

1. **UX/research agent** owns interview guide, task flows, copy, wireframes, accessibility checklist, and `apps/web` design specs. It may analyze user notes supplied by the lead; it cannot fabricate interviews or publish quotes.
2. **Data/workflow agent** owns schema proposal, state machine, public/private field dictionary, migration plan, and custody/retention rules in `packages/contracts` and `db/migrations`. It validates assumptions with the lead's partner findings.
3. **Security/privacy agent** owns threat model, data-flow map, role matrix, vendor-review questions, and verification plan in `docs/security`. It has review authority over contracts but does not edit another agent's implementation during this wave.

**Lead integration gate:** decide pilot desk, freeze public DTO and status semantics, resolve conflicts, and get partner review. No production code using real data before this gate.

### Wave B — implementation (up to three agents concurrently)

1. **Backend/data agent:** exclusive owner of `apps/api/src/items`, `search`, `claims`, database migrations, and service tests. Deliver transactional intake/claim/state APIs against frozen contracts.
2. **Frontend agent:** exclusive owner of `apps/web`, component tests, responsive/accessibility QA, and user-facing coverage/claim/status/staff views. Use mocked contracts first, then staging API.
3. **Identity/notifications agent:** exclusive owner of `apps/api/src/auth`, `notifications`, session/email adapters, and relevant tests. Mock approved provider interfaces until credentials/approval exist.

**Lead integration gate:** merge one vertical slice at a time (intake/search, claim, staff review, notifications), run contract and security tests, and resolve shared route/config changes. No agent edits another agent's owned directory without coordination.

### Wave C — hardening and optional AI

1. **QA/operations agent** owns end-to-end tests, deployment/runbooks, monitoring, backup/restore evidence, and incident rehearsal.
2. **Security reviewer agent** performs adversarial review of auth, authorization, privacy serializers, retention, and dependency changes; files precise findings for owners to fix.
3. **AI evaluation agent** owns synthetic search corpus, prompt-injection cases, retrieval/utility scoring, and feature-flagged public-only adapter. It starts only after the deterministic workflow works and data-use approval is clear.

**Lead release gate:** reconcile agent outputs, run the complete verification matrix, conduct real user/staff testing, and obtain named owner approval. The lead owns merges and release; agents submit reviewable branches or patches and evidence. Do not run all roles at once if only three concurrency slots are available; preserve one slot for the lead.

### Suggested task card for each agent

Every delegation should contain: goal and user story; repo path ownership; API/schema version; prohibited data flows; acceptance tests; evidence to attach; dependency/merge order; and explicit instruction to stop and report any partner-policy uncertainty. This makes parallel work fast without letting privacy-critical assumptions drift.

## 10. Immediate next planning decisions

1. Confirm whether the desired end state is an independent one-desk pilot, an official UW service, or a student-run discovery tool. This changes identity, hosting, data ownership, and integration.
2. Choose and approach a pilot desk. Ask for its current records and release workflow before optimizing search or AI.
3. Verify whether MyUW currently offers an active lost-and-found listing and whether Back to Bucky should link to, complement, or integrate with it.
4. Test the current prototype with real users using **fictional items**, collect honest feedback, and update the P0 flow.
5. Approve the P0 scope and coverage language; only then create implementation issues and launch the future agent waves.

## Technical references

- [Fastify validation and response serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)
- [Vite React/TypeScript templates](https://vite.dev/guide/)
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [UW NetID OIDC integration overview](https://kb.wisc.edu/iam/130404)
- [UW web accessibility guidance](https://digitalaccessibility.wisc.edu/make-it-accessible/websites/)
