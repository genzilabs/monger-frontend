<script lang="ts">
	type LogoSize = 'sm' | 'md' | 'lg';

	interface Props {
		size?: LogoSize;
		showText?: boolean;
	}

	let {
		size = 'md',
		showText = true
	}: Props = $props();

	const sizes: Record<LogoSize, { icon: string; text: string; gap: string }> = {
		sm: { icon: 'w-8 h-8', text: 'text-lg', gap: 'gap-2' },
		md: { icon: 'w-10 h-10', text: 'text-xl', gap: 'gap-2.5' },
		lg: { icon: 'w-14 h-14', text: 'text-2xl', gap: 'gap-3' }
	};
</script>

<div class="flex items-center {sizes[size].gap}">
	<!-- Logo Icon -->
	<div class="{sizes[size].icon} relative flex items-center justify-center">
		<div class="absolute inset-0 bg-primary rounded-xl opacity-20"></div>
		<svg
			viewBox="0 0 24 24"
			fill="none"
			class="w-6 h-6 text-primary"
			xmlns="http://www.w3.org/2000/svg"
		>
			<!-- Wallet icon -->
			<rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
			<path d="M3 10h18" stroke="currentColor" stroke-width="2"/>
			<circle cx="16" cy="14" r="1.5" fill="currentColor"/>
			<path d="M7 6V5a2 2 0 012-2h6a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
		</svg>
	</div>

	{#if showText}
		<span class="font-bold tracking-tight {sizes[size].text} text-foreground">
			Monger
		</span>
	{/if}
</div>
