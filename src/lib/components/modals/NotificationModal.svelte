<script lang="ts">
  import { ResponsiveModal, Button } from "$lib/components/ui";
  import { BellIcon, XIcon } from "$lib/icons";

  let { open = $bindable(false), onClose } = $props<{
    open: boolean;
    onClose: () => void;
  }>();
</script>

<ResponsiveModal {open} {onClose} title="Notifikasi">
  <div class="space-y-6 py-4">
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

    <div class="pt-4">
      <Button variant="outline" fullWidth onclick={onClose}>Tutup</Button>
    </div>
  </div>
</ResponsiveModal>
