<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { Toast } from '$lib/stores/toast.svelte';
	
	interface Props {
		toast: Toast;
		onRemove: (id: string) => void;
	}

	let { toast, onRemove }: Props = $props();

	function getIcon(type: string) {
		switch (type) {
			case 'success':
				return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
			case 'error':
				return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
			case 'info':
			default:
				return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
		}
	}

	function getColors(type: string) {
		switch (type) {
			case 'success':
				return 'bg-emerald-500 text-white';
			case 'error':
				return 'bg-red-500 text-white';
			case 'info':
			default:
				return 'bg-blue-500 text-white';
		}
	}
</script>

<div
	class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg shadow-black/5 {getColors(toast.type)} min-w-[300px] max-w-md pointer-events-auto"
	in:fly={{ y: 20, duration: 300 }}
	out:fade={{ duration: 200 }}
>
	<div class="flex-shrink-0">
		{@html getIcon(toast.type)}
	</div>
	<p class="text-sm font-medium flex-1">{toast.message}</p>
	<button
		onclick={() => onRemove(toast.id)}
		class="p-1 rounded-lg hover:bg-white/20 transition-colors"
	>
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
		</svg>
	</button>
</div>
