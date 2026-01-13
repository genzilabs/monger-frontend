<script lang="ts">
	import { Button, ResponsiveModal } from '$lib/components/ui';
	import { collaborationApi } from '$lib/api';
	import type { CollaborationRole } from '$lib/types';

	interface Props {
		open: boolean;
		onClose: () => void;
		bookId: string;
	}

	let { open, onClose, bookId }: Props = $props();

	let email = $state('');
	let role = $state<CollaborationRole>('editor');
	let message = $state('');
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	const roles: { value: CollaborationRole; label: string; desc: string }[] = [
		{ value: 'viewer', label: 'Viewer', desc: 'Can view transactions only' },
		{ value: 'editor', label: 'Editor', desc: 'Can add, edit, delete transactions' },
		{ value: 'admin', label: 'Admin', desc: 'Full access including wallet management' }
	];

	async function handleSubmit() {
		if (!email.trim()) {
			error = 'Email is required';
			return;
		}

		isSubmitting = true;
		error = null;

		const result = await collaborationApi.inviteToBook(bookId, {
			email: email.trim(),
			role,
			message: message.trim() || undefined
		});

		isSubmitting = false;

		if (result.error) {
			error = (result.error as any).error || 'An error occurred';
			return;
		}

		resetForm();
		onClose();
	}

	function resetForm() {
		email = '';
		role = 'editor';
		message = '';
		error = null;
	}

	function handleClose() {
		resetForm();
		onClose();
	}
</script>

<ResponsiveModal {open} onClose={handleClose} title="Invite to Book">
	<div class="flex flex-col gap-4">
		{#if error}
			<div class="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
				{error}
			</div>
		{/if}

		<div>
			<label for="email" class="block text-sm font-medium text-secondary mb-1.5">
				Email Address
			</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				placeholder="collaborator@example.com"
				class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
			/>
		</div>

		<div>
			<label class="block text-sm font-medium text-secondary mb-2">Role</label>
			<div class="flex flex-col gap-2">
				{#each roles as r}
					<button
						type="button"
						onclick={() => (role = r.value)}
						class="flex items-start gap-3 p-3 rounded-xl border transition-colors text-left {role === r.value
							? 'bg-primary/10 border-primary'
							: 'bg-surface border-border hover:border-muted'}"
					>
						<div
							class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 {role === r.value
								? 'border-primary'
								: 'border-muted'}"
						>
							{#if role === r.value}
								<div class="w-2.5 h-2.5 bg-primary rounded-full"></div>
							{/if}
						</div>
						<div>
							<span class="font-medium text-foreground">{r.label}</span>
							<p class="text-xs text-muted mt-0.5">{r.desc}</p>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<div>
			<label for="message" class="block text-sm font-medium text-secondary mb-1.5">
				Message (optional)
			</label>
			<textarea
				id="message"
				bind:value={message}
				placeholder="Add a personal message..."
				rows="2"
				class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
			></textarea>
		</div>
	</div>

	<div class="flex gap-3 mt-6">
		<Button variant="secondary" fullWidth onclick={handleClose}>Cancel</Button>
		<Button variant="primary" fullWidth loading={isSubmitting} onclick={handleSubmit}>
			Send Invite
		</Button>
	</div>
</ResponsiveModal>
