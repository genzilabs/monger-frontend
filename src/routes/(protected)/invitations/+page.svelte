<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { collaborationApi } from '$lib/api';
	import { onMount } from 'svelte';
	import type { Invitation } from '$lib/types';

	let invitations = $state<Invitation[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let processingId = $state<string | null>(null);

	onMount(async () => {
		await loadInvitations();
	});

	async function loadInvitations() {
		isLoading = true;
		error = null;

		const result = await collaborationApi.listInvitations();

		if (result.error) {
			error = (result.error as any).error || 'Failed to load invitations';
		} else if (result.data) {
			invitations = result.data.invitations.filter((inv) => inv.status === 'pending');
		}

		isLoading = false;
	}

	async function handleAccept(invitationId: string) {
		processingId = invitationId;

		const result = await collaborationApi.acceptInvitation(invitationId);

		if (result.error) {
			error = (result.error as any).error || 'Failed to accept invitation';
		} else {
			invitations = invitations.filter((inv) => inv.id !== invitationId);
		}

		processingId = null;
	}

	async function handleReject(invitationId: string) {
		processingId = invitationId;

		const result = await collaborationApi.rejectInvitation(invitationId);

		if (result.error) {
			error = (result.error as any).error || 'Failed to reject invitation';
		} else {
			invitations = invitations.filter((inv) => inv.id !== invitationId);
		}

		processingId = null;
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function getRoleBadgeClasses(role: string) {
		switch (role) {
			case 'admin':
				return 'bg-primary/20 text-primary';
			case 'editor':
				return 'bg-emerald-500/20 text-emerald-400';
			default:
				return 'bg-muted/30 text-muted';
		}
	}
</script>

<svelte:head>
	<title>Invitations - Monger</title>
</svelte:head>

<div class="animate-fade-in">
	<main class="flex-1 flex flex-col gap-6">
		<!-- Header -->
		<div>
			<h1 class="text-2xl font-bold text-foreground">Invitations</h1>
			<p class="text-sm text-muted mt-1">Pending collaboration requests</p>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
				{error}
				<button onclick={() => (error = null)} class="ml-2 underline">Dismiss</button>
			</div>
		{/if}

		<!-- Loading State -->
		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
			</div>

		<!-- Empty State -->
		{:else if invitations.length === 0}
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<div class="w-20 h-20 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
					<svg class="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-foreground">No pending invitations</h3>
				<p class="text-sm text-muted mt-1 max-w-xs">
					When someone invites you to collaborate on a book or pocket, it will appear here.
				</p>
			</div>

		<!-- Invitations List -->
		{:else}
			<div class="flex flex-col gap-3">
				{#each invitations as invitation}
					<div class="p-4 bg-surface rounded-2xl border border-border">
						<div class="flex items-start justify-between gap-4">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 flex-wrap">
									<span class="text-xs uppercase font-semibold tracking-wider text-muted">
										{invitation.type}
									</span>
									<span class="text-xs px-2 py-0.5 rounded-full capitalize {getRoleBadgeClasses(invitation.role)}">
										{invitation.role}
									</span>
								</div>

								<h3 class="font-semibold text-foreground mt-1 truncate">
									{invitation.target_name || 'Unknown'}
								</h3>

								<p class="text-sm text-muted mt-1">
									Invited by <span class="text-secondary">{invitation.inviter_name || invitation.inviter_email || 'Someone'}</span>
								</p>

								{#if invitation.message}
									<p class="text-sm text-muted mt-2 italic">"{invitation.message}"</p>
								{/if}

								<div class="flex items-center gap-3 mt-2 text-xs text-muted">
									<span>Received {formatDate(invitation.created_at)}</span>
									{#if invitation.expires_at}
										<span>• Expires {formatDate(invitation.expires_at)}</span>
									{/if}
								</div>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-2 mt-4">
							<Button
								variant="primary"
								fullWidth
								loading={processingId === invitation.id}
								onclick={() => handleAccept(invitation.id)}
							>
								Accept
							</Button>
							<Button
								variant="secondary"
								fullWidth
								disabled={processingId === invitation.id}
								onclick={() => handleReject(invitation.id)}
							>
								Decline
							</Button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>
