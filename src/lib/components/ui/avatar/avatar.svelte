<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { avatarVariants, type AvatarSize } from './avatar.variants';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		/** Image source URL */
		src?: string | null;
		/** Alt text for image */
		alt?: string;
		/** Fallback text (usually initials) */
		fallback?: string;
		/** Avatar size */
		size?: AvatarSize;
		class?: string;
	}

	let {
		src,
		alt = 'Avatar',
		fallback = '?',
		size = 'default',
		class: className,
		...restProps
	}: Props = $props();

	let hasError = $state(false);

	function handleError() {
		hasError = true;
	}

	/**
	 * Get initials from a name string.
	 */
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((part) => part.charAt(0))
			.slice(0, 2)
			.join('')
			.toUpperCase();
	}

	const displayFallback = $derived(
		fallback.length <= 2 ? fallback.toUpperCase() : getInitials(fallback)
	);
</script>

<span class={cn(avatarVariants({ size }), className)} {...restProps}>
	{#if src && !hasError}
		<img
			{src}
			{alt}
			onerror={handleError}
			class="aspect-square h-full w-full object-cover"
		/>
	{:else}
		<span
			class="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-medium"
		>
			{displayFallback}
		</span>
	{/if}
</span>
