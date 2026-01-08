<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	onMount(() => {
		if (browser) {
			// Check if user has seen onboarding
			const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
			if (!hasSeenOnboarding) {
				goto('/welcome');
				return;
			}

			// Check if user is authenticated
			const accessToken = localStorage.getItem('monger_access_token');
			if (accessToken) {
				goto('/dashboard');
			} else {
				goto('/auth');
			}
		}
	});
</script>

<div class="min-h-screen flex-center bg-background">
	<div class="animate-pulse text-center">
		<div class="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-xl"></div>
		<p class="text-muted-foreground">Loading...</p>
	</div>
</div>
