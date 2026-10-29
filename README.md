# Jessica Desk

A practical, private daily workspace for Jessica, Marketing & Sales Admin at Pukka Indonusa. Built with React, TypeScript, Vite, Tailwind CSS, Lucide, and Zod. No backend, account, database, API keys, or paid AI service.

## Run locally

Use Node.js **22.12+** (Node 24 also works) and npm.

```sh
npm ci
npm run dev
```

Open the address printed by Vite. No environment variables are required. Development tasks can use the existing checkout; an additional worktree is unnecessary.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

`dist/` is the production output. The production build is a static site.

## Your everyday workflow

- **Overview:** today’s task progress, overdue tasks, upcoming content, due lead follow-ups, and shortcuts. The initial workspace is empty. Choose **Explore demo** to add explicitly labeled fictional examples, or add your own work.
- **Content planner:** switch between month calendar and list, click a calendar date or **New content**, and save titles, products, platform, pillar, status, notes, and asset requirements. Tuesday, Thursday, and Friday are highlighted as the regular content rhythm; any date can be scheduled. Search and pillar/status filters apply to both views. The list spans all dates; the calendar shows its displayed month. Dates have no time-of-day component.
- **Caption studio:** pick product education, installation, machine testing, delivery, or customer solution. Fill product, angle, benefits, and CTA; generate local template drafts. Indonesian and English introductions and closing text differ. Shared inputs are inserted verbatim, **not automatically translated**. Edit both languages, verify product claims, copy either/both, and explicitly **Save draft**. Reopen a saved draft to update it. Unsaved edits are not retained when leaving the page. Regeneration asks before replacing edits.
- **Lead helper:** enter customer/company, product, stage, optional follow-up date, and optional phone number. Use the stage template or edit the Indonesian message. **Copy message** copies it. **Open WhatsApp** requires a phone and opens `wa.me` with a draft; you review and send it yourself. No official Meta/WhatsApp integration, automatic messaging, contact syncing, delivery tracking, or automatic status changes. Opening WhatsApp does not save the lead. Use international numbers with country code; Indonesian numbers beginning `0` are normalized to `62`.
- **Daily tasks:** create, edit, complete, reopen, or delete dated tasks with priorities. Today includes overdue unfinished tasks; Upcoming includes future unfinished tasks; Completed includes all finished tasks.
- **Settings & backup:** export/import JSON, add/remove fictional demos, or clear all data after confirmation. Demo leads have no phone numbers. Editing a demo keeps its demo label; create a new record for real work.

All destructive actions require confirmation. Text is trimmed and control characters removed; React renders text as text and never as raw HTML. WhatsApp URLs use a fixed HTTPS host and encoded messages. No third-party fonts, analytics, or remote media are loaded. Clipboard access requires a secure context (HTTPS or localhost); failures are reported so you can copy manually.

## Data and backup limitations

Data lives in **this browser and origin’s localStorage**. It does not sync between devices, browsers, preview deployments, or production domains. Browser data clearing, private browsing, quota limits, or disabled storage can lose or block data. This is a single-user workspace, not a secure customer database. Anyone with access to the browser profile can access records. Store only appropriate business information.

Export backups regularly and before changing browsers/devices or importing. Backups include saved records only, not unsaved editor text. JSON files are **unencrypted** and may contain personal information: keep them private and never commit customer details or backups to Git.

Imports are validated before any change, show record counts, and require confirmation. Import **replaces** all records; it does not merge. The format is `{ version: 1, contents: [], tasks: [], leads: [], captions: [] }`. Maximum file/workspace size is 2 MB; maximum 1,000 records per section. Schemas validate text lengths, real calendar dates, enums, phone format, UUIDs, unique record IDs, and unknown fields. Future schema versions are rejected. Invalid imports leave existing records untouched.

Unreadable existing storage is never silently replaced. Settings can download the original stored text for recovery, then explicitly reset or import a valid backup. Failed storage writes leave existing records intact. Concurrent writes from another tab are rejected; reload to pick up the other tab’s changes. Avoid editing in multiple tabs at once.

## Tests

`npm test` runs the unit suite for backup boundaries, size limits, duplicate IDs, invalid dates, phone normalization, safe WhatsApp URLs, fictional seed data, and bilingual templates.

Browser tests exercise CRUD, persistence after reload, clipboard copy, backup download/import/cancel, corruption protection, desktop/mobile navigation, and page overflow.

```sh
npx playwright install chromium
npm run test:e2e
```

If a compatible Chromium is already installed:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

The Playwright runner starts Vite on port 4173. GitHub Actions runs lint, typecheck, unit tests, production build, and browser tests on pushes and PRs. CI results are separate from locally executed checks.

## Deploy to Vercel

1. Connect this GitHub repository in Vercel and select the **Vite** framework.
2. Build command: `npm run build`. Output directory: `dist`. Install command: `npm ci`.
3. Use Node 22.12+ or 24. No environment secrets are needed.
4. Keep `main` as the production branch. The feature branch/PR should receive a Preview deployment when Vercel is connected. Review its deployment URL and run the QA below before merging.

Navigation uses URL hashes, so static hosting does not need SPA path rewrites. `vercel.json` supplies the build settings and basic security headers. A local build does not prove Vercel deployment. No deployment is claimed until its actual URL is available and checked.

### QA before merge

- Check the empty workspace and explicitly labeled demo records on desktop and mobile.
- Create, edit, filter, and delete content; verify Tuesday/Thursday/Friday highlights and month navigation.
- Generate each caption kind, edit both languages, copy, save, reload, and reopen.
- Add a fictional lead without a phone; confirm Open WhatsApp reports the missing number. Use an authorized test number outside the repository to review an actual WhatsApp draft; do not send without review.
- Complete and reopen a task; verify dates, priorities, filters, and dashboard totals.
- Export a backup, test an invalid import, then restore a valid export and verify persistence.
- Verify keyboard navigation, dialog Escape/cancel, and responsive layouts.

## Architecture

- `src/lib/data.ts`: schemas, serialization, dates, template logic, WhatsApp URL generation, and optional fictional seeds.
- `src/lib/useWorkspace.ts`: storage persistence and recovery protection.
- `src/context.ts`: workspace actions and notifications.
- `src/components/ui.tsx`: shared accessible form fields, dialogs, and empty states.
- `src/pages/`: dashboard, content, captions, leads, tasks, settings.
- `src/styles.css`: responsive visual system with warm neutral surfaces and restrained red accents.
- `src/lib/data.test.ts`, `e2e/`: meaningful logic and browser workflow coverage.

This one-day MVP intentionally focuses on manual planning and local templates. It has no AI generation, analytics, live Meta API, WhatsApp API, or database.
