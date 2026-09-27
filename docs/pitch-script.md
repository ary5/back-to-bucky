# Back to Bucky — two-minute pitch script (word-for-word)

Recording script for the Devpost video. Built on the 120-second budget from *How to Make a Winning
2-Minute Pitch* (Mirzaei, BuildFest 2026): **60 of the 120 seconds is the demo; every other beat
exists to make those 60 seconds mean something.**

Companion to [`demo-script.md`](demo-script.md) — that file is the beat outline and submission
checklist. This file is what you read aloud.

| Time | Beat | What it buys |
|---|---|---|
| 0:00–0:25 | Problem. Specific, cited, one real quote. TAM in one line. | Grounding — four rubrics score it |
| 0:25–1:25 | The solution, demoed. That exact problem, solved on screen. | The main criterion |
| 1:25–1:38 | Why now? Why has nobody solved it? | Differentiation |
| 1:38–1:50 | Why us? | Founder–market fit |
| 1:50–2:00 | Next 6–12 months. | A path beyond Sunday |

**Total spoken: ~310 words ≈ 120s at a normal pace.** Two slots are marked `[FILL]` — they need
real sourcing. Read "Two things you must not fake" before recording.

---

## Before you hit record

- `npm start`, open `http://127.0.0.1:3000`, and **run the flow once** so the first response is warm.
- Staff token entered and the staff tab loaded **offscreen**, before recording. Never show `.env`,
  `GEMINI_API_KEY`, or `STAFF_TOKEN`.
- Browser zoom ~125% so the match card and claim panel are legible at Devpost's player size.
- Have the staff private note ready to point at: *"A blue star sticker inside the left earcup."*

---

## 0:00–0:25 — The problem

**ON SCREEN:** You on camera, or the landing page headline *"Lost on campus. Back where it belongs."*

> Lose something on this campus and you're searching scattered lists, hoping yours is described
> well enough to recognize. But detail cuts both ways: every mark a listing publishes is a mark the
> wrong person can repeat back at the desk.
>
> **[FILL: one cited number, or one verbatim student quote. ~10 words. See below.]**
>
> One user, one moment: a student at the lost-and-found desk, asked to prove the item is theirs.

*(~62 words + the fill)*

---

## 0:25–1:25 — The demo · 60 seconds · this is the pitch

Screen recording, four beats. Cut every keystroke pause.

**0:25–0:40 — ON SCREEN:** Type `I lost black Sony headphones at the library yesterday.` → the
"Searched fictional inventory" activity line → the public match card.

> This is the prototype, running on eight fictional items. I describe what I lost the way anyone
> would. It searches, and comes back with a public match — black Sony over-ear headphones, Memorial
> Library, found yesterday. That is *everything* the agent can see: id, description, location, date.

**0:40–0:58 — ON SCREEN:** The agent's generic question. Zoom on it. Then type
`It has a blue star sticker inside the left earcup.`

> It doesn't tell me what makes that pair distinctive — it asks me. "Describe any marks,
> accessories, or contents only the owner would know." I answer: blue star sticker, inside the left
> earcup.

**0:58–1:10 — ON SCREEN:** Claim draft panel → click **Submit claim for staff review** → the
pending receipt.

> That becomes a draft. Nothing is verified. I have to press submit myself, and what comes back says
> *pending review*.

**1:10–1:25 — ON SCREEN:** Switch to **Staff review** (already unlocked). Zoom so the student's
original messages and the private note sit in the same frame.

> Staff side: my own words, next to the private record that never entered the model's context. Blue
> star sticker, left earcup. A human makes the release decision — the agent cannot.

*(~148 words total)*

---

## 1:25–1:38 — Why now, and why nobody has solved it

**ON SCREEN:** The Break Card, or the fabricated-notes quote as a full-screen card.

> Anyone can bolt a chatbot onto a listings page, and this year everyone will. We tested ours and
> found what that costs: remove the private notes from the model's context, and it invents them.
> Two out of two runs.

*(~38 words — the fastest-read beat in the script; that's fine, it's the punchline)*

