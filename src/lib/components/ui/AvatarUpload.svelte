<script lang="ts">
	interface Props {
		value: string | null;
		onchange: (dataUrl: string) => void;
	}

	let { value, onchange }: Props = $props();

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				onchange(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	}
</script>

<div class="flex flex-col items-center">
	<label for="avatar-upload" class="relative cursor-pointer group">
		<div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center overflow-hidden">
			{#if value}
				<img src={value} alt="Profile preview" class="w-full h-full object-cover" />
			{:else}
				<svg class="w-10 h-10 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			{/if}
		</div>

		<!-- Camera badge -->
		<div class="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
			<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
		</div>

		<input id="avatar-upload" type="file" accept="image/*" onchange={handleFileSelect} class="sr-only" />
	</label>

	<p class="mt-4 text-sm text-secondary">Profile Photo</p>
	<p class="text-xs text-muted">Tap the camera icon to upload</p>
</div>
