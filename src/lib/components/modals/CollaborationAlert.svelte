<script lang="ts">
  /**
   * CollaborationAlert - Modal shown when user has active collaborations
   * Uses existing modal styles, SVG icons only
   */
  import { browser } from "$app/environment";
  import { Button } from "$lib/components/ui";
  import { BookIcon, XIcon } from "$lib/icons";

  interface Props {
    open: boolean;
    onClose: () => void;
    bookCount?: number;
  }

  let { open, onClose, bookCount = 0 }: Props = $props();

  const STORAGE_KEY = "monger:collab-alert-dismissed";

  function handleClose() {
    // Store dismissal in localStorage
    if (browser) {
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, now);
    }
    onClose();
  }

  /**
   * Check if alert should be shown (not dismissed in last 7 days)
   */
  export function shouldShowAlert(): boolean {
    if (!browser) return false;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) return true;

    const dismissedDate = new Date(dismissed);
    const now = new Date();
    const daysSinceDismissal =
      (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceDismissal > 7;
  }
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    onclick={handleClose}
    role="dialog"
    aria-modal="true"
  >
    <!-- Modal -->
    <div
      class="bg-background rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 fade-in duration-200"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div
          class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
        >
          <BookIcon size={24} class="text-primary" />
        </div>
        <button
          onclick={handleClose}
          class="p-2 -mr-2 -mt-2 text-muted hover:text-foreground rounded-lg hover:bg-surface transition-colors"
          aria-label="Tutup"
        >
          <XIcon size={20} />
        </button>
      </div>

      <!-- Content -->
      <h2 class="text-lg font-bold text-foreground mb-2">
        Kamu punya buku bersama
      </h2>
      <p class="text-secondary text-sm leading-relaxed mb-6">
        {#if bookCount > 1}
          Ada {bookCount} buku yang kamu kelola bersama orang lain. Transaksi di
          buku ini bisa dilihat oleh anggota lain.
        {:else}
          Ada buku yang kamu kelola bersama orang lain. Transaksi di buku ini
          bisa dilihat oleh anggota lain.
        {/if}
      </p>

      <!-- Action -->
      <div class="flex gap-3">
        <Button variant="secondary" fullWidth onclick={handleClose}>
          Mengerti
        </Button>
        <Button
          variant="primary"
          fullWidth
          onclick={() => {
            handleClose();
          }}
        >
          Lihat Buku
        </Button>
      </div>
    </div>
  </div>
{/if}
