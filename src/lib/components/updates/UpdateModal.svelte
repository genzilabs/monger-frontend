<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { Button } from "$lib/components/ui";
  import { updatesStore } from "$lib/stores";
  import { UPDATES } from "$lib/data/updates";
</script>

{#if updatesStore.showModal && updatesStore.latestUpdate}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/60 z-200"
    transition:fade={{ duration: 200 }}
    onclick={() => updatesStore.markAsSeen()}
    onkeydown={(e) => e.key === "Escape" && updatesStore.markAsSeen()}
    role="button"
    tabindex="0"
    aria-label="Tutup modal"
  ></div>

  <!-- Modal -->
  <div
    class="fixed inset-x-4 top-1/2 -translate-y-1/2 z-201 max-w-md mx-auto md:inset-x-auto"
    transition:fly={{ y: 50, duration: 300 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="update-modal-title"
  >
    <div
      class="bg-surface rounded-2xl shadow-xl overflow-hidden border border-border"
    >
      <!-- Header -->
      <div class="bg-primary/5 px-6 py-5 border-b border-border/50">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2
              id="update-modal-title"
              class="text-lg font-semibold text-foreground"
            >
              Ada yang baru
            </h2>
            <p class="text-sm text-muted">
              {updatesStore.latestUpdate.version}
            </p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 py-5 max-h-[50vh] overflow-y-auto">
        <h3 class="font-medium text-foreground mb-2">
          {updatesStore.latestUpdate.title}
        </h3>
        <p class="text-sm text-secondary mb-4 leading-relaxed">
          {updatesStore.latestUpdate.description}
        </p>

        {#if updatesStore.latestUpdate.changes.length > 0}
          <div class="space-y-2">
            <p class="text-xs text-muted uppercase tracking-wide">Perubahan</p>
            <ul class="space-y-2">
              {#each updatesStore.latestUpdate.changes as change}
                <li class="flex items-start gap-2 text-sm text-secondary">
                  <span class="text-primary mt-1.5 shrink-0">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                  </span>
                  <span>{change.text}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-border/50 bg-surface-50">
        <Button
          variant="primary"
          size="md"
          fullWidth
          onclick={() => updatesStore.markAsSeen()}
        >
          Saya Mengerti
        </Button>
      </div>
    </div>
  </div>
{/if}
