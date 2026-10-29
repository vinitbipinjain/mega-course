// The problems a merged ticket really holds, counted the way the desk counts (CauseTable):
// a report counts where causes.ts files it, `parser` or `hint`. The desk read some reports differently
// (desk-notes.json): their date moved by one day, not swapped. That is a problem of its own, so it gets
// its own count, but those reports also stay counted where they are filed, as the desk's view does.
import notes from '#lib/data/desk-notes.json';
import { causeOf, groupByCause, readAs, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day-move';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day-move'];

export const PROBLEM_INFO: Record<Problem, { title: string; symptom: string }> = {
  parser: {
    title: 'Shared parser reads day-first dates month first',
    symptom: 'day and month swap',
  },
  hint: {
    title: "booking-v3's date hint asks for month first; the form reads day first",
    symptom: 'day and month swap, booking-v3 form only',
  },
  'one-day-move': {
    title: 'Dates move by one day',
    symptom: 'the date moves one day',
  },
};

const oneDayMove = new Set<string>(notes.oneDayMove);

// Every problem a report counts for: where it is filed, plus `one-day-move` if the desk read it so.
export function problemsOf(r: Pick<Report, 'id' | 'channel'>, t: Tenant | undefined): (Problem | 'unplaced')[] {
  const filed = causeOf(r, t) ?? 'unplaced';
  return oneDayMove.has(r.id) ? [filed, 'one-day-move'] : [filed];
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  // Reports in this group the desk read as a one-day move (counted here and under one-day-move).
  oneDayMoves: number;
  taggedAs: Record<string, number>;
  channels: Record<string, number>;
  tenants: string[];
  subjects: string[];
  firstSeen: string;
  lastSeen: string;
};

const tally = (xs: string[]) =>
  xs.reduce<Record<string, number>>((n, x) => ({ ...n, [x]: (n[x] ?? 0) + 1 }), {});

function groupOf(problem: ProblemGroup['problem'], rs: Report[], oneDayMoves: number): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    oneDayMoves,
    taggedAs: tally(rs.map((r) => r.meta.intakeTag)),
    channels: tally(rs.map((r) => r.channel)),
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    subjects: [...new Set(rs.map((r) => r.subject))].sort(),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function groupByProblem(reports: Report[], tenantOf: (r: Report) => Tenant | undefined): ProblemGroup[] {
  const filed = groupByCause(reports, tenantOf).map((g) => groupOf(g.cause, g.reports, readAs(g, notes.oneDayMove)));
  const moved = reports.filter((r) => oneDayMove.has(r.id));
  return [...filed, ...(moved.length ? [groupOf('one-day-move', moved, moved.length)] : [])];
}

// Subjects that turn up under more than one problem: matching on subject (decision 0001) cannot split them.
export function sharedSubjects(groups: ProblemGroup[]): string[] {
  const seen = tally(groups.flatMap((g) => g.subjects));
  return Object.keys(seen).filter((s) => seen[s] > 1).sort();
}
