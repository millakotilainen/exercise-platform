<script>
    import { onMount } from "svelte";
    let { languageId } = $props();
    let exercises = $state([]);

    onMount(async () => {
        const res = await fetch(`/api/languages/${languageId}/exercises`);
        exercises = await res.json();
    });
</script>

<ul>
    {#each exercises as exercise}
        <li><a href="/exercises/{exercise.id}">{exercise.title}</a></li>
    {/each}
</ul>