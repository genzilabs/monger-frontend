<script lang="ts">
	import { authStore } from "$lib/stores";

	function getGreeting() {
		const hour = new Date().getHours();
		if (hour < 12) return "Selamat pagi";
		if (hour < 15) return "Selamat siang";
		if (hour < 18) return "Selamat sore";
		return "Selamat malam";
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex flex-col">
		<span class="text-sm font-medium text-muted">{getGreeting()},</span>
		<h2 class="text-xl font-bold text-foreground">
			{authStore.user?.name || "Teman"}
		</h2>
	</div>

	<!-- Desktop Only: Profile & Notification -->
	<div class="hidden md:flex items-center gap-4">
		<button
			class="p-2 text-muted hover:text-foreground transition-colors relative"
		>
			<svg
				class="w-6 h-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
				/>
			</svg>
			<span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
			></span>
		</button>
		<div
			class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border"
		>
			{#if authStore.user?.avatar_url}
				<img
					src={authStore.user.avatar_url}
					alt="Profile"
					class="w-full h-full object-cover"
				/>
			{:else}
				<span class="text-lg font-bold text-primary">
					{authStore.user?.name?.[0] || "T"}
				</span>
			{/if}
		</div>
	</div>
</div>
