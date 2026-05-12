<script>
    import { onMount } from "svelte";
    import ExerciseForm from "./ExerciseForm.svelte";
    let { exerciseId } = $props();
    let exercise = $state(null);

    onMount(async () => {
        const res = await fetch(`/api/exercises/${exerciseId}`);
        exercise = await res.json();
    });
</script>

{#if exercise}
    <h1>{exercise.title}</h1>
    <p>{exercise.description}</p>
    <ExerciseForm exerciseId={exerciseId} />
{/if}
