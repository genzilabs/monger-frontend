<script lang="ts">
	/**
	 * Divider - Horizontal divider with optional text
	 */
	interface Props {
		text?: string;
		class?: string;
	}

	let { text, class: className = '' }: Props = $props();
</script>

{#if text}
	<div class="divider {className}">
		<div class="divider-line"></div>
		<span>{text}</span>
		<div class="divider-line"></div>
	</div>
{:else}
	<hr class="divider-line {className}" />
{/if}
