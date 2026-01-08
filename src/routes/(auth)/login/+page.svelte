<script lang="ts">
	import { Button, Input, Card, Divider, SocialButtons, ErrorAlert } from '$lib/components/ui';
	import { AuthHeader, AuthTabs, AuthFooterLink } from '$lib/components/auth';
	import { authApi } from '$lib/api';
	import { authStore } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { isValidEmail, isValidPhone } from '$lib/utils/validation';

	let loginMethod = $state<'password' | 'otp'>('password');
	let identifier = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');

	const loginTabs = [
		{ id: 'password', label: 'Password' },
		{ id: 'otp', label: 'OTP' }
	];

	function validateForm(): boolean {
		if (!identifier.trim()) {
			error = 'Please enter your email or phone';
			return false;
		}
		if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
			error = 'Please enter a valid email or phone number';
			return false;
		}
		if (loginMethod === 'password' && !password) {
			error = 'Please enter your password';
			return false;
		}
		error = '';
		return true;
	}

	async function handlePasswordLogin() {
		if (!validateForm()) return;
		isLoading = true;
		error = '';

		try {
			const result = await authApi.login({ email: identifier.trim(), password });
			if (result.error) {
				error = result.error.error;
				return;
			}
			if (result.data) {
				authStore.setAuth(result.data.user, result.data.access_token, result.data.refresh_token);
				goto('/dashboard');
			}
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	async function handleOTPLogin() {
		if (!validateForm()) return;
		isLoading = true;
		error = '';

		try {
			const result = await authApi.sendOTP(identifier.trim());
			if (result.error) {
				error = result.error.error;
				return;
			}
			const params = new URLSearchParams({
				identifier: identifier.trim(),
				cooldown: String(result.data?.cooldown_seconds || 60)
			});
			goto(`/verify?${params.toString()}`);
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function handleSubmit() {
		loginMethod === 'password' ? handlePasswordLogin() : handleOTPLogin();
	}
</script>

<svelte:head>
	<title>Login - Monger</title>
</svelte:head>

<div class="flex-1 flex flex-col animate-fade-in">
	<AuthHeader title="Welcome Back" description="Sign in to access your Books and Pockets." />

	<AuthTabs tabs={loginTabs} active={loginMethod} onchange={(id) => (loginMethod = id as 'password' | 'otp')} />

	<Card class="space-y-4">
		<Input type="text" label="Email or Phone" placeholder="user@example.com or +62..." bind:value={identifier} autocomplete="email">
			{#snippet icon()}
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			{/snippet}
		</Input>

		{#if loginMethod === 'password'}
			<Input type="password" label="Password" placeholder="Enter your password" bind:value={password} autocomplete="current-password">
				{#snippet icon()}
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
				{/snippet}
			</Input>
			<div class="text-right">
				<a href="/recover" class="text-sm text-primary hover:underline">Forgot password?</a>
			</div>
		{:else}
			<p class="text-sm text-muted text-center py-2">
				We'll send you a 6-digit code to verify your identity.
			</p>
		{/if}

		<ErrorAlert message={error} />

		<Button variant="primary" size="lg" fullWidth loading={isLoading} onclick={handleSubmit}>
			{loginMethod === 'password' ? 'Sign In' : 'Send OTP'}
		</Button>
	</Card>

	<AuthFooterLink href="/register" text="Don't have an account?" linkText="Join Monger" />

	<div class="mt-6 space-y-4">
		<Divider text="OR CONTINUE WITH" />
		<SocialButtons />
	</div>
</div>
