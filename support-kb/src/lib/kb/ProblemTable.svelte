<script lang="ts">
  import { PROBLEM_INFO, type Problem } from '#lib/kb/problems';
  import { splitOf, ticketFor } from '#lib/kb/split';

  let { ticket }: { ticket: number } = $props();

  const split = $derived(splitOf(ticket));
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
  const info = (p: Problem | 'unplaced') => (p === 'unplaced' ? null : PROBLEM_INFO[p]);
  const twice = $derived(split.groups.filter((g) => g.problem !== 'one-day-move').reduce((n, g) => n + g.oneDayMoves, 0));
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports merged into #{ticket} ·
  <strong>{split.groups.length}</strong>
  {split.groups.length === 1 ? 'problem' : 'problems'}
  {#if split.rows !== split.merged.length}
    <span class="muted">({split.rows} rows in the export; {split.rows - split.merged.length} came twice and count once)</span>
  {/if}
     {#if twice}
       <br /><span class="muted">Counted the desk's way: a report counts where it is filed. {twice} of them were read as one-day moves and also count under <code>one-day-move</code>.</span>
     {/if}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>what goes wrong</th><th>tenants</th><th>ways in</th><th>intake tagged</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      {@const t = ticketFor(g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td class="n">{g.reports.length}{#if g.oneDayMoves && g.problem !== 'one-day-move'}<span class="muted"> (incl. {g.oneDayMoves} one-day moves)</span>{/if}</td>
        <td>{info(g.problem)?.symptom ?? 'no tenant on file'}</td>
        <td>{g.tenants.length}</td>
        <td class="muted">{list(g.channels)}</td>
        <td class="muted">{list(g.taggedAs)}</td>
        <td class="muted">{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if t}<a href={t.url}>#{t.number}</a>{:else}<span class="warn">not filed</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .n { font-weight: 600; }
  .muted { color: var(--muted); font-size: 0.85em; }
  .warn { color: var(--warn); font-weight: 600; }
</style>
