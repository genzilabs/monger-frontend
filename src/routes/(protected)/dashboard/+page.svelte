<script lang="ts">
  import { goto } from "$app/navigation";
  import { booksStore, uiStore, transactionsStore } from "$lib/stores";
  import {
    UserHeader,
    BalanceHeroCard,
    PocketCard,
    PendingTransfers,
    PendingInvitations,
    RecentTransactions,
  } from "$lib/components/dashboard";
  import { CreatePocketModal } from "$lib/components/modals";

  // Modal state
  let showCreatePocketModal = $state(false);

  // Computed values
  // Fix: Use $derived for reactivity
  let totalBalance = $derived(
    booksStore.pockets.reduce((sum, p) => sum + p.balance_cents, 0),
  );

  // Calculate income/expense from *loaded* transactions (approximate for now)
  let totalIncome = $derived(
    transactionsStore.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount_cents, 0),
  );

  let totalExpense = $derived(
    transactionsStore.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount_cents, 0),
  );
</script>

<svelte:head>
  <title>Dashboard - Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-6">
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
    <!-- 1. User Header (responsive inside) -->
    <UserHeader />

    <!-- 2. Total Net Worth Card -->
    <BalanceHeroCard
      balance={totalBalance}
      currency={booksStore.activeBook.base_currency}
      bookName={booksStore.activeBook.name}
      income={totalIncome}
      expense={totalExpense}
    />

    <!-- 3. Invitations & Transfers -->
    <PendingInvitations />
    <PendingTransfers />

    <!-- 4. Your Pockets -->
    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <h3 class="text-sm font-semibold text-foreground">Kantong Kamu</h3>
        <button class="text-xs text-primary font-medium md:block hidden"
          >Lihat Semua</button
        >
      </div>

      <!-- Mobile: Grid, Desktop: Carousel -->
      <div
        class="grid grid-cols-2 gap-3 md:flex md:overflow-x-auto md:pb-4 md:-mx-6 md:px-6 md:gap-4 md:no-scrollbar"
      >
        {#each booksStore.pockets as pocket, i}
          <PocketCard
            {pocket}
            currency={booksStore.activeBook?.base_currency}
            isHighlighted={false}
            onclick={() => goto(`/pockets/${pocket.id}`)}
          />
        {/each}

        <!-- Add Pocket Button -->
        <button
          onclick={() => (showCreatePocketModal = true)}
          class="min-h-[120px] bg-surface border border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-muted transition-colors md:w-[120px] md:shrink-0 md:h-auto"
        >
          <div
            class="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <span class="text-xs font-medium text-muted">Tambah</span>
        </button>
      </div>
    </div>

    <!-- 5. Recent Transactions -->
    <RecentTransactions />
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
  :global(.no-scrollbar::-webkit-scrollbar) {
    display: none;
  }
  :global(.no-scrollbar) {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
