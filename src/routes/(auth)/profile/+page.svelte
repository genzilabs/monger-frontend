<script lang="ts">
	import { Button, Input, AvatarUpload, ErrorAlert } from '$lib/components/ui';
	import { authApi } from '$lib/api';
	import { authStore } from '$lib/stores';
	import { goto } from '$app/navigation';

	let name = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let avatarPreview = $state<string | null>(null);

	async function handleSubmit() {
		if (!name.trim()) { error = 'Please enter your display name'; return; }
		if (name.trim().length < 2) { error = 'Name must be at least 2 characters'; return; }

		isLoading = true;
		error = '';

		try {
			const result = await authApi.updateProfile({ name: name.trim() });
			if (result.error) { error = result.error.error; return; }
			if (result.data) authStore.setUser(result.data);
			goto('/dashboard');
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Profile Setup - Monger</title>
</svelte:head>

<div class="flex-1 flex flex-col animate-fade-in">
	<!-- Progress -->
	<div class="flex items-center gap-2 mb-6">
		<div class="w-3 h-3 bg-primary rounded-full"></div>
		<div class="w-3 h-3 bg-primary rounded-full"></div>
		<div class="w-3 h-3 bg-border rounded-full"></div>
	</div>

	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold text-foreground mb-2">Let's get introduced.</h1>
		<p class="text-secondary">Set up your identity for your Books and Pockets.</p>
	</div>

	<!-- Avatar Upload -->
	<div class="bg-surface rounded-2xl p-6 mb-6">
		<AvatarUpload value={avatarPreview} onchange={(url) => (avatarPreview = url)} />
	</div>

	<!-- Name Input -->
	<div class="bg-surface rounded-2xl p-6 mb-6">
		<Input label="DISPLAY NAME" placeholder="e.g. Alex Monger" bind:value={name}>
			{#snippet icon()}
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
				</svg>
			{/snippet}
		</Input>
		<p class="mt-2 text-xs text-muted">This will be visible to your financial partners.</p>
	</div>

	<ErrorAlert message={error} />

	<div class="flex-1"></div>

	<Button variant="primary" size="lg" fullWidth loading={isLoading} onclick={handleSubmit}>
		Continue
		<svg class="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
		</svg>
	</Button>
</div>
