<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		icon: Snippet;
		label: string;
		onclick?: () => void;
		primary?: boolean;
	}

	let { icon, label, onclick, primary = false }: Props = $props();
</script>

<button class="flex flex-col items-center gap-2 group" {onclick}>
	<div class="h-14 w-14 rounded-2xl flex items-center justify-center group-active:scale-95 transition-transform {primary 
		? 'bg-primary text-white shadow-lg shadow-[var(--color-primary)]/25' 
		: 'bg-surface border border-border text-foreground'}">
		{@render icon()}
	</div>
	<span class="text-[11px] font-medium text-secondary">{label}</span>
</button>
