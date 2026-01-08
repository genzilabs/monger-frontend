<script lang="ts">
	/**
	 * IconBox - Icon container with background styling
	 */
	type IconBoxSize = 'sm' | 'md' | 'lg' | 'xl';
	type IconBoxVariant = 'primary' | 'muted' | 'success' | 'error';
	
	interface Props {
		size?: IconBoxSize;
		variant?: IconBoxVariant;
		class?: string;
		children: import('svelte').Snippet;
	}

	let { 
		size = 'md', 
		variant = 'primary',
		class: className = '', 
		children 
	}: Props = $props();

	const sizeClasses: Record<IconBoxSize, string> = {
		sm: 'w-6 h-6 rounded',
		md: 'w-8 h-8 rounded-lg',
		lg: 'w-10 h-10 rounded-xl',
		xl: 'w-16 h-16 rounded-2xl'
	};

	const variantClasses: Record<IconBoxVariant, string> = {
		primary: 'bg-primary/10 text-primary',
		muted: 'bg-[var(--color-dark-surface)] text-gray-400',
		success: 'bg-green-100 text-green-500',
		error: 'bg-red-100 text-red-500'
	};
</script>

<div class="flex-center {sizeClasses[size]} {variantClasses[variant]} {className}">
	{@render children()}
</div>
