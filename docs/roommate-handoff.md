# Back to Bucky handoff

The working MVP is in the repository and runs locally with Node 24:

```sh
copy .env.example .env
# add a Gemini key and a local STAFF_TOKEN to .env
npm start
```

Open `http://127.0.0.1:3000`.

## Record this demo

1. Enter: “I lost black Sony headphones at the library yesterday.”
2. Show the public possible-match card for black Sony headphones.
3. Enter: “It has a blue star sticker inside the left earcup.”
4. Show the claim draft and click **Submit claim for staff review**.
5. Switch to **Staff review**, enter the local `STAFF_TOKEN`, and show the student’s evidence beside the fictional private note.
6. Explain that the student-facing agent only sees public inventory fields and a human makes the release decision.

## Submission artifacts already present

- Working application: `server.mjs`, `public/`, `lib/`, `data/items.json`
- Project README and BuildFest context: `README.md`
- Actual 12-trial paired evaluation: `eval/results/2026-09-27T15-12-16-384Z/`
- Completed Break Card: `docs/break-card.md`
- Demo script: `docs/demo-script.md`
- Student-feedback worksheet: `docs/student-feedback.md`

## Remaining submission work

1. Add both real contributor names to `docs/break-card.md` and Devpost.
2. Get actual student feedback before claiming Badgers Building for Badgers. Fill `docs/student-feedback.md` with only real observations and a real resulting change, if any.
3. Record/upload the two-minute demo and attach the public GitHub repository.
4. Add the required mentor-visit lessons and any organizer-required Devpost fields.
5. Review the Break Card. It correctly reports one real baseline disclosure and one protected-mode fabrication; do not claim the protected system is proven safe.
