# UEE Feedback

Learner feedback for UEE units: a mobile-first form, a private Google Sheet for responses, and a trainer report page that generates a PDF. Units flagged as TAE evidence (UEEIC0013 and UEEIC0038) also carry the TAE40122 wording and mapping.

Live at https://tadosolutions.github.io/UEE-feedback/

## Files

| File | Purpose |
|---|---|
| `index.html` | Learner form. Link with `?unit=UEEIC0013` or `?unit=UEEIC0038` to skip the program choice. |
| `report.html` | Trainer report page: filter responses, write analysis and actions, sign, generate the PDF. |
| `config.js` | The only file to edit: backend URL, programs, questions and the TAE40122 mapping. |
| `common.js` | Shared helpers (device ID, SHA-256, backend calls). |
| `vendor/` | jsPDF 4.2.1 and jsPDF-AutoTable 5.0.9, self-hosted so the report works without a CDN. |
| `apps-script/Code.gs` | Google Apps Script backend bound to the Google Sheet. |

## Current status (29 October 2026)

- Done: Google Sheet "Learner Feedback - TADO, Caesar" with a **Responses** tab (28 columns, A to AB, Status in AB).
- Done: Apps Script project "Learner Feedback backend" bound to it; `setup()` run and the admin key generated (Project Settings › Script properties › ADMIN_KEY).
- Done: deployed as web app "Learner feedback v1.0"; URL set as `endpoint` in `config.js`.
- Done: live test passed (status check, wrong admin key rejected, test response stored with hash check OK). The test row is marked `Excluded`.
- Done: published from `tadoSolutions/UEE-feedback` to GitHub Pages; both unit links, the report page and the backend connection checked live. The old copy on `tadosolutions.github.io/feedback/` has been removed.
- Next: a test submission from your phone on each link, then mark those rows `Excluded`.

## Plan to implement

1. **Create the Sheet and backend (15 min).** New Google Sheet "Learner Feedback - TADO, Caesar" → Extensions › Apps Script → paste `Code.gs` → run `setup()` once and approve. Copy the `ADMIN_KEY` from the Executions log (also in Project Settings › Script properties).
2. **Deploy.** Deploy › New deployment › Web app. Execute as **Me**, access **Anyone**. Copy the web app URL. (Learners never see the Sheet; the URL only accepts submissions, and listing needs the admin key.)
3. **Configure.** Paste the URL into `endpoint` in `config.js`. Confirm the unit titles, delivery dates and cohort sizes.
4. **Publish to GitHub Pages.** This repository (`tadoSolutions/UEE-feedback`) is served from Settings › Pages › Deploy from a branch › `main` / root. It is separate from `tadosolutions.github.io`, which keeps the rclone OAuth homepage and privacy page.
   - Learner links: `https://tadosolutions.github.io/UEE-feedback/?unit=UEEIC0013` and `https://tadosolutions.github.io/UEE-feedback/?unit=UEEIC0038`
   - Report: `https://tadosolutions.github.io/UEE-feedback/report.html` (marked `noindex`; data still needs the admin key)
   - To embed in another page: `<iframe src="/UEE-feedback/?unit=UEEIC0038" style="width:100%;height:100vh;border:0" title="Learner feedback"></iframe>`
5. **Test.** Submit one test response per program from your phone, check the row in the Sheet, load the report and generate a PDF. Then set the test rows' **Status** cell to `Excluded` in the Sheet (or untick them on the report page). The PDF states how many were left out.
6. **Collect.** Send each cohort its link (email, Teams chat, or a QR code on the last slide). Ask learners to submit before they leave the session.
7. **Produce the evidence.** On the report page: load, choose the program, write your analysis and actions, sign, and generate the PDF. Keep "Replace names with Candidate A, B, C" on for submission and save the Candidate key CSV in the Archive folder, not the submission.

## How the requirements are met

- **Brief:** 10 rated statements, 1 overall star rating, 2 optional comments. About 2 minutes.
- **Optional identity:** "Stay anonymous" is the default. "Add my name" asks for a name and an optional signature.
- **Anonymous traceability:** every response keeps a random device ID (stored in the browser on first visit), the client time with time zone, and the server receipt time. Browsers do not expose hardware IDs, so this is a pseudonymous ID. It resets if the learner clears browser data, and learners sharing one tablet share one ID. The PDF reports shared devices.
- **Integrity:** each response is hashed (SHA-256). The learner sees the first 12 characters as a receipt code; the server re-checks the hash on arrival and the report re-checks it again, marking each response "OK" or "CHECK".
- **Offline:** if the connection drops, the response is kept on the device and sent the next time the page opens online. The backend ignores duplicates by response ID.
- **Privacy:** a short collection notice and consent tick on the form; names redacted in the PDF by default.

## TAE40122 mapping (printed as Appendix C of the PDF)

Seeking learner feedback: TAEDEL411 PC 5.1 (Program A), TAEDEL405 PC 5.1 (Program B), TAEDES411 PC 3.2. Analysing it and identifying improvements: TAEDEL411 PC 5.2, TAEDES411 PC 3.3, TAEASS412 PC 6.2, TAEDEL405 Element 5. Individual questions are mapped to elements and to Outcome Standards 1.1, 1.2, 1.3, 1.4, 1.8 and 2.4 in `config.js`.

The form alone only evidences *seeking* feedback. The analysis and actions section of the report is what evidences analysing it and improving practice, so it needs to be written in your own words.

## Points to check

- **Timing.** Program A was delivered on 19 January 2026 and Program B on 10 April 2026. Feedback collected now will be dated months later, and the PDF shows the real collection dates. Say in your analysis that this is a post-program evaluation, and collect at the end of the session in future deliveries.
- **Organisational procedures.** The units say feedback is sought "according to organisational procedures". Check whether Phoenix Academy or EIM requires its own learner feedback template; if so, mirror its questions in `config.js`.
- **Unit references.** Confirm the PC numbers against the current training.gov.au releases before submission. TAEDEL405 and TAEDES411 references assume those units are in your enrolment.
- **Admin key.** Treat it like a password. To change it, edit `ADMIN_KEY` in Script properties.
- **Changing questions or units.** Edit `config.js`, and keep the `QIDS` and `PROGRAMS` lists in `Code.gs` in step if you add or remove questions. Redeploy Apps Script (Manage deployments › Edit › New version) after any change to `Code.gs`.

## Adding another unit

1. In `config.js`, copy a block under `programs`, change the key to the unit code, and set `title`, `mode`, `delivered` and `cohort`. Optionally add `photos` (files in `img/`, about 1280 px wide, each with a short caption) for the carousel at the top of the form. `label`, `tae` and the `map` entries are optional (TAE evidence only).
2. In the Apps Script editor, add the code to `PROGRAMS`, save, then Deploy › Manage deployments › Edit › Version: New version › Deploy. The web app URL stays the same.
3. Commit `config.js`. The new link is `https://tadosolutions.github.io/UEE-feedback/?unit=<CODE>`.

## Possible next steps

- QR code per program printed on the final session slide.
- A third program, by adding its unit code as a new entry in `programs` in `config.js` and to `PROGRAMS` in `Code.gs`.
- Session-level feedback (one short form per session) if you want evidence across each of the three Program B sessions.
