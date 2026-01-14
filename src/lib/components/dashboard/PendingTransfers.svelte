<script lang="ts">
  import { onMount } from "svelte";
  import { p2pApi } from "$lib/api/p2p";
  import type { PendingTransfer } from "$lib/types/transaction";
  import { Button, Combobox, ResponsiveModal } from "$lib/components/ui";
  import { toastStore, booksStore } from "$lib/stores";

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
        // Sort by date desc
        sentTransfers = (res.data.sent || []).sort(
          (a: PendingTransfer, b: PendingTransfer) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        receivedTransfers = (res.data.received || []).sort(
          (a: PendingTransfer, b: PendingTransfer) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
      toastStore.success("Transfer accepted successfully");
      showAcceptModal = false;
      await refreshData();
    } catch (e) {
      toastStore.error("Failed to accept transfer");
    } finally {
      isAccepting = false;
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Are you sure you want to reject this transfer?")) return;
    try {
      await p2pApi.reject(id);
      toastStore.success("Transfer rejected");
      await refreshData();
    } catch (e) {
      toastStore.error("Failed to reject transfer");
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Are you sure you want to cancel this transfer?")) return;
    try {
      await p2pApi.cancel(id);
      toastStore.success("Transfer cancelled");
      await refreshData();
    } catch (e) {
      toastStore.error("Failed to cancel transfer");
    }
  }

  function openAcceptModal(transfer: PendingTransfer) {
    selectedTransfer = transfer;
    selectedPocketId = "";
    showAcceptModal = true;
  }

  const pocketOptions = $derived(
    booksStore.pockets.map((p) => ({
      value: p.id,
      label: p.name,
      icon: "💰",
    })),
  );
</script>

<div class="space-y-6">
  <!-- Received Requests (Actionable) -->
  {#if receivedTransfers.length > 0}
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <div class="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
        <h3
          class="text-sm font-semibold text-foreground uppercase tracking-wider"
        >
          Permintaan Masuk
        </h3>
      </div>

      <div class="space-y-3">
        {#each receivedTransfers as tx}
          <div
            class="bg-surface rounded-xl border border-border p-4 shadow-sm hover:border-amber-500/50 transition-colors"
          >
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-sm"
                >
                  {(tx.sender_name || tx.sender_email || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div class="font-medium text-foreground">
                    {tx.sender_name || tx.sender_email}
                  </div>
                  <div class="text-xs text-muted">
                    {new Date(tx.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                    })}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-foreground">
                  Rp {(tx.amount_cents / 100).toLocaleString("id-ID")}
                </div>
                <div
                  class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 inline-block mt-1"
                >
                  Menunggu
                </div>
              </div>
            </div>

            {#if tx.description}
              <div
                class="bg-background/50 rounded-lg p-2 text-xs text-secondary mb-3 border border-border/50"
              >
                "{tx.description}"
              </div>
            {/if}

            <div class="grid grid-cols-2 gap-3">
              <Button
                size="sm"
                variant="outline"
                class="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onclick={() => handleReject(tx.id)}>Tolak</Button
              >
              <Button
                size="sm"
                variant="primary"
                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onclick={() => openAcceptModal(tx)}>Terima</Button
              >
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Sent Requests (Status) -->
  {#if sentTransfers.length > 0}
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-semibold text-muted uppercase tracking-wider">
          Permintaan Terkirim
        </h3>
      </div>

      <div class="space-y-2">
        {#each sentTransfers as tx}
          <div
            class="group bg-surface/50 border border-border rounded-xl p-3 flex items-center justify-between hover:bg-surface transition-colors"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center"
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
              <div>
                <div class="text-sm font-medium text-foreground">
                  Ke: {tx.recipient_email}
                </div>
                <div class="text-xs text-muted">
                  Rp {(tx.amount_cents / 100).toLocaleString("id-ID")} • {tx.status}
                </div>
              </div>
            </div>
            {#if tx.status === "pending"}
              <button
                class="text-xs font-medium text-red-500 hover:text-red-600 hover:underline px-2 py-1"
                onclick={() => handleCancel(tx.id)}
              >
                Batalkan
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<ResponsiveModal
  open={showAcceptModal}
  onClose={() => (showAcceptModal = false)}
  title="Accept Transfer"
>
  <div class="space-y-4">
    <div>
      <div class="text-sm text-muted mb-2">
        Select a pocket to deposit funds into:
      </div>
      <Combobox
        label="Pocket"
        options={pocketOptions}
        bind:value={selectedPocketId}
        placeholder="Select Pocket"
      />
    </div>
    <div class="flex gap-3 mt-4">
      <Button
        variant="secondary"
        fullWidth
        onclick={() => (showAcceptModal = false)}>Cancel</Button
      >
      <Button
        variant="primary"
        fullWidth
        loading={isAccepting}
        onclick={handleAccept}
        disabled={!selectedPocketId}>Confirm</Button
      >
    </div>
  </div>
</ResponsiveModal>
