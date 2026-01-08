<script lang="ts">
	import { authStore } from '$lib/stores';

	function getGreeting() {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 17) return 'Good afternoon';
		return 'Good evening';
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<div class="relative">
			<div class="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
				<svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			</div>
			<div class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background"></div>
		</div>
		<div>
			<span class="text-xs font-medium text-muted">{getGreeting()},</span>
			<h2 class="text-base font-bold text-foreground">{authStore.user?.name || 'User'}</h2>
		</div>
	</div>
	
	<button class="flex items-center justify-center h-10 w-10 rounded-full bg-surface border border-border hover:bg-border transition-colors relative">
		<svg class="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
		</svg>
		<span class="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-surface"></span>
	</button>
</div>
