<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui';
	import { OnboardingSlide } from '$lib/components/onboarding';

	let currentSlide = $state(0);

	const slides = [
		{ id: 'books', title: 'Everything starts with a Book.', description: "Think of a Book as your main event or project. Inside, you create Pockets to track specific spending and chats. It's your world, organized." },
		{ id: 'social', title: 'Handshakes, not just transactions.', description: 'Collaborate on shared Pockets. Track debts, split bills, and keep your social ledger in perfect harmony.' },
		{ id: 'ai', badge: 'HOW IT WORKS', title: 'Throw anything', titleHighlight: 'at it.', description: 'Paste a text, upload a screenshot, or just speak. Our AI parses the details and files them instantly.' }
	];

	function completeOnboarding() {
		if (browser) localStorage.setItem('hasSeenOnboarding', 'true');
		goto('/auth');
	}

	function nextSlide() {
		currentSlide < slides.length - 1 ? currentSlide++ : completeOnboarding();
	}
</script>

<svelte:head>
	<title>Welcome to Monger</title>
</svelte:head>

<div class="min-h-screen flex flex-col px-6 py-8 relative bg-background">
	<button onclick={completeOnboarding} class="absolute top-6 right-6 text-muted hover:text-foreground transition-colors text-sm font-medium">Skip</button>

	<div class="flex-1 flex flex-col justify-center">
		{#each slides as slide, index}
			{#if index === currentSlide}
				<OnboardingSlide title={slide.title} titleHighlight={slide.titleHighlight} description={slide.description} badge={slide.badge}>
					{#if slide.id === 'books'}
						<!-- Book Illustration -->
						<div class="bg-slate-800 rounded-2xl p-5 max-w-xs mx-auto">
							<div class="flex items-center gap-3 mb-4">
								<div class="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
									<svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
									</svg>
								</div>
								<div>
									<p class="font-semibold text-white">2024 Roadtrip</p>
									<p class="text-xs text-gray-500">BOOK</p>
								</div>
							</div>
							<p class="text-xs text-gray-500 mb-2 uppercase tracking-wide">Pockets Inside</p>
							<div class="grid grid-cols-2 gap-2">
								<div class="bg-slate-900 rounded-lg p-3">
									<div class="w-6 h-6 bg-primary/20 rounded mb-1 flex items-center justify-center">
										<svg class="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
										</svg>
									</div>
									<p class="text-sm font-medium text-white">Gas Money</p>
									<p class="text-xs text-gray-500">$150.00</p>
								</div>
								<div class="bg-slate-900 rounded-lg p-3">
									<div class="w-6 h-6 bg-primary/20 rounded mb-1 flex items-center justify-center">
										<svg class="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
										</svg>
									</div>
									<p class="text-sm font-medium text-white">Snacks</p>
									<p class="text-xs text-gray-500">$45.50</p>
								</div>
							</div>
						</div>
					{:else if slide.id === 'social'}
						<!-- Social Illustration -->
						<div class="flex flex-col items-center gap-4">
							<div class="flex items-center gap-2">
								<div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
									<svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
								<div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
									<svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
									</svg>
								</div>
								<div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
									<svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
							</div>
							<span class="text-xs text-green-400 flex items-center gap-1">
								<span class="w-2 h-2 bg-green-400 rounded-full"></span>
								Shared Pocket Active
							</span>
						</div>
					{:else}
						<!-- AI Illustration -->
						<div class="flex flex-col items-center gap-4">
							<div class="flex items-center gap-3">
								<div class="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center">
									<svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								</div>
								<div class="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center">
									<svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
									</svg>
								</div>
							</div>
							<div class="w-10 h-10 bg-background border-2 border-primary rounded-full flex items-center justify-center">
								<svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
								</svg>
							</div>
						</div>
					{/if}
				</OnboardingSlide>
			{/if}
		{/each}
	</div>

	<!-- Progress Dots -->
	<div class="flex justify-center gap-2 mb-6">
		{#each slides as _, index}
			<button onclick={() => (currentSlide = index)} class="w-2 h-2 rounded-full transition-colors {index === currentSlide ? 'bg-primary' : 'bg-gray-600'}" aria-label="Go to slide {index + 1}"></button>
		{/each}
	</div>

	<Button variant="primary" size="lg" fullWidth onclick={nextSlide}>
		{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
		<svg class="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
		</svg>
	</Button>
</div>
