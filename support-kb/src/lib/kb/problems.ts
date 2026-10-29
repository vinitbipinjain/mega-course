// The problems a merged ticket really holds. causes.ts tells `parser` from `hint` by tenant and channel.
// Neither of those is a one-day move: the desk read those reports (desk-notes.json) and the date had
// moved by one day, not swapped day and month. That is its own problem, not a footnote under `parser`.
import notes from '#lib/data/desk-notes.json';
import { causeOf, type Report, type Tenant } from '#lib/kb/causes';

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

export function problemOf(r: Pick<Report, 'id' | 'channel'>, t: Tenant | undefined): Problem | 'unplaced' {
  if (oneDayMove.has(r.id)) return 'one-day-move';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  taggedAs: Record<string, number>;
  channels: Record<string, number>;
  tenants: string[];
  subjects: string[];
  firstSeen: string;
  lastSeen: string;
};

const tally = (xs: string[]) =>
  xs.reduce<Record<string, number>>((n, x) => ({ ...n, [x]: (n[x] ?? 0) + 1 }), {});

export function groupByProblem(reports: Report[], tenantOf: (r: Report) => Tenant | undefined): ProblemGroup[] {
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of reports) {
    const p = problemOf(r, tenantOf(r));
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  return [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        taggedAs: tally(rs.map((r) => r.meta.intakeTag)),
        channels: tally(rs.map((r) => r.channel)),
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        subjects: [...new Set(rs.map((r) => r.subject))].sort(),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}

// Subjects that turn up under more than one problem: matching on subject (decision 0001) cannot split them.
export function sharedSubjects(groups: ProblemGroup[]): string[] {
  const seen = tally(groups.flatMap((g) => g.subjects));
  return Object.keys(seen).filter((s) => seen[s] > 1).sort();
}
