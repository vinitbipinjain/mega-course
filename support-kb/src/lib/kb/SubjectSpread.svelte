<script lang="ts">
  import { sharedSubjects } from '#lib/kb/problems';
  import { splitOf } from '#lib/kb/split';

  // Subject line × problem: what decision 0001 merges on, next to what actually went wrong.
  let { ticket }: { ticket: number } = $props();

  const split = $derived(splitOf(ticket));
  const shared = $derived(sharedSubjects(split.groups));
  const subjects = $derived([...new Set(split.merged.map((r) => r.subject))].sort());
  const count = (subject: string, problem: string) =>
    split.groups.find((g) => g.problem === problem)?.reports.filter((r) => r.subject === subject).length ?? 0;
</script>

<p><b>{shared.length}</b> of {subjects.length} subject lines turn up under more than one problem.</p>

<table>
  <thead>
    <tr><th>subject</th>{#each split.groups as g (g.problem)}<th><code>{g.problem}</code></th>{/each}</tr>
  </thead>
  <tbody>
    {#each subjects as s (s)}
      <tr class:shared={shared.includes(s)}>
        <td>{s}</td>
        {#each split.groups as g (g.problem)}<td>{count(s, g.problem) || ''}</td>{/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .shared td:first-child { color: var(--warn); }
</style>