**If you can spare 3s from the demo**, this is the strongest sentence in the whole pitch:

> Nothing in the logs looks like a leak, so a leak test passes while the student is still misled.

---

## 1:38–1:50 — Why us

**ON SCREEN:** Both of you, or the repo with `eval/results/` expanded.

**Default (true today, no sourcing needed):**

> Two UW students. We shipped the working flow and the adversarial evaluation in one weekend — and
> when our own fix created a new failure, we published that instead of the clean number.

**Better, if either of you has a real connection to the field — [FILL]:** one sentence of
founder–market fit, not a list of majors. The guide's shape is *"We spent two years doing X, which
is why we knew to look at Y."* Worked a service desk, ran a residence-hall front desk, built an
inventory system, lost something valuable and watched the process fail — any of those beat the
default. Do not stretch it.

*(~32 words)*

---

## 1:50–2:00 — Next 6–12 months, and the ask

**ON SCREEN:** Repo / README, or back on camera.

> Next six months: test this workflow with actual campus lost-and-found staff, and replace our
> keyword output filter with something that catches the behavior, not the vocabulary. The ask — an
> intro to DoIT.

*(~31 words. Aim the ask at a sponsor actually in the room; swap DoIT for whoever that is.)*

---

## The `[FILL]` slots

### Slot 1 — the cited number or quote (0:00–0:25)

The guide is blunt: **"If you cannot cite it, do not say it."** Three rubrics score grounding, so
this slot is worth more per second than anything else in the script. Where to get it:

- **r/UWMadison or campus forums** — a real sentence in a student's own words about losing
  something. A verbatim quote outscores a statistic here.
- **On-site mentors** — DoIT, Brundage Lab, the Lab Fellows. They work campus friction daily.
- **Any published campus lost-and-found volume or recovery rate** — cite the source on screen.

If you get nothing citable, **cut the slot** and run straight into "One user, one moment." A
25-second problem beat with no number beats one with an invented number.

### Slot 2 — optional student-feedback line (buy 5s from the demo)

Only if you actually run sessions before recording. The guide's own example of what scores:

> *Worth nothing:* "We talked to a lot of students and they really loved it."
> *Worth the five seconds:* "We showed it to eleven students at the Atrium table. Nine had the
> problem. Two said the feature we thought mattered didn't."

The surprise is worth more than the count. Template, filled **only** from
[`student-feedback.md`](student-feedback.md) after real sessions:

> We put this in front of **[N]** students. **[N]** had lost something on campus. The surprise:
> **[what confused them, or the assumption they broke]** — so we changed **[X]**.

---

## Two things you must not fake

1. **Student feedback.** `docs/student-feedback.md` is an empty worksheet right now. Until it has
   real entries, say nothing in this video about student validation, and do not narrate Badgers
   Building for Badgers as validated. That rubric scores "evidence you actually validated with
   fellow students this weekend" — an invented count costs more than a missing one.
2. **The safety claim.** Say *"we found no disclosure in nine attempts,"* never *"it's safe"* or
   *"we fixed it."* The shipped guard (`safeStudentReply()`, commit `29351d2`) is a keyword filter
   on the output path — it catches the phrasing you observed, not the behavior. A fabrication worded
   *"our records show"* would still reach the student, and paraphrases are untested. The Break Card
   already says this; the video has to match it.

Also do not say: deployed, live, official UW service, ownership verified, or that the agent releases
items.

---

## Production notes (from the guide)

- **OpenScreen** for the screen recording — the clean zoom matters at 0:40 and 1:10, where the
  agent's question and the private note have to be readable.
- **CapCut** to strip dead space so all 120 seconds do work, and to add captions. Judges watch many
  of these; captions are not optional.
- **Audio beats video.** Wired earbuds or a second phone for the voiceover. Record narration
  separately from the screen capture and lay it over — that keeps the demo tight without rushing
  your speech.
- Watch it once at Devpost's player size before uploading, and reserve upload time ahead of the
  **11:00 AM CDT** deadline.
