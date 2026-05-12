<script>
    let { exerciseId } = $props();
    let text = $state('');
    let gradingStatus = $state(null);
    let grade = $state(null);

    async function handleSubmit() {
        const res = await fetch(`/api/exercises/${exerciseId}/submissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source_code: text }),
        });
        const { id } = await res.json();

        const interval = setInterval(async () => {
            const statusRes = await fetch(`/api/submissions/${id}/status`);
            const data = await statusRes.json();
            gradingStatus = data.grading_status;
            grade = data.grade;
            if (data.grading_status === "graded") {
                clearInterval(interval);
            }
        }, 500);
    }
</script>

<textarea id="answer" bind:value={text}></textarea>

<button onclick={handleSubmit}>Submit</button>

{#if gradingStatus}
    <p>Grading status: {gradingStatus}</p>
    <p>Grade: {grade}</p>
{/if}
