<script lang="ts">
	import { booksStore } from '$lib/stores/books.svelte';
	import { toastStore } from '$lib/stores/toast.svelte';
	import type { PocketType } from '$lib/types';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
    import DynamicIcon from '$lib/components/ui/DynamicIcon.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let customTypes = $derived(booksStore.pocketTypes.filter(t => !t.is_system));
	let systemTypes = $derived(booksStore.pocketTypes.filter(t => t.is_system));

	let isEditing = $state(false);
	let editingType = $state<PocketType | null>(null);
	let isSlugManuallyEdited = $state(false);
	let formData = $state({
		name: '',
		slug: '',
		icon_slug: 'wallet' // Default icon
	});

	onMount(() => {
		if (booksStore.activeBook) {
			booksStore.loadPocketTypes(booksStore.activeBook.id);
		}
	});

	function handleBack() {
		goto('/account?view=settings');
	}

	function startCreate() {
		isEditing = true;
		editingType = null;
		isSlugManuallyEdited = false;
		formData = { name: '', slug: '', icon_slug: 'wallet' };
	}

	function startEdit(type: PocketType) {
		isEditing = true;
		editingType = type;
		isSlugManuallyEdited = true;
		formData = {
			name: type.name,
			slug: type.slug,
			icon_slug: type.icon_slug
		};
	}

	function cancelEdit() {
		isEditing = false;
		editingType = null;
	}

	async function handleSubmit() {
		if (!formData.name || !formData.slug) {
			toastStore.error('Name and Slug are required');
			return;
		}

        if (!booksStore.activeBook) {
            toastStore.error('No active book selected');
            return;
        }

		if (editingType) {
			await booksStore.updatePocketType(editingType.id, formData);
		} else {
			await booksStore.createPocketType(booksStore.activeBook.id, formData);
		}
		isEditing = false;
	}

	async function handleDelete(id: string) {
		if (confirm('Are you sure you want to delete this pocket type?')) {
			await booksStore.deletePocketType(id);
		}
	}

    // Generate slug from name if not manually edited
    $effect(() => {
        if (!isSlugManuallyEdited && formData.name) {
            formData.slug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        }
    });

    const availableIcons = [
        'wallet', 'bank', 'cash', 'credit-card', 'smartphone', 
        'edit', 'user', 'shield', 'settings', 'home'
    ];
</script>

<div class="min-h-screen bg-gray-50 pb-20">
	<!-- Header -->
	<header class="sticky top-0 z-10 flex items-center bg-white px-4 py-3 shadow-sm">
		<button onclick={handleBack} class="mr-4 text-gray-600">
			<DynamicIcon name="arrow-left" size={24} />
		</button>
		<h1 class="text-lg font-semibold text-gray-900">Custom Wallet Types</h1>
	</header>

	<div class="p-4 space-y-6">
		{#if isEditing}
			<div class="bg-white p-4 rounded-xl shadow-sm space-y-4">
				<h2 class="text-lg font-medium">{editingType ? 'Edit Type' : 'New Type'}</h2>
				
				<Input
					label="Name"
					bind:value={formData.name}
					placeholder="e.g. Crypto, Safe Box"
				/>

				<Input
					label="Slug (Unique Identifier)"
					bind:value={formData.slug}
					placeholder="e.g. crypto"
                    oninput={() => isSlugManuallyEdited = true}
				/>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Icon</label>
                    <div class="flex gap-2 text-2xl flex-wrap">
                         {#each availableIcons as icon}
                            <button 
                                class="p-2 border rounded-lg {formData.icon_slug === icon ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-200'}"
                                onclick={() => formData.icon_slug = icon}
                            >
                                <DynamicIcon name={icon} size={24} />
                            </button>
                         {/each}
                    </div>
                </div>

				<div class="flex gap-3 pt-2">
                    <Button variant="secondary" onclick={cancelEdit} class="flex-1">Cancel</Button>
					<Button variant="primary" onclick={handleSubmit} class="flex-1">Save</Button>
				</div>
			</div>
		{:else}
            <!-- System Types -->
            <section>
                <h3 class="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">System Types</h3>
                <div class="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
                    {#each systemTypes as type}
                        <div class="flex items-center px-4 py-3">
                            <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                                <DynamicIcon name={type.icon_slug} size={20} />
                            </div>
                            <div class="flex-1">
                                <p class="font-medium text-gray-900">{type.name}</p>
                                <p class="text-xs text-gray-500 font-mono">{type.slug}</p>
                            </div>
                            <span class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Default</span>
                        </div>
                    {/each}
                </div>
            </section>

            <!-- Custom Types -->
            <section>
                <div class="flex justify-between items-center mb-3">
                    <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">My Types</h3>
                    <Button size="sm" onclick={startCreate}>+ New Type</Button>
                </div>
                
                {#if customTypes.length === 0}
                    <div class="text-center py-8 text-gray-500 bg-white rounded-xl shadow-sm">
                        <p>No custom types yet.</p>
                        <p class="text-sm opacity-70 mt-1">Create one to organize your wallets better!</p>
                    </div>
                {:else}
                    <div class="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
                        {#each customTypes as type}
                            <div class="flex items-center px-4 py-3">
                                <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mr-3">
                                    <DynamicIcon name={type.icon_slug} size={20} />
                                </div>
                                <div class="flex-1">
                                    <p class="font-medium text-gray-900">{type.name}</p>
                                    <p class="text-xs text-gray-500 font-mono">{type.slug}</p>
                                </div>
                                <div class="flex gap-1">
                                    <button onclick={() => startEdit(type)} class="p-2 text-gray-400 hover:text-blue-600">
                                        <DynamicIcon name="pencil" size={18} />
                                    </button>
                                    <button onclick={() => handleDelete(type.id)} class="p-2 text-gray-400 hover:text-red-600">
                                        <DynamicIcon name="trash" size={18} />
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </section>
		{/if}
	</div>
</div>
