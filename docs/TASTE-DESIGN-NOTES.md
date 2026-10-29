# Taste Skill v2 — Jessica Desk design pass

Source: [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), licensed MIT.
Reference: `skills/taste-skill/SKILL.md` and `skills/taste-skill/references/app-screens.md`, reviewed October 29, 2026.
The external skill is **not vendored or automatically executed** in this repository.

## Context and decision

Jessica Desk is a **working app screen**, not a marketing landing page. Follow the Taste v2 app-screen rules instead of its public-page hero, imagery, and GSAP rules. Chosen direction: `accent-ladder`, adapted to warm ivory, Pukka Indonusa red, and flat neutral panels.

Question the first screen should answer: **Which task or customer needs attention next?**

Product-specific visual: the Tuesday / Thursday / Friday content rhythm as a three-day schedule with dates and counts computed from the saved Content Planner. Never fabricate performance statistics.

## Implemented

- Replaced the stock illustration/hero with a real work queue and a next-action button. Follow-ups take priority over overdue tasks, then the content planner.
- Replaced coloured icon KPI tiles with measured counts in flat neutral panels. The Pukka accent calls attention only when follow-ups are due.
- Built a brand-specific weekly rhythm that shows the next actual Tuesday, Thursday, and Friday and saved plan counts.
- Replaced the sidebar motivational ornament with an informative posting cadence.
- Normalized panel borders, type hierarchy, action contrast, responsive grids, and reduced visual chrome.
- Preserved the React/TypeScript business logic, localStorage keys and record shapes, backup contracts, and no-API WhatsApp behavior.

## Quality gates

- Lint, typecheck, unit tests, Playwright desktop/tablet/mobile tests, production Vite build, and Vercel Preview checks before merge.
- Manual screenshot inspection at 1440px / 768px / 390px before promoting to production.
- Check that keyboard focus remains visible, content is usable with reduced motion, no invented data is displayed, and no data resets/migrations occur.
- Avoid running arbitrary external skill scripts without inspecting them first. The design guidelines can be applied directly.

## Future Codex use

For an isolated Codex working environment, the upstream installation command is:

```sh
npx skills add Leonxlnx/taste-skill -a codex --skill design-taste-frontend
```

On Windows PowerShell where `npx.ps1` is blocked by execution policy, run `npx.cmd` instead of changing the global execution policy:

```powershell
npx.cmd skills add Leonxlnx/taste-skill -a codex --skill design-taste-frontend
```

The upstream default v2 is experimental; review updates before adopting new behavior. This document records the **applied design decisions**, not an assertion that the CLI installation occurred.
