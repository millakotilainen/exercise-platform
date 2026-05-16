<script>
    import { onMount } from "svelte";
    import ExerciseForm from "./ExerciseForm.svelte";
    import { useUserState } from "../states/userState.svelte.js";
    const userState = useUserState();

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
    {#if userState.email}
        <ExerciseForm exerciseId={exerciseId} />
    {:else if !userState.loading}
        <p>Login or register to complete exercises.</p>   
    {/if}
{/if}
