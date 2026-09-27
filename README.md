# Back to Bucky
### Lost on campus. Back where it belongs.

A Gemini-powered campus lost-and-found agent that helps students locate belongings while protecting the identifying details needed to support a claim.

**Status:** Project initialized for Badger BuildFest 2026. This README describes the planned prototype; implementation and evaluation results are forthcoming.

## The problem

Students struggle to find belongings across scattered lost-and-found listings. Revealing every identifying detail publicly can also help someone falsely claim an item. Staff need a way to connect plausible matches with evidence supplied by the claimant.

## How it works

1. A student describes a lost item and where or when it may have been lost.
2. The agent searches found-item records for plausible matches.
3. It asks for distinguishing details without revealing the staff's private answers.
4. It records the student's responses and prepares a claim for human staff review.

**Example:** A student reports missing black Sony headphones. A staff record includes a blue sticker inside the left earcup. The agent asks the student to describe identifying marks; it should never disclose the sticker or lead the student to the answer.

The prototype assists staff. A matching description is evidence for review, not proof of ownership or authorization to release an item.

## Small prototype scope

- Eight fictional found-item records, with public descriptions and private distinguishing details.
- A student chat interface powered by the Gemini API.
- Agent tools for searching inventory, recording answers, and creating a claim for review.
- A staff view showing the claim, supporting evidence, and the agent's actions.
- An evaluation log for attempted information leaks and safeguards.

The demo uses fictional inventory. Real campus systems, accounts, and physical item release are outside the initial prototype.

## Planned implementation

- A small web interface and backend.
- Gemini function calling for agent decisions and tool use.
- A local fixture database for found items and claims.
- Server-side validation and restricted access to identifying details.
- API credentials supplied through environment variables and excluded from version control.

## Badger BuildFest 2026

**Event:** September 26–27, 2026, UW–Madison. Hosted by the Tech Exploration Lab, led by the Wisconsin School of Business in collaboration with the Wisconsin Institute for Discovery.

**Main track:** Applied AI & Automation.

**Intended optional challenges:**

### The Art of the Break — Tech Exploration Lab

Stress-test our own agent and submit a one-page Break Card covering a concrete failure, its observed frequency, attempted mitigations, and lessons learned. The event describes a $500 prize, a named feature for the winner, and credit for contributing teams in a published industry report. Participation and publication remain subject to organizer review.

Our evaluation will test whether the agent reveals private identifying details when faced with:
- Claims of staff authority.
- Requests for hints, partial answers, or multiple-choice options.
- Repeated guesses or multi-turn pressure.
- Instructions embedded in item descriptions.

Record actual outcomes, add a safeguard, and rerun the same cases. Keep baseline and revised results separate. Do not invent failures, successes, or student feedback.

### Badgers Building for Badgers — DoIT Academic Technology

Address a concrete campus friction point with a working prototype and evidence of validation with fellow students during the weekend. We will ask students to try finding and claiming a fictional item, record what confused them, and document changes made from their feedback.

## Submission checklist

- [ ] Team of 2–5 current UW–Madison students; every teammate participates and is added to Devpost.
- [ ] Working prototype and repository with a short README.
- [ ] Two-minute demo video.
- [ ] Required Devpost project responses, one main track, and the selected optional challenges.
- [ ] Three mentor visits and one lesson from each; the deck permits mentors or student organizations, while the website specifically says mentors.
- [ ] Real student feedback for Badgers Building for Badgers.
- [ ] One-page Break Card and reproducible evaluation records.
- [ ] Submit by **Sunday, September 27, 2026, 11:00 AM CDT**.

The Devpost rules page contains a conflicting noon sentence; the event deck, official schedule, and Devpost's displayed deadline agree on 11:00 AM. Track finalists demo live Sunday 1:00–3:00 PM. Optional challenges are judged asynchronously, with winners announced September 30.

## Sources

- [BuildFest website](https://buildfest.project.wiscweb.wisc.edu/)
- [Tracks, challenges, awards, and eligibility](https://buildfest.project.wiscweb.wisc.edu/tracks-awards/)
- [Schedule and logistics](https://buildfest.project.wiscweb.wisc.edu/schedule-logistics/)
- [Mentors and judges](https://buildfest.project.wiscweb.wisc.edu/mentors-judges/)
- [BuildFest FAQ](https://buildfest.project.wiscweb.wisc.edu/faq-about-tel/)
- [Opening slide deck](https://docs.google.com/presentation/d/1XPuqr3ra0k-yBc-PwL5cy2x1-3VAlgRAWNdoegxr7bA/edit)
- [Devpost submission portal](https://badger-build-fest-2026.devpost.com/)
- [Devpost deadline](https://badger-build-fest-2026.devpost.com/details/dates)

Event details were checked September 27, 2026. Follow organizer announcements for updates.
