<script lang="ts">
	interface Tab {
		id: string;
		label: string;
	}

	interface Props {
		tabs: Tab[];
		active: string;
		onchange: (id: string) => void;
	}

	let { tabs, active, onchange }: Props = $props();
</script>

<div class="flex gap-2 mb-6">
	{#each tabs as tab}
		<button
			onclick={() => onchange(tab.id)}
			class="flex-1 py-3 px-4 rounded-xl font-medium transition-all
				{active === tab.id 
					? 'bg-primary text-white shadow-md' 
					: 'bg-surface text-secondary hover:bg-border'}"
		>
			{tab.label}
		</button>
	{/each}
</div>
