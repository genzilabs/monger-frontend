<script lang="ts">
	interface Props {
		variant?: 'default' | 'dark' | 'glass';
		padding?: 'none' | 'sm' | 'md' | 'lg';
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'default',
		padding = 'md',
		class: className = '',
		children
	}: Props = $props();

	const variantClasses = {
		default: 'bg-surface border border-border/50 shadow-card',
		dark: 'bg-dark-surface border border-dark-border shadow-md',
		glass: 'bg-white/80 backdrop-blur-lg border border-white/20 shadow-sm'
	};

	const paddingClasses = {
		none: 'p-0',
		sm: 'p-4',
		md: 'p-card',
		lg: 'p-8'
	};
</script>

<div class="rounded-card transition-all duration-200 {variantClasses[variant]} {paddingClasses[padding]} {className}">
	{@render children?.()}
</div>
