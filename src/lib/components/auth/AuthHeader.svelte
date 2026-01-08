<script lang="ts">
	import { Logo, IconBox } from '$lib/components/ui';

	interface Props {
		title: string;
		description: string;
	}

	let { title, description }: Props = $props();
</script>

<div class="bg-surface rounded-2xl border border-border p-6 mb-6">
	<div class="flex justify-center mb-4">
		<IconBox size="xl">
			<Logo size="md" showText={false} />
		</IconBox>
	</div>

	<h1 class="text-2xl font-bold text-center text-foreground mb-2">
		{title}
	</h1>

	<p class="text-center text-secondary">
		{description}
	</p>
</div>
