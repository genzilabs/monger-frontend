<script lang="ts">
	type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';

	interface Props {
		variant?: BadgeVariant;
		children?: import('svelte').Snippet;
	}

	let { variant = 'default', children }: Props = $props();

	const variants: Record<BadgeVariant, string> = {
		default: 'bg-surface text-foreground border border-border',
		primary: 'bg-primary/10 text-primary border border-primary/20',
		success: 'bg-success/10 text-success border border-success/20',
		warning: 'bg-warning/10 text-warning border border-warning/20',
		error: 'bg-error/10 text-error border border-error/20',
		outline: 'bg-transparent border border-border text-muted-foreground'
	};
</script>

<span class="inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-medium {variants[variant]}">
	{@render children?.()}
</span>
