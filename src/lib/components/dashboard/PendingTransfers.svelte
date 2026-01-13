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
      sentTransfers = (res.data.sent || []).sort((a: PendingTransfer, b: PendingTransfer) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      receivedTransfers = (res.data.received || []).sort((a: PendingTransfer, b: PendingTransfer) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
    booksStore.pockets.map(p => ({
        value: p.id,
        label: p.name,
        icon: "💰"
    }))
  );
</script>

<div class="space-y-6">
  <!-- Received Transfers -->
  <div class="space-y-3">
    <h3 class="font-semibold text-lg">Received Requests</h3>
    {#if isLoading && receivedTransfers.length === 0}
        <div class="text-sm text-muted">Loading...</div>
    {:else if receivedTransfers.length === 0}
        <div class="text-sm text-muted italic">No pending requests</div>
    {:else}
        {#each receivedTransfers as tx}
            <div class="p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
                <div>
                   <div class="font-medium">{tx.sender_name || tx.sender_email} sent you Rp {(tx.amount_cents / 100).toLocaleString()}</div>
                   <div class="text-xs text-muted mt-1">{tx.description || tx.name}</div>
                   <div class="text-xs text-muted mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
                <div class="flex gap-2">
                    <Button size="sm" variant="destructive" onclick={() => handleReject(tx.id)}>Reject</Button>
                    <Button size="sm" variant="primary" onclick={() => openAcceptModal(tx)}>Accept</Button>
                </div>
            </div>
        {/each}
    {/if}
  </div>

  <!-- Sent Transfers -->
  <div class="space-y-3">
    <h3 class="font-semibold text-lg">Sent Requests</h3>
    {#if isLoading && sentTransfers.length === 0}
        <div class="text-sm text-muted">Loading...</div>
    {:else if sentTransfers.length === 0}
        <div class="text-sm text-muted italic">No sent requests</div>
    {:else}
         {#each sentTransfers as tx}
            <div class="p-4 bg-surface border border-border rounded-xl flex items-center justify-between opacity-80">
                <div>
                   <div class="font-medium">To: {tx.recipient_email || 'Unknown'} - Rp {(tx.amount_cents / 100).toLocaleString()}</div>
                   <div class="text-xs text-muted mt-1">{tx.description || tx.name}</div>
                   <div class="text-xs text-muted mt-0.5">{new Date(tx.created_at).toLocaleDateString()} • {tx.status}</div>
                </div>
                <div>
                    {#if tx.status === 'pending'}
                        <Button size="sm" variant="outline" onclick={() => handleCancel(tx.id)}>Cancel</Button>
                    {/if}
                </div>
            </div>
        {/each}
    {/if}
  </div>
</div>

<ResponsiveModal
  open={showAcceptModal}
  onClose={() => showAcceptModal = false}
  title="Accept Transfer"
>
    <div class="space-y-4">
        <div>
            <div class="text-sm text-muted mb-2">Select a pocket to deposit funds into:</div>
            <Combobox
                label="Pocket"
                options={pocketOptions}
                bind:value={selectedPocketId}
                placeholder="Select Pocket"
            />
        </div>
        <div class="flex gap-3 mt-4">
            <Button variant="secondary" fullWidth onclick={() => showAcceptModal = false}>Cancel</Button>
            <Button variant="primary" fullWidth loading={isAccepting} onclick={handleAccept} disabled={!selectedPocketId}>Confirm</Button>
        </div>
    </div>
</ResponsiveModal>
