<script lang="ts">
	interface Tab {
		id: string;
		label: string;
	}

	interface Props {
		tabs: Tab[];
		activeTab?: string;
		onchange?: (tabId: string) => void;
	}

	let {
		tabs,
		activeTab = $bindable(tabs[0]?.id || ''),
		onchange
	}: Props = $props();

	function handleTabClick(tabId: string) {
		activeTab = tabId;
		onchange?.(tabId);
	}

	function handleKeyDown(event: KeyboardEvent, tabId: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleTabClick(tabId);
		}
	}
</script>

<div
	class="inline-flex p-1 bg-surface rounded-full border border-border"
	role="tablist"
>
	{#each tabs as tab}
		<button
			role="tab"
			aria-selected={activeTab === tab.id}
			tabindex={activeTab === tab.id ? 0 : -1}
			onclick={() => handleTabClick(tab.id)}
			onkeydown={(e) => handleKeyDown(e, tab.id)}
			class="
				px-6 py-2
				text-sm font-medium
				rounded-full
				transition-all duration-200
				{activeTab === tab.id
					? 'bg-[var(--color-surface-elevated)] text-foreground shadow-sm'
					: 'text-muted hover:text-secondary'}
			"
		>
			{tab.label}
		</button>
	{/each}
</div>
