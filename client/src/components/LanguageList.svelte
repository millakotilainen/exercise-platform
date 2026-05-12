<script> 
    import { onMount } from "svelte";
    let languages = $state([]);

    onMount(async () => {
        const res = await fetch("/api/languages");
        languages = await res.json();
    });

</script>

<ul>
  {#each languages as language}
    <li><a href="/languages/{language.id}">{language.name}</a></li>
  {/each}
</ul>