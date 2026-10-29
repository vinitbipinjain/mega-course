# mega-course

This repo is used to solve challenges from the MEGA.dev course.

## S01E03 · what it shows

The support desk merged 412 date reports into ticket #4471 and marked it "known: one issue". It holds
three problems. Each problem has its own issue in this repo, with the number of reports it covers.
Counts follow the desk's own view (CauseTable): a report counts where it is filed, so the 5 one-day moves
also count under `parser`.

| problem | reports | what goes wrong |
|---|---|---|
| `parser` | 379 | the shared parser reads day-first dates month first: day and month swap |
| `hint` | 33 | the booking-v3 form hint says `MM/DD/YYYY`, but the form reads the date day first |
| `one-day-move` | 5 | dates move by one day (time zones), not a swap |

- [`support-kb/`](support-kb/) is the desk's kb export, plus a minimal SvelteKit + mdsvex build so it renders.
- The page I added: [`support-kb/src/routes/kb/incidents/4471/problems/+page.svx`](support-kb/src/routes/kb/incidents/4471/problems/+page.svx).
  It uses new logic and components in `support-kb/src/lib/kb/`: `problems.ts`, `split.ts`, `ProblemTable.svelte`, `ProblemCount.svelte`, and `SubjectSpread.svelte`. It also uses `support-kb/src/lib/data/tickets-4471.json`, which maps each problem to its issue.
- The page as the desk sees it: [`rendered/kb-incidents-4471-problems.html`](rendered/kb-incidents-4471-problems.html)
  (standalone HTML) and [`rendered/kb-incidents-4471-problems.png`](rendered/kb-incidents-4471-problems.png).

Build it yourself:

```sh
cd support-kb
npm install
npm run build   # prerendered site in support-kb/build; the page is build/kb/incidents/4471/problems.html
```
