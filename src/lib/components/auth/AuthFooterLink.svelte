<script lang="ts">
	interface Props {
		href: string;
		text: string;
		linkText: string;
	}

	let { href, text, linkText }: Props = $props();
</script>

<div class="mt-6 text-center">
	<p class="text-sm text-muted">
		{text}
		<a {href} class="text-primary font-medium hover:underline">
			{linkText}
		</a>
	</p>
</div>
