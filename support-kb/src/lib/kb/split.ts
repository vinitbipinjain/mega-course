import reports from '#lib/data/reports-4471.json';
import tickets from '#lib/data/tickets-4471.json';
import { uniqueById, type Report } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';
import { groupByProblem, type Problem } from '#lib/kb/problems';

// Everything the split page shows comes from here, so its table, counts and links agree.
export function splitOf(ticket: number) {
  const rows = (reports as Report[]).filter((r) => r.mergedInto === ticket);
  const merged = uniqueById(rows);
  return { rows: rows.length, merged, groups: groupByProblem(merged, tenantOf) };
}

// Where each problem is filed now: one GitHub issue per problem.
export function ticketFor(problem: Problem | 'unplaced'): { number: number; url: string } | null {
  const n = (tickets.issues as Record<string, number | undefined>)[problem];
  return n ? { number: n, url: `https://github.com/${tickets.repo}/issues/${n}` } : null;
}
