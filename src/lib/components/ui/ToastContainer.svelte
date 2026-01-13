<script lang="ts">
	import { toastStore } from '$lib/stores/toast.svelte';
	import Toast from './Toast.svelte';
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none p-4">
	{#each toastStore.toasts as toast (toast.id)}
		<Toast {toast} onRemove={toastStore.remove} />
	{/each}
</div>
