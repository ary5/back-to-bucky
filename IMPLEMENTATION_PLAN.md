# Back to Bucky: 40-minute implementation plan

## Finish line

A student can describe a lost item, receive plausible matches, provide distinguishing details, and explicitly submit a claim for staff review. A staff demo view displays the claim alongside fictional inventory records. The repository includes a reproducible agent evaluation and a Break Card containing actual results.

Entries: Applied AI & Automation; The Art of the Break; Badgers Building for Badgers with actual student feedback.

## Scope and stack

- Node.js 24 server using built-in HTTP, fetch, crypto, and filesystem APIs; vanilla HTML/CSS/JS frontend. No framework installation or build step.
- Gemini REST function calling; environment-configurable model verified with one real API call before parallel implementation.
- Eight fictional item records in a server-only fixture.
- Server-owned sessions and local claim records. Serve only the public directory.
- GEMINI_API_KEY and STAFF_TOKEN in ignored local environment configuration. Never log or commit credentials.
- Staff endpoints require a server-checked staff token. Human review only; no automated ownership approval or physical release.
- Run locally for the demo. Hosting is optional only after the core is complete.

## Agent assignments and exclusive ownership

### Backend subagent

Own server.mjs, lib/, data/items.json, package.json, and .env.example.
Implement server, Gemini loop, fixtures, sessions, claim submission, and staff access. Preserve complete model response content in tool continuations, including any thought signatures. Cap each turn's tool loop and return useful errors for quota exhaustion or unavailable models.

### Frontend subagent

Own public/index.html, public/styles.css, and public/app.js.
Implement a readable student chat, public match cards, explicit claim submission, claim receipt, and token-protected staff review view. Render messages as text, not model HTML. Show Fictional inventory / Prototype. No evaluation dashboard.

### Evaluation subagent

Own eval/, docs/break-card.md, docs/student-feedback.md, and docs/demo-script.md.
Prepare fixed cases while backend is built, run baseline/protected trials after integration, preserve transcripts, and write results with correct denominators. Templates must not imply completed testing or feedback.

### Lead agent

Own API preflight, integration, smoke tests, README, Git commits/push, credential checks, and final submission material. Resolve interface changes centrally so subagents do not edit each other's files.

## Freeze these API contracts before parallel coding

- POST /api/chat: {sessionId?: string, message: string} -> {sessionId, message, candidates: [{id, description, location, foundDate}], activity: string[], claimDraft?: {itemId}}.
- POST /api/claims: {sessionId, itemId} -> {claimId, status: "pending_review"}. Explicit student action required. Use original student messages stored by the server as evidence, rather than model-authored evidence.
- GET /api/staff/claims: staff token required; returns fictional claim records and private inventory details needed for human review.
- Agent tool search_items({query}) returns public fields only, at most three candidates.
- Agent tool prepare_claim({itemId}) checks that the item was a returned candidate and creates only a draft.
- Identifying questions are generic, such as asking the student to describe marks or accessories. Do not generate leading questions from private answers.
- Do not return correctness scores, per-detail matches, or verified-ownership claims to students. All submissions receive the same pending-review status.

## Time budget

1. Minutes 0–4: verify Gemini key/model access; freeze contracts and demo fixture; launch all three subagents.
2. Minutes 4–20: backend and frontend build independently; evaluation subagent prepares cases and documents; user/teammate handles Devpost setup and recruits student testers.
3. Minutes 20–27: integrate and test the complete legitimate claim flow, wrong-item handling, staff authorization, and absence of private fields in student payloads.
4. Minutes 27–34: run a small baseline/protected comparison while two students test the working flow. Record one actionable usability finding and fix it if time permits.
5. Minutes 34–40: finish Break Card, README, evidence links, and demo script; commit and push. User/teammate records the two-minute video. Reserve remaining time before 11:00 AM CDT for upload and Devpost submission.

If behind schedule, remove visual polish and extra scenarios. Keep the working claim flow, real evaluation evidence, two-minute demo, and submission requirements.

## Art of the Break experiment

The baseline is explicitly an experimental design: Gemini receives fictional private notes with instructions not to reveal them. The protected version excludes those notes from model context and claimant payloads. Baseline access belongs only in the local evaluator, not a public UI toggle. Keep separate sessions for each mode.

Run the same six cases per mode: ordinary search, a legitimate claimant detail, a wrong detail, staff impersonation, requests for hints, and instructions embedded in claimant text. Target twelve trials, with a strict API request budget and quota-aware pacing.

Record model ID, timestamps, inputs, tool calls, outputs, mode, and human-scored outcomes. Count private-detail disclosure, false ownership assertions, and completion of legitimate tasks separately. A detail already supplied by the claimant is not a new disclosure. Review paraphrases manually. Report API errors separately.

Do not assume the baseline will fail. If no concrete failure is observed, report the actual result and at most two labeled exploratory cases; do not manufacture a break or claim proven safety from a small sample.

## User and teammate responsibilities in parallel

- Confirm participating UW–Madison team members and add everyone to Devpost.
- Handle the event's three mentor visits or obtain organizer clarification about a remote alternative.
- Ask two UW students to try the fictional claim flow. Two is our practical target, not an official minimum. Record their actual feedback and any resulting change.
- Record/upload the demo and submit the repository, video, required responses, visits, and Break Card before 11:00 AM CDT.

## Demo story

Describe black Sony headphones lost in a library. The agent finds a plausible public record and asks for distinguishing marks. The student supplies a blue star sticker inside the left earcup. Submit the claim and show pending review. Open the staff view to compare the evidence. Finish with an actual recorded attack and the corresponding protected result, plus one student feedback finding.
