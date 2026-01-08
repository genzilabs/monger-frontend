<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-screen bg-[#0a0a1a] text-white">
	{@render children()}
</div>
