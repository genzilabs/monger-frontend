<script lang="ts">
	/**
	 * Icon - A wrapper component for SVG icons with consistent sizing
	 */
	type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	
	interface Props {
		size?: IconSize;
		class?: string;
		children: import('svelte').Snippet;
	}

	let { size = 'md', class: className = '', children }: Props = $props();

	const sizeClasses: Record<IconSize, string> = {
		xs: 'w-3 h-3',
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6',
		xl: 'w-8 h-8'
	};
</script>

<span class="inline-flex {sizeClasses[size]} {className}">
	{@render children()}
</span>
