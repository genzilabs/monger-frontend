<script lang="ts">
  import { UPDATES } from "$lib/data/updates";
  import { ChevronLeftIcon } from "$lib/icons";
</script>

<svelte:head>
  <title>Pembaruan Aplikasi - Monger</title>
</svelte:head>

<div class="container mx-auto space-y-6 pb-24 md:pb-6">
  <!-- Header -->
  <div>
    <h1 class="text-2xl font-bold text-foreground">Pembaruan</h1>
    <p class="text-secondary text-sm">Riwayat perubahan aplikasi.</p>
  </div>

  <!-- Updates List -->
  <div class="space-y-4">
    {#each UPDATES as update, index}
      <div class="bg-surface rounded-2xl border border-border p-5">
        <!-- Version & Date -->
        <div class="flex items-center justify-between mb-3">
          <span
            class="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full"
          >
            {update.version}
          </span>
          <span class="text-xs text-muted">{update.date}</span>
        </div>

        <!-- Title & Description -->
        <h3 class="font-semibold text-foreground mb-2">{update.title}</h3>
        <p class="text-sm text-secondary mb-4 leading-relaxed">
          {update.description}
        </p>

        <!-- Changes -->
        {#if update.changes.length > 0}
          <ul class="space-y-2 border-t border-border/50 pt-4">
            {#each update.changes as change}
              <li class="flex items-start gap-2 text-sm text-secondary">
                <span class="text-primary mt-1.5 shrink-0">
                  <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                </span>
                <span>{change.text}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}

    {#if UPDATES.length === 0}
      <div class="text-center py-12 text-muted">
        <p>Belum ada pembaruan.</p>
      </div>
    {/if}
  </div>
</div>
