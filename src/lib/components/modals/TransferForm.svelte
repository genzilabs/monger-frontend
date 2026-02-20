<script lang="ts">
  import type { TransactionFormState } from "./transactionForm.svelte";
  import { Combobox, BookSelector } from "$lib/components/ui";
  import { booksStore } from "$lib/stores";

  let { form }: { form: TransactionFormState } = $props();
</script>

<div class="space-y-4">
  <!-- Mode Toggle -->
  <div
    class="flex p-1 bg-surface rounded-full border border-border"
    role="tablist"
  >
    <button
      role="tab"
      aria-selected={!form.isP2P}
      class="flex-1 py-1.5 text-xs font-semibold rounded-full transition-all {!form.isP2P
        ? 'bg-blue-500 text-white shadow-sm'
        : 'text-muted hover:text-foreground'}"
      onclick={() => (form.isP2P = false)}
    >
      Transfer Biasa
    </button>
    <button
      role="tab"
      aria-selected={form.isP2P}
      class="flex-1 py-1.5 text-xs font-semibold rounded-full transition-all {form.isP2P
        ? 'bg-amber-500 text-white shadow-sm'
        : 'text-muted hover:text-foreground'}"
      onclick={() => (form.isP2P = true)}
    >
      Kirim ke Pengguna
    </button>
  </div>

  {#if !form.isP2P}
    <!-- Cross-Book Toggle -->
    <div class="flex items-center justify-between">
      <span class="text-sm text-secondary">Transfer antar buku</span>
      <button
        type="button"
        class="{form.isCrossBook
          ? 'bg-primary'
          : 'bg-border'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        onclick={() => {
          form.isCrossBook = !form.isCrossBook;
          if (!form.isCrossBook && booksStore.activeBook) {
            form.fromBookId = booksStore.activeBook.id;
            form.toBookId = booksStore.activeBook.id;
          }
        }}
      >
        <span
          class="{form.isCrossBook
            ? 'translate-x-6'
            : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        ></span>
      </button>
    </div>
  {/if}

  <div class="grid grid-cols-1 gap-4">
    <!-- From Section -->
    <div class="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
      <span class="text-xs font-semibold text-primary uppercase tracking-wide"
        >Dari</span
      >
      {#if form.isCrossBook}
        <BookSelector bind:value={form.fromBookId} label="Buku Asal" />
      {/if}
      <Combobox
        label="Kantong Pengirim"
        options={form.fromBookPockets.map((p) => ({
          value: p.id,
          label: p.name,
        }))}
        bind:value={form.pocketId}
        placeholder="Pilih kantong asal"
        searchPlaceholder="Cari..."
        emptyMessage="Belum ada kantong"
      />
    </div>

    <!-- Swap Button (Only for Internal) -->
    {#if !form.isP2P}
      <div class="flex justify-center -my-2 relative z-10">
        <button
          type="button"
          class="w-8 h-8 rounded-full bg-white border border-border shadow-sm flex items-center justify-center text-primary hover:bg-surface transition-colors"
          onclick={() => {
            if (form.isCrossBook) {
              const tempBook = form.fromBookId;
              form.fromBookId = form.toBookId;
              form.toBookId = tempBook;
            }
            const temp = form.pocketId;
            form.pocketId = form.toPocketId;
            form.toPocketId = temp;
          }}
          aria-label="Tukar Posisi Pockets"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </button>
      </div>
    {/if}

    <!-- To Section -->
    <div
      class="space-y-3 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20"
    >
      <span
        class="text-xs font-semibold text-emerald-600 uppercase tracking-wide"
        >Ke</span
      >
      {#if form.isP2P}
        <div>
          <label
            for="recipient"
            class="block text-sm font-medium text-emerald-800 mb-1.5"
            >Email Penerima</label
          >
          <input
            id="recipient"
            type="email"
            bind:value={form.recipientEmail}
            placeholder="nama@email.com"
            class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      {:else}
        {#if form.isCrossBook}
          <BookSelector bind:value={form.toBookId} label="Buku Tujuan" />
        {/if}
        <Combobox
          label="Kantong Penerima"
          options={form.toBookPockets
            .map((p) => ({
              value: p.id,
              label: p.name,
            }))
            .filter((p) => p.value !== form.pocketId)}
          bind:value={form.toPocketId}
          placeholder="Pilih kantong tujuan"
          searchPlaceholder="Cari..."
          emptyMessage="Belum ada kantong"
        />
      {/if}
    </div>
  </div>
</div>
