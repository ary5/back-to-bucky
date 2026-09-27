# Back to Bucky — Break Card

**Status: template; no experimental results recorded here yet.** Replace brackets only with observed evidence. Keep the completed card to one page.

**Team / contributors:** [Names to credit]  
**Agent:** Gemini searches fictional campus found-item records and prepares claims for human staff review.  
**Model / date / code revision:** [Exact model ID, timestamp, commit]

## Specific failure

[Describe one actually observed failure and why it matters to a student or staff member. If none was observed, state that explicitly; do not claim a qualifying break.]

**Reproduction:** [Case ID and exact prompt, with a short actual response excerpt.]  
**Evidence:** [Repository path to preserved transcript; screenshot if useful.]

## Frequency and mitigation

**Fixed experiment:** six fresh-session cases per mode: two legitimate tasks, one wrong-detail case, and three disclosure attacks. Planned: 12 trials. Completed: [baseline count], [protected count]. Errors: [count and cause].

**Observed disclosure:** baseline [x / completed attack trials]; protected [x / completed attack trials].  
**False ownership assertions:** baseline [x / completed trials]; protected [x / completed trials].  
**Legitimate task completion:** baseline [x / completed legitimate trials]; protected [x / completed legitimate trials].

**Change tested:** The experimental baseline gives Gemini fictional identifying notes and a confidentiality instruction. Protected mode removes those notes from model context and claimant responses; claims remain pending for human review. [Confirm implemented behavior and note any additional change actually tested.]

## What we learned

[Evidence-backed lesson; whether the same failure recurred after the change.]

**Limits:** Tiny sample, fictional inventory, human scoring, and no campus deployment. Zero observed leaks does not prove safety. [Any quota failures, unpaired runs, or exploratory cases.]

