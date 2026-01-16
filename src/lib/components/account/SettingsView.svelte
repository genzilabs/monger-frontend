<script lang="ts">
  import { Card } from "$lib/components/ui";
</script>

<div class="space-y-6 animate-fade-in">
  <div class="flex items-center gap-3">
    <h2 class="text-xl font-bold text-foreground">Pengaturan</h2>
  </div>

  <Card class="divide-y divide-border">
    <div class="p-4 flex items-center justify-between">
      <div>
        <p class="font-medium text-foreground">Bahasa</p>
        <p class="text-xs text-secondary">Bahasa Indonesia (Default)</p>
      </div>
      <div
        class="px-3 py-1 bg-surface-elevated rounded text-xs font-mono text-muted"
      >
        ID
      </div>
    </div>
    <div class="p-4 flex items-center justify-between">
      <div>
        <p class="font-medium text-foreground">Mata Uang</p>
        <p class="text-xs text-secondary">Rupiah Indonesia</p>
      </div>
      <div
        class="px-3 py-1 bg-surface-elevated rounded text-xs font-mono text-muted"
      >
        IDR
      </div>
    </div>
  </Card>
</div>
