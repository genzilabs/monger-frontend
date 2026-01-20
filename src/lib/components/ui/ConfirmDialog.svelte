<script lang="ts">
  import { ResponsiveModal, Button } from "$lib/components/ui";

  let { 
    open, 
    onOpenChange,
    title, 
    message, 
    confirmLabel = "Confirm", 
    cancelLabel = "Cancel", 
    isDestructive = false, 
    onConfirm, 
    onCancel 
  } = $props<{
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }>();

  function handleConfirm() {
    onConfirm();
    onOpenChange?.(false);
  }

  function handleCancel() {
    onCancel();
    onOpenChange?.(false);
  }
</script>

<ResponsiveModal {open} onClose={handleCancel} {title}>
  <div class="space-y-4 py-2">
    <p class="text-sm text-secondary">
      {message}
    </p>

    <div class="flex justify-end gap-3 pt-2">
      <Button variant="outline" onclick={handleCancel}>
        {cancelLabel}
      </Button>
      <Button 
        variant={isDestructive ? "destructive" : "default"} 
        onclick={handleConfirm}
      >
        {confirmLabel}
      </Button>
    </div>
  </div>
</ResponsiveModal>
