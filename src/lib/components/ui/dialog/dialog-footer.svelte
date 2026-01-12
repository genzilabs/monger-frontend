<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<div class={cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4', className)}>
	{@render children()}
</div>
