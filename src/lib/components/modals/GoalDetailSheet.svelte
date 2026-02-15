<script lang="ts">
  import { ResponsiveModal, Button } from "$lib/components/ui";
  import { goalsStore } from "$lib/stores";
  import { formatCurrency } from "$lib/utils/currency";
  import type { Goal } from "$lib/types/goal";
  import { Target, Trophy, Plus, User } from "lucide-svelte";

  interface Props {
    open: boolean;
    onClose: () => void;
    goal: Goal;
  }

  let { open, onClose, goal }: Props = $props();

  let showContribForm = $state(false);
  let contribAmount = $state("");
  let contribNote = $state("");
  let isSubmitting = $state(false);

  $effect(() => {
    if (open && goal) {
      goalsStore.loadContributions(goal.id);
    }
  });

  function getProgressColor(progress: number): string {
    if (progress >= 100) return "bg-success";
    if (progress >= 75) return "bg-emerald-400";
    if (progress >= 50) return "bg-primary";
    if (progress >= 25) return "bg-amber-400";
    return "bg-red-400";
  }

  async function handleContribute() {
    const amount = parseFloat(contribAmount);
    if (!amount || amount <= 0) return;

    isSubmitting = true;
    const result = await goalsStore.addContribution(goal.id, {
      amount_cents: Math.round(amount * 100),
      note: contribNote.trim() || undefined,
    });
    isSubmitting = false;

    if (result) {
      contribAmount = "";
      contribNote = "";
      showContribForm = false;
    }
  }
</script>

<ResponsiveModal {open} {onClose} title={goal.name}>
  <div class="flex flex-col gap-5">
    <div class="text-center p-6 bg-surface rounded-2xl border border-border">
      <div
        class="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
        style="background-color: {goal.color || '#20a39e'}20; color: {goal.color || '#20a39e'}"
      >
        {#if goal.status === "completed"}
          <Trophy size={32} />
        {:else}
          <Target size={32} />
        {/if}
      </div>

      <p class="text-3xl font-bold text-foreground mb-1">
        {goal.progress.toFixed(0)}%
      </p>
      <p class="text-sm text-muted">
        {formatCurrency(goal.current_cents)} dari {formatCurrency(goal.target_cents)}
      </p>

      <div class="w-full h-3 bg-muted/20 rounded-full overflow-hidden mt-4">
        <div
          class="h-full rounded-full transition-all duration-500 {getProgressColor(goal.progress)}"
          style="width: {Math.min(goal.progress, 100)}%"
        ></div>
      </div>

      {#if goal.deadline}
        <p class="text-xs text-muted mt-3">
          Deadline: {new Date(goal.deadline).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      {/if}
    </div>

    {#if goal.description}
      <div class="text-sm text-muted">{goal.description}</div>
    {/if}

    {#if goal.status === "active" && !goal.pocket_id}
      <div>
        {#if showContribForm}
          <form
            onsubmit={(e) => { e.preventDefault(); handleContribute(); }}
            class="flex flex-col gap-3 p-4 bg-surface border border-border rounded-2xl"
          >
            <input
              type="number"
              bind:value={contribAmount}
              placeholder="Nominal kontribusi"
              min="0"
              step="1"
              class="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-primary"
            />
            <input
              type="text"
              bind:value={contribNote}
              placeholder="Catatan (opsional)"
              class="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-primary"
            />
            <div class="flex gap-2">
              <Button
                variant="secondary"
                class="flex-1"
                onclick={() => (showContribForm = false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                class="flex-1"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "..." : "Tambah"}
              </Button>
            </div>
          </form>
        {:else}
          <button
            onclick={() => (showContribForm = true)}
            class="w-full flex items-center justify-center gap-2 p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Tambah Kontribusi
          </button>
        {/if}
      </div>
    {/if}

    {#if goalsStore.contributions.length > 0}
      <div>
        <h3 class="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          Kontribusi
        </h3>
        <div class="flex flex-col gap-2">
          {#each goalsStore.contributions as contrib (contrib.id)}
            <div class="flex items-center justify-between p-3 bg-surface border border-border rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {#if contrib.user_avatar}
                    <img
                      src={contrib.user_avatar}
                      alt={contrib.user_name}
                      class="w-full h-full object-cover"
                    />
                  {:else}
                    <User size={14} class="text-muted" />
                  {/if}
                </div>
                <div>
                  <p class="text-sm font-medium text-foreground">
                    {contrib.user_name || "Pengguna"}
                  </p>
                  {#if contrib.note}
                    <p class="text-xs text-muted">{contrib.note}</p>
                  {/if}
                </div>
              </div>
              <p class="text-sm font-semibold text-success">
                +{formatCurrency(contrib.amount_cents)}
              </p>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</ResponsiveModal>
