<script lang="ts">
	import { Button, Logo, Card, Divider, SocialButtons } from '$lib/components/ui';
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Join Monger - Financial Zen</title>
</svelte:head>

<div class="flex-1 flex flex-col animate-fade-in">
	<!-- Hero Section -->
	<div class="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
		<!-- <div class="mb-8">
			<Logo size="lg" />
		</div> -->

		<!-- Chart Bars Illustration -->
		<div class="relative mb-8">
			<div class="w-48 h-64 relative">
				<div class="absolute bottom-0 left-0 w-8 h-32 bg-gradient-to-t from-primary/30 to-primary rounded-t-lg"></div>
				<div class="absolute bottom-0 left-12 w-8 h-48 bg-gradient-to-t from-purple-400/30 to-purple-400 rounded-t-lg"></div>
				<div class="absolute bottom-0 left-24 w-8 h-56 bg-gradient-to-t from-pink-400/30 to-pink-400 rounded-t-lg"></div>
				<div class="absolute bottom-0 right-0 w-8 h-40 bg-gradient-to-t from-primary/20 to-primary/60 rounded-t-lg"></div>
			</div>
		</div>

		<h1 class="text-3xl font-bold text-foreground mb-4 leading-tight">
			Master Your<br />
			<span class="text-gradient">Assets.</span>
		</h1>

		<p class="text-secondary max-w-sm mb-8">
			Organize your life into Books and Pockets with Monger.
		</p>
	</div>

	<!-- CTAs -->
	<div class="space-y-3 mb-6">
		<Button
			variant="primary"
			size="lg"
			fullWidth
			onclick={() => goto('/register')}
		>
			{#snippet icon()}
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			{/snippet}
			Join Monger
		</Button>

		<Button
			variant="secondary"
			size="lg"
			fullWidth
			onclick={() => goto('/login')}
		>
			I have an account
		</Button>
	</div>

	<!-- Social Login -->
	<div class="space-y-4">
		<Divider text="or continue with" />
		<SocialButtons />
	</div>

	<p class="text-center text-xs text-muted mt-6">
		By joining, you agree to our
		<a href="/terms" class="text-primary hover:underline">Terms of Service</a>
		&
		<a href="/privacy" class="text-primary hover:underline">Privacy Policy</a>.
	</p>
</div>
