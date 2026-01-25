<script lang="ts">
  import { ResponsiveModal, Button } from "$lib/components/ui";
  import { BellIcon, CheckIcon } from "$lib/icons";
  import { notificationsStore } from "$lib/stores/notifications.svelte";
  import { collaborationApi } from "$lib/api";
  import { toastStore } from "$lib/stores";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import type { Notification } from "$lib/types/notification";

  let { open = $bindable(false), onClose } = $props<{
    open: boolean;
    onClose: () => void;
  }>();

  let processingId = $state<string | null>(null);

  onMount(() => {
    if (open) {
      notificationsStore.load();
      notificationsStore.loadUnreadCount();
    }
  });

  $effect(() => {
    if (open) {
      notificationsStore.load();
    }
  });

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    }).format(date);
  }

  function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }

  function handleClick(notif: Notification) {
    notificationsStore.markAsRead(notif.id);
    
    // Navigate based on type
    if (notif.type === 'activity') {
        const bookId = notif.data?.book_id;
        if (bookId) {
            goto(`/books/${bookId}/transactions`);
            onClose();
        }
    } else if (notif.type === 'invitation') {
        goto('/invitations');
        onClose();
    } else if (notif.type === 'p2p_request') {
        // Navigate to transfers page
        goto('/transfers');
        onClose();
    }
  }

  async function handleAcceptInvitation(notif: Notification) {
    if (!notif.data?.invitation_id) return;
    processingId = notif.id;
    try {
      const result = await collaborationApi.acceptInvitation(notif.data.invitation_id);
      if (result.error) {
        toastStore.error(result.error.error || 'Gagal menerima undangan');
      } else {
        toastStore.success('Undangan diterima!');
        notificationsStore.markAsRead(notif.id);
        // Remove from list
        notificationsStore.load();
      }
    } catch (e) {
      toastStore.error('Gagal menerima undangan');
    } finally {
      processingId = null;
    }
  }

  async function handleRejectInvitation(notif: Notification) {
    if (!notif.data?.invitation_id) return;
    processingId = notif.id;
    try {
      const result = await collaborationApi.rejectInvitation(notif.data.invitation_id);
      if (result.error) {
        toastStore.error(result.error.error || 'Gagal menolak undangan');
      } else {
        toastStore.success('Undangan ditolak');
        notificationsStore.markAsRead(notif.id);
        notificationsStore.load();
      }
    } catch (e) {
      toastStore.error('Gagal menolak undangan');
    } finally {
      processingId = null;
    }
  }

  function handleAcceptP2P(notif: Notification) {
    // For P2P, we need to select a pocket, so navigate to transfers page
    if (!notif.data?.transfer_id) return;
    notificationsStore.markAsRead(notif.id);
    goto(`/transfers?accept=${notif.data.transfer_id}`);
    onClose();
  }

  async function handleRejectP2P(notif: Notification) {
    if (!notif.data?.transfer_id) return;
    processingId = notif.id;
    try {
      const result = await collaborationApi.rejectP2PTransfer(notif.data.transfer_id);
      if (result.error) {
        toastStore.error(result.error.error || 'Gagal menolak transfer');
      } else {
        toastStore.success('Transfer ditolak');
        notificationsStore.markAsRead(notif.id);
        notificationsStore.load();
      }
    } catch (e) {
      toastStore.error('Gagal menolak transfer');
    } finally {
      processingId = null;
    }
  }

  function getNotificationIcon(type: string): string {
    switch (type) {
      case 'invitation': return '📨';
      case 'p2p_request': return '💸';
      case 'p2p_status': return '✅';
      case 'activity': return '📝';
      default: return '🔔';
    }
  }
</script>

<ResponsiveModal {open} {onClose} title="Notifikasi">
  <div class="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
    {#if notificationsStore.isLoading}
        <div class="flex justify-center py-8">
            <span class="loading loading-spinner text-primary"></span>
        </div>
    {:else if notificationsStore.notifications.length === 0}
        <!-- Empty State -->
        <div class="flex flex-col items-center justify-center py-12 text-center">
            <div
                class="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center mb-4"
            >
                <BellIcon size={32} class="text-muted" />
            </div>
            <h3 class="font-bold text-foreground">Belum ada notifikasi</h3>
            <p class="text-sm text-secondary mt-1 max-w-[200px]">
                Kami akan memberi tahu jika ada hal penting untukmu.
            </p>
        </div>
    {:else}
        <div class="flex justify-end px-2">
            <button 
                class="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                onclick={() => notificationsStore.markAllAsRead()}
            >
                <CheckIcon size={12} /> Tandai semua dibaca
            </button>
        </div>
        <div class="divide-y divide-border">
            {#each notificationsStore.notifications as notif (notif.id)}
                <div 
                    class="py-3 px-2 rounded-md transition-colors {notif.is_read ? 'opacity-60' : ''}"
                >
                    <div class="flex gap-3">
                        <div class="flex-shrink-0 mt-1 text-lg">
                            {getNotificationIcon(notif.type)}
                        </div>
                        <div class="flex-1 space-y-1">
                            <div class="flex items-start justify-between gap-2">
                                <div>
                                    <p class="font-medium text-sm text-foreground">{notif.title}</p>
                                    <p class="text-sm text-secondary">{notif.message}</p>
                                    {#if notif.type === 'p2p_request' && notif.data?.amount}
                                        <p class="text-sm font-semibold text-primary mt-1">
                                            {formatCurrency(parseInt(notif.data.amount))}
                                        </p>
                                    {/if}
                                </div>
                                {#if !notif.is_read}
                                    <div class="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                                {/if}
                            </div>
                            <p class="text-xs text-muted">{formatTime(notif.created_at)}</p>
                            
                            <!-- Action buttons for invitations -->
                            {#if notif.type === 'invitation' && notif.data?.invitation_id && !notif.is_read}
                                <div class="flex gap-2 mt-2">
                                    <Button 
                                        variant="primary" 
                                        size="sm"
                                        loading={processingId === notif.id}
                                        onclick={() => handleAcceptInvitation(notif)}
                                    >
                                        Terima
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        size="sm"
                                        disabled={processingId === notif.id}
                                        onclick={() => handleRejectInvitation(notif)}
                                    >
                                        Tolak
                                    </Button>
                                </div>
                            {:else if notif.type === 'p2p_request' && notif.data?.transfer_id && !notif.is_read}
                                <div class="flex gap-2 mt-2">
                                    <Button 
                                        variant="primary" 
                                        size="sm"
                                        onclick={() => handleAcceptP2P(notif)}
                                    >
                                        Terima
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        size="sm"
                                        loading={processingId === notif.id}
                                        onclick={() => handleRejectP2P(notif)}
                                    >
                                        Tolak
                                    </Button>
                                </div>
                            {:else}
                                <button 
                                    class="text-xs text-primary font-medium hover:underline mt-1"
                                    onclick={() => handleClick(notif)}
                                >
                                    Lihat detail →
                                </button>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <div class="pt-4 border-t border-border mt-4">
      <Button variant="outline" fullWidth onclick={onClose}>Tutup</Button>
    </div>
  </div>
</ResponsiveModal>
