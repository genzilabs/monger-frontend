<script lang="ts">
  import { ResponsiveModal, Button } from "$lib/components/ui";
  import { BellIcon, CheckIcon } from "$lib/icons";
  import { notificationsStore } from "$lib/stores/notifications.svelte";
  import { onMount } from "svelte";

  let { open = $bindable(false), onClose } = $props<{
    open: boolean;
    onClose: () => void;
  }>();

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
  import { goto } from "$app/navigation";

  function handleClick(notif: any) {
    notificationsStore.markAsRead(notif.id);
    
    // Navigate based on type
    if (notif.type === 'transaction_created' || notif.type === 'transaction_updated') {
        const bookId = notif.data?.book_id;
        if (bookId) {
            goto(`/books/${bookId}/transactions`);
            onClose();
        }
    } else if (notif.type === 'pocket_invitation' || notif.type === 'book_invitation') {
        // You might want a dedicated invitations page or handle it via a modal
        // For now, maybe just close or go to a relevant page if exists
        // goto('/settings/invitations'); // Example if such page existed
    } else if (notif.type.startsWith('p2p_transfer')) {
        // goto('/transfers');
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
                    class="py-3 px-2 hover:bg-surface-elevated rounded-md transition-colors cursor-pointer {notif.is_read ? 'opacity-60' : ''}"
                    onclick={() => handleClick(notif)}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => e.key === 'Enter' && handleClick(notif)}
                >
                    <div class="flex gap-3">
                        <div class="flex-shrink-0 mt-1">
                            <div class="w-2 h-2 rounded-full {notif.is_read ? 'bg-transparent' : 'bg-primary'}"></div>
                        </div>
                        <div class="flex-1 space-y-1">
                            <p class="font-medium text-sm text-foreground">{notif.title}</p>
                            <p class="text-sm text-secondary">{notif.message}</p>
                            {#if notif.type === 'invitation' && notif.data}
                                <!-- Specific UI for invitation could go here if needed, e.g. Accept/Reject buttons inline -->
                            {/if}
                            <p class="text-xs text-muted">{formatTime(notif.created_at)}</p>
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
