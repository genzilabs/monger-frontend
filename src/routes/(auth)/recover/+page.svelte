<script lang="ts">
	import { Button, Input, ProgressSteps, Card, IconBox } from '$lib/components/ui';
	import { authApi } from '$lib/api';
	import { goto } from '$app/navigation';
	import { isValidIdentifier } from '$lib/utils/validation';

	let identifier = $state('');
	let isLoading = $state(false);
	let error = $state('');

	async function handleSubmit() {
		if (!identifier.trim()) {
			error = 'Please enter your email or phone number';
			return;
		}

		if (!isValidIdentifier(identifier)) {
			error = 'Please enter a valid email or phone number';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const result = await authApi.sendOTP(identifier);

			if (result.error) {
				error = result.error.error;
				return;
			}

			const params = new URLSearchParams({
				identifier,
				cooldown: String(result.data?.cooldown_seconds || 60),
				recover: 'true'
			});

			goto(`/verify?${params.toString()}`);
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Recover Account - Monger</title>
</svelte:head>

<div class="flex-1 flex flex-col animate-fade-in">
	<!-- Progress Steps -->
	<div class="mb-6">
		<ProgressSteps currentStep={1} totalSteps={3} label="IDENTITY" />
	</div>

	<!-- Header Card -->
	<Card class="mb-6">
		<div class="flex items-center gap-3 mb-4">
			<IconBox size="lg">
				<svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
				</svg>
			</IconBox>
		</div>

		<h1 class="text-2xl font-bold text-slate-900 mb-2">
			Let's get you back in.
		</h1>

		<p class="text-slate-500">
			Enter the email or phone number associated with your Monger Pocket to receive a recovery link.
		</p>
	</Card>

	<!-- Input Card -->
	<Card class="mb-6">
		<Input
			type="text"
			placeholder="Email or Phone Number"
			bind:value={identifier}
			{error}
		>
			{#snippet icon()}
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
			{/snippet}
		</Input>
	</Card>

	<div class="flex-1"></div>

	<Button
		variant="primary"
		size="lg"
		fullWidth
		loading={isLoading}
		onclick={handleSubmit}
	>
		Send Instructions
		<svg class="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
		</svg>
	</Button>

	<button class="mt-4 flex-center gap-2 py-3 text-slate-400 hover:text-slate-500 transition-colors">
		<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<span class="text-sm">Don't have access to this email?</span>
	</button>
</div>
