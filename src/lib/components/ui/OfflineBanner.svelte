<script lang="ts">
	import { networkStatus } from '$lib/sync/networkStatus.svelte';
</script>

{#if networkStatus.isOffline}
	<div class="bg-warning/10 border-b border-warning/20 px-4 py-2 text-center">
		<p class="text-xs text-warning font-medium">
			Kamu sedang offline — perubahan akan disinkronkan saat kembali online
		</p>
	</div>
{/if}
