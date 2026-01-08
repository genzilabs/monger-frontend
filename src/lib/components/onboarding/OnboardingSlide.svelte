<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		titleHighlight?: string;
		description: string;
		badge?: string;
		children: Snippet;
	}

	let { title, titleHighlight, description, badge, children }: Props = $props();
</script>

<div class="animate-fade-in">
	<!-- Illustration -->
	<div class="mb-8">
		{@render children()}
	</div>

	<!-- Text Content -->
	<div class="text-center mt-8">
		{#if badge}
			<p class="text-primary text-xs font-medium uppercase tracking-wider mb-2">{badge}</p>
		{/if}
		<h1 class="text-3xl font-bold mb-4 leading-tight text-foreground">
			{title}
			{#if titleHighlight}
				<span class="text-primary">{titleHighlight}</span>
			{/if}
		</h1>
		<p class="text-gray-400 leading-relaxed max-w-sm mx-auto">
			{description}
		</p>
	</div>
</div>

<style>
	@keyframes fade-in {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-fade-in { animation: fade-in 0.3s ease-out; }
</style>
