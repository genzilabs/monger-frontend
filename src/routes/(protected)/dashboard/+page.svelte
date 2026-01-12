<script lang="ts">
  import { goto } from "$app/navigation";
  import { booksStore, uiStore } from "$lib/stores";
  import {
    UserHeader,
    BalanceHeroCard,
    PocketCard,
    QuickActionButton,
    StatCard,
  } from "$lib/components/dashboard";
  import { CreatePocketModal } from "$lib/components/modals";

  // Modal state
  let showCreatePocketModal = $state(false);

  // Computed values
  function getTotalBalance() {
    return booksStore.pockets.reduce((sum, p) => sum + p.balance_cents, 0);
  }
</script>

<svelte:head>
  <title>Dashboard - Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-5">
  {#if !booksStore.isInitialized || (booksStore.isLoading && booksStore.books.length === 0)}
    <!-- Loading Skeleton -->
    <div class="space-y-4">
      <div class="flex items-center gap-3 animate-pulse">
        <div class="h-10 w-10 rounded-full bg-border"></div>
        <div class="space-y-1">
          <div class="h-3 w-16 bg-border rounded"></div>
          <div class="h-4 w-24 bg-border rounded"></div>
        </div>
      </div>
      <div class="rounded-2xl bg-surface p-6 animate-pulse">
        <div class="h-4 w-24 bg-border rounded mb-2"></div>
        <div class="h-10 w-40 bg-border rounded mb-4"></div>
        <div class="h-16 w-full bg-border rounded"></div>
      </div>
    </div>
  {:else if booksStore.activeBook}
    <!-- User Header -->
    <UserHeader />

    <!-- Balance Hero Card -->
    <BalanceHeroCard
      balance={getTotalBalance()}
      currency={booksStore.activeBook.base_currency}
      bookName={booksStore.activeBook.name}
    />

    <!-- Quick Actions - Mobile Only -->
    <div class="grid grid-cols-4 gap-3 md:hidden">
      <QuickActionButton
        label="Tambah"
        primary
        onclick={() => uiStore.openTransactionModal("expense")}
      >
        {#snippet icon()}
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        {/snippet}
      </QuickActionButton>
      <QuickActionButton
        label="Kantong"
        onclick={() => (showCreatePocketModal = true)}
      >
        {#snippet icon()}
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        {/snippet}
      </QuickActionButton>
      <QuickActionButton
        label="Pemasukan"
        onclick={() => uiStore.openTransactionModal("income")}
      >
        {#snippet icon()}
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 11l5-5m0 0l5 5m-5-5v12"
            />
          </svg>
        {/snippet}
      </QuickActionButton>
      <QuickActionButton label="Lainnya">
        {#snippet icon()}
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        {/snippet}
      </QuickActionButton>
    </div>

    <!-- Bento Grid Stats -->
    <div class="grid grid-cols-2 gap-4">
      <StatCard title="Pengeluaran">
        {#snippet icon()}
          <svg
            class="w-4 h-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
          </svg>
        {/snippet}
        <div class="flex items-center justify-center py-2 relative">
          <svg
            class="rotate-[-90deg]"
            height="80"
            viewBox="0 0 80 80"
            width="80"
          >
            <circle
              cx="40"
              cy="40"
              fill="none"
              r="32"
              stroke="var(--color-border)"
              stroke-width="8"
            ></circle>
            <circle
              cx="40"
              cy="40"
              fill="none"
              r="32"
              stroke="var(--color-primary)"
              stroke-dasharray="140 200"
              stroke-linecap="round"
              stroke-width="8"
            ></circle>
          </svg>
          <div
            class="absolute inset-0 flex items-center justify-center flex-col"
          >
            <span class="text-[10px] text-muted">Total</span>
            <span class="text-sm font-bold text-foreground"
              >{booksStore.pockets.length}</span
            >
          </div>
        </div>
      </StatCard>

      <StatCard title="Ringkasan">
        {#snippet icon()}
          <svg
            class="w-4 h-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        {/snippet}
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-foreground font-medium">Kantong</span>
              <span class="text-muted">{booksStore.pockets.length}</span>
            </div>
            <div class="h-2 w-full bg-border rounded-full overflow-hidden">
              <div class="h-full bg-yellow-500 w-[72%] rounded-full"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-foreground font-medium">Kondisi</span>
              <span class="text-muted">Baik</span>
            </div>
            <div class="h-2 w-full bg-border rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500 w-[85%] rounded-full"></div>
            </div>
          </div>
        </div>
      </StatCard>
    </div>

    <!-- Pockets Carousel -->
    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <h3 class="text-sm font-semibold text-foreground">Kantong Kamu</h3>
        <svg
          class="w-5 h-5 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      <div class="flex overflow-x-auto gap-4 pb-2 no-scrollbar -mx-6 px-6">
        {#if booksStore.pockets.length === 0}
          <button
            onclick={() => (showCreatePocketModal = true)}
            class="min-w-[160px] h-32 bg-surface border border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-muted transition-colors"
          >
            <svg
              class="w-6 h-6 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span class="text-xs text-muted">Tambah Kantong</span>
          </button>
        {:else}
          {#each booksStore.pockets as pocket, i}
            <PocketCard
              {pocket}
              currency={booksStore.activeBook?.base_currency}
              isHighlighted={i === 0}
              onclick={() => goto(`/pockets/${pocket.id}`)}
            />
          {/each}
          <button
            onclick={() => (showCreatePocketModal = true)}
            class="min-w-[120px] h-32 bg-surface border border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-muted transition-colors shrink-0"
          >
            <svg
              class="w-6 h-6 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span class="text-xs text-muted">Tambah</span>
          </button>
        {/if}
      </div>
    </div>
  {:else if booksStore.books.length > 0}
    <div class="text-center py-10">
      <div
        class="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"
      >
        <svg
          class="w-8 h-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-foreground mb-2">Pilih Buku</h2>
      <p class="text-secondary">Ketuk pemilih buku di atas untuk memilih.</p>
    </div>
  {:else}
    <div class="text-center py-10">
      <div
        class="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"
      >
        <svg
          class="w-8 h-8 text-primary"
          fill="none"
          viewBox="0 0 0 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-foreground mb-2">
        Mulai Perjalanan Keuanganmu
      </h2>
      <p class="text-secondary">
        Ketuk pemilih buku untuk membuat buku pertamamu.
      </p>
    </div>
  {/if}
</div>

<!-- Create Pocket Modal -->
<CreatePocketModal
  open={showCreatePocketModal}
  onClose={() => (showCreatePocketModal = false)}
/>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
