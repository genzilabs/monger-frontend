<script lang="ts">
	import { syncEngine } from '$lib/sync/engine.svelte';
	import { networkStatus } from '$lib/sync/networkStatus.svelte';

	const statusConfig = {
		idle: { label: 'Tersinkron', icon: '✓', class: 'text-success' },
		syncing: { label: 'Menyinkronkan...', icon: '↻', class: 'text-primary animate-spin' },
		error: { label: 'Gagal sinkron', icon: '!', class: 'text-error' },
		offline: { label: 'Offline', icon: '⊘', class: 'text-muted' }
	} as const;

	let config = $derived(
		networkStatus.isOffline
			? statusConfig.offline
			: statusConfig[syncEngine.status]
	);
</script>

<div class="flex items-center gap-1.5 text-xs">
	<span class="inline-flex items-center justify-center w-4 h-4 rounded-full {config.class}">
		{config.icon}
	</span>
	<span class="text-muted">{config.label}</span>
	{#if syncEngine.pendingCount > 0}
		<span class="bg-warning/10 text-warning text-[10px] px-1.5 py-0.5 rounded-badge font-medium">
			{syncEngine.pendingCount} pending
		</span>
	{/if}
</div>
