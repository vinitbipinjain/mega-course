<script lang="ts">
  import type { Problem } from '#lib/kb/problems';
  import { splitOf, ticketFor } from '#lib/kb/split';

  // One number from the split, for a sentence: reports in a problem, all reports, or how many problems.
  let { ticket, problem, of = 'reports' }: { ticket: number; problem?: Problem; of?: 'reports' | 'problems' | 'tenants' | 'link' } =
    $props();

  const split = $derived(splitOf(ticket));
  const group = $derived(problem ? split.groups.find((g) => g.problem === problem) : undefined);
  const filed = $derived(problem ? ticketFor(problem) : null);
</script>

{#if of === 'link'}{#if filed}<a href={filed.url}>#{filed.number}</a>{:else}<b class="warn">not filed</b>{/if}{:else if of === 'problems'}<b>{split.groups.length}</b>{:else if of === 'tenants'}<b>{group?.tenants.length ?? 0}</b>{:else}<b>{problem ? (group?.reports.length ?? 0) : split.merged.length}</b>{/if}

<style>
  .warn { color: var(--warn); }
</style>
