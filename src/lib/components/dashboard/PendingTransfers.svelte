<script lang="ts">
  import { onMount } from "svelte";
  import { p2pApi } from "$lib/api/p2p";
  import type { PendingTransfer } from "$lib/types";
  import { Button, Combobox, ResponsiveModal } from "$lib/components/ui";
  import { toastStore, booksStore, privacyStore } from "$lib/stores";

  let sentTransfers = $state<PendingTransfer[]>([]);
  let receivedTransfers = $state<PendingTransfer[]>([]);
  let isLoading = $state(false);

  // Accept Modal
  let showAcceptModal = $state(false);
  let selectedTransfer = $state<PendingTransfer | null>(null);
  let selectedPocketId = $state("");
  let isAccepting = $state(false);

  async function loadTransfers() {
    isLoading = true;
    try {
      const res = await p2pApi.list();
      if (res.data) {
        // Filter only pending transfers and sort by date desc
        sentTransfers = (res.data.sent || [])
          .filter((t: PendingTransfer) => t.status === "pending")
          .sort(
            (a: PendingTransfer, b: PendingTransfer) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
        receivedTransfers = (res.data.received || [])
          .filter((t: PendingTransfer) => t.status === "pending")
          .sort(
            (a: PendingTransfer, b: PendingTransfer) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );
      }
    } catch (e) {
      console.error("Failed to load transfers", e);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadTransfers();
  });

  async function refreshData() {
    loadTransfers();
    if (booksStore.activeBook) {
      await booksStore.loadPockets(booksStore.activeBook.id);
    }
  }

  async function handleAccept() {
    if (!selectedTransfer || !selectedPocketId) return;

    isAccepting = true;
    try {
      await p2pApi.accept(selectedTransfer.id, selectedPocketId);
      toastStore.success("Transfer diterima");
      showAcceptModal = false;
      await refreshData();
    } catch (e) {
      toastStore.error("Gagal menerima transfer");
    } finally {
      isAccepting = false;
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Tolak transfer ini?")) return;
    try {
      await p2pApi.reject(id);
      toastStore.success("Transfer ditolak");
      await refreshData();
    } catch (e) {
      toastStore.error("Gagal menolak transfer");
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Batalkan transfer ini?")) return;
    try {
      await p2pApi.cancel(id);
      toastStore.success("Transfer dibatalkan");
      await refreshData();
    } catch (e) {
      toastStore.error("Gagal membatalkan transfer");
    }
  }

  function openAcceptModal(transfer: PendingTransfer) {
    selectedTransfer = transfer;
    selectedPocketId = "";
    showAcceptModal = true;
  }

  function formatAmount(cents: number) {
    if (privacyStore.hideAmounts) return "••••";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  }

  const pocketOptions = $derived(
    booksStore.pockets.map((p) => ({
      value: p.id,
      label: p.name,
    })),
  );
</script>

{#if receivedTransfers.length > 0 || sentTransfers.length > 0}
  <div class="space-y-4">
    <!-- Received Requests (Actionable) -->
    {#if receivedTransfers.length > 0}
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-foreground">Transfer Masuk</h3>

        <div class="space-y-3">
          {#each receivedTransfers as tx}
            <div class="bg-surface rounded-2xl border border-border p-4">
              <div class="flex items-start gap-3">
                <!-- Avatar -->
                <div
                  class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0"
                >
                  {(tx.sender_name || tx.sender_email || "?")[0].toUpperCase()}
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h4 class="font-semibold text-foreground truncate">
                        {tx.sender_name || tx.sender_email}
                      </h4>
                      <p class="text-xs text-muted">
                        {formatDate(tx.created_at)}
                      </p>
                    </div>
                    <div class="text-right shrink-0">
                      <p class="font-semibold text-foreground">
                        {formatAmount(tx.amount_cents)}
                      </p>
                      <span class="text-xs text-muted"> Menunggu </span>
                    </div>
                  </div>

                  {#if tx.description}
                    <p class="text-sm text-secondary mt-2 line-clamp-2">
                      {tx.description}
                    </p>
                  {/if}
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onclick={() => handleReject(tx.id)}
                >
                  Tolak
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  fullWidth
                  onclick={() => openAcceptModal(tx)}
                >
                  Terima
                </Button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Sent Requests (Status) -->
    {#if sentTransfers.length > 0}
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-foreground">Transfer Terkirim</h3>

        <div
          class="bg-surface rounded-2xl border border-border divide-y divide-border"
        >
          {#each sentTransfers as tx}
            <div class="p-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-8 h-8 rounded-lg bg-muted/10 flex items-center justify-center shrink-0"
                >
                  <svg
                    class="w-4 h-4 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-foreground truncate">
                    {tx.recipient_email}
                  </p>
                  <p class="text-xs text-muted">
                    {formatAmount(tx.amount_cents)}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="danger"
                onclick={() => handleCancel(tx.id)}
              >
                Batalkan
              </Button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<ResponsiveModal
  open={showAcceptModal}
  onClose={() => (showAcceptModal = false)}
  title="Terima Transfer"
>
  <div class="space-y-4">
    <div>
      <p class="text-sm text-secondary mb-2">
        Pilih kantong untuk menerima dana:
      </p>
      <Combobox
        label="Kantong"
        options={pocketOptions}
        bind:value={selectedPocketId}
        placeholder="Pilih Kantong"
      />
    </div>
    <div class="flex gap-3 mt-4">
      <Button
        variant="secondary"
        fullWidth
        onclick={() => (showAcceptModal = false)}
      >
        Batal
      </Button>
      <Button
        variant="primary"
        fullWidth
        loading={isAccepting}
        onclick={handleAccept}
        disabled={!selectedPocketId}
      >
        Konfirmasi
      </Button>
    </div>
  </div>
</ResponsiveModal>
