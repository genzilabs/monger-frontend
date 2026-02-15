<script lang="ts">
  import { booksStore, goalsStore } from "$lib/stores";
  import { formatCurrency } from "$lib/utils/currency";
  import { Target, Plus, Trophy, ChevronRight } from "lucide-svelte";
  import { TargetIcon } from "$lib/icons";
  import { EmptyState } from "$lib/components/ui";
  import CreateGoalModal from "$lib/components/modals/CreateGoalModal.svelte";
  import GoalDetailSheet from "$lib/components/modals/GoalDetailSheet.svelte";
  import type { Goal } from "$lib/types/goal";

  let showCreateModal = $state(false);
  let selectedGoal = $state<Goal | null>(null);
  let showDetailSheet = $state(false);

  const activeBook = $derived(booksStore.activeBook);

  $effect(() => {
    if (activeBook?.id) {
      goalsStore.loadGoals(activeBook.id);
    }
  });

  function openDetail(goal: Goal) {
    selectedGoal = goal;
    showDetailSheet = true;
  }

  function getProgressColor(progress: number): string {
    if (progress >= 100) return "bg-success";
    if (progress >= 75) return "bg-emerald-400";
    if (progress >= 50) return "bg-primary";
    if (progress >= 25) return "bg-amber-400";
    return "bg-red-400";
  }
</script>

<svelte:head>
  <title>Goals — Monger</title>
</svelte:head>

<div class="animate-fade-in space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Goals</h1>
      <p class="text-secondary">Target keuangan yang ingin kamu capai.</p>
    </div>
  </div>

  <button
    onclick={() => (showCreateModal = true)}
    class="w-full border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors flex items-center justify-center gap-2 group min-h-15"
  >
    <div
      class="w-8 h-8 rounded-full bg-surface-elevated group-hover:bg-primary/10 flex items-center justify-center transition-colors"
    >
      <Plus size={18} class="text-muted group-hover:text-primary" />
    </div>
    <span
      class="text-sm font-semibold text-muted group-hover:text-primary transition-colors"
      >Buat Goal Baru</span
    >
  </button>

  {#if !activeBook}
    <EmptyState
      title="Pilih Buku Dulu"
      description="Pilih buku di header dulu ya."
    >
      {#snippet icon()}
        <TargetIcon size={32} class="text-primary" />
      {/snippet}
    </EmptyState>
  {:else if goalsStore.isLoading && goalsStore.goals.length === 0}
    <div class="flex justify-center py-12">
      <div
        class="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"
      ></div>
    </div>
  {:else if goalsStore.goals.length === 0}
    <EmptyState
      title="Belum Ada Goals"
      description="Mulai buat target keuanganmu yang pertama."
    >
      {#snippet icon()}
        <TargetIcon size={32} class="text-primary" />
      {/snippet}
    </EmptyState>
  {:else}
    {#if goalsStore.activeGoals.length > 0}
      <section>
        <h2
          class="text-sm font-semibold text-muted uppercase tracking-wider mb-3"
        >
          Aktif ({goalsStore.activeGoals.length})
        </h2>
        <div class="flex flex-col gap-3">
          {#each goalsStore.activeGoals as goal (goal.id)}
            <button
              onclick={() => openDetail(goal)}
              class="w-full text-left p-4 bg-surface border border-border rounded-2xl hover:border-primary/30 transition-all group"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center"
                    style="background-color: {goal.color ||
                      '#20a39e'}20; color: {goal.color || '#20a39e'}"
                  >
                    <Target size={20} />
                  </div>
                  <div>
                    <p class="font-semibold text-foreground">{goal.name}</p>
                    {#if goal.deadline}
                      <p class="text-xs text-muted">
                        Target: {new Date(goal.deadline).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                    {/if}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  class="text-muted group-hover:text-primary transition-colors"
                />
              </div>

              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-muted"
                    >{formatCurrency(goal.current_cents)}</span
                  >
                  <span class="text-foreground font-medium"
                    >{formatCurrency(goal.target_cents)}</span
                  >
                </div>
                <div class="w-full h-2 bg-muted/20 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500 {getProgressColor(
                      goal.progress,
                    )}"
                    style="width: {Math.min(goal.progress, 100)}%"
                  ></div>
                </div>
                <p class="text-xs text-right text-primary">
                  {goal.progress.toFixed(0)}%
                </p>
              </div>
            </button>
          {/each}
        </div>
      </section>
    {/if}

    {#if goalsStore.completedGoals.length > 0}
      <section>
        <h2
          class="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2"
        >
          <Trophy size={14} />
          Tercapai ({goalsStore.completedGoals.length})
        </h2>
        <div class="flex flex-col gap-3">
          {#each goalsStore.completedGoals as goal (goal.id)}
            <button
              onclick={() => openDetail(goal)}
              class="w-full text-left p-4 bg-success/5 border border-success/20 rounded-2xl hover:border-success/40 transition-all"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center"
                  >
                    <Trophy size={20} class="text-success" />
                  </div>
                  <div>
                    <p class="font-semibold text-foreground">{goal.name}</p>
                    <p class="text-xs text-success">
                      {formatCurrency(goal.target_cents)} tercapai!
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} class="text-muted" />
              </div>
            </button>
          {/each}
        </div>
      </section>
    {/if}
  {/if}
</div>

{#if activeBook}
  <CreateGoalModal
    open={showCreateModal}
    onClose={() => (showCreateModal = false)}
    bookId={activeBook.id}
    pockets={booksStore.pockets}
  />
{/if}

{#if selectedGoal}
  <GoalDetailSheet
    open={showDetailSheet}
    onClose={() => {
      showDetailSheet = false;
      selectedGoal = null;
    }}
    goal={selectedGoal}
  />
{/if}
