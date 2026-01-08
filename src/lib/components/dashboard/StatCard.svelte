<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		icon?: Snippet;
		children: Snippet;
	}

	let { title, icon, children }: Props = $props();
</script>

<div class="bg-surface rounded-2xl border border-border p-4 flex flex-col h-44">
	<div class="flex justify-between items-start mb-2">
		<span class="text-xs font-semibold text-muted">{title}</span>
		{#if icon}
			{@render icon()}
		{/if}
	</div>
	<div class="flex-1 flex flex-col justify-end">
		{@render children()}
	</div>
</div>
