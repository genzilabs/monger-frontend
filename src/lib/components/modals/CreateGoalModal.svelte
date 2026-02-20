<script lang="ts">
  import { ResponsiveModal, Button } from "$lib/components/ui";
  import { goalsStore } from "$lib/stores";
  import type { Pocket } from "$lib/types/book";
  import type { CreateGoalRequest } from "$lib/types/goal";

  interface Props {
    open: boolean;
    onClose: () => void;
    bookId: string;
    pockets: Pocket[];
  }

  let { open, onClose, bookId, pockets }: Props = $props();

  let name = $state("");
  let description = $state("");
  let targetAmount = $state("");
  let pocketId = $state("");
  let deadline = $state("");
  let color = $state("#20a39e");
  let isSubmitting = $state(false);
  let formError = $state<string | null>(null);

  const colors = [
    "#20a39e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#6366f1",
  ];

  async function handleSubmit() {
    if (!name.trim()) {
      formError = "Nama goal wajib diisi";
      return;
    }
    const amount = parseFloat(targetAmount);
    if (!amount || amount <= 0) {
      formError = "Target nominal harus lebih dari 0";
      return;
    }

    isSubmitting = true;
    formError = null;

    const data: CreateGoalRequest = {
      name: name.trim(),
      target_cents: Math.round(amount * 100),
      color,
    };

    if (description.trim()) data.description = description.trim();
    if (pocketId) data.pocket_id = pocketId;
    if (deadline) data.deadline = new Date(deadline).toISOString();

    const result = await goalsStore.createGoal(bookId, data);
    isSubmitting = false;

    if (result) {
      resetForm();
      onClose();
    } else {
      formError = goalsStore.error;
    }
  }

  function resetForm() {
    name = "";
    description = "";
    targetAmount = "";
    pocketId = "";
    deadline = "";
    color = "#20a39e";
    formError = null;
  }
</script>

<ResponsiveModal {open} onClose={() => { resetForm(); onClose(); }} title="Buat Goal Baru">
  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="flex flex-col gap-4">
    {#if formError}
      <div class="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
        {formError}
      </div>
    {/if}

    <div>
      <label for="goal-name" class="block text-sm font-medium text-foreground mb-1">
        Nama Goal
      </label>
      <input
        id="goal-name"
        type="text"
        bind:value={name}
        placeholder="contoh: Dana Liburan"
        class="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
      />
    </div>

    <div>
      <label for="goal-target" class="block text-sm font-medium text-foreground mb-1">
        Target Nominal
      </label>
      <input
        id="goal-target"
        type="number"
        bind:value={targetAmount}
        placeholder="5000000"
        min="0"
        step="1"
        class="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
      />
    </div>

    <div>
      <label for="goal-pocket" class="block text-sm font-medium text-foreground mb-1">
        Pocket (opsional)
      </label>
      <select
        id="goal-pocket"
        bind:value={pocketId}
        class="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors"
      >
        <option value="">Tanpa pocket</option>
        {#each pockets as pocket}
          <option value={pocket.id}>{pocket.name}</option>
        {/each}
      </select>
      <p class="text-xs text-muted mt-1">
        Jika dihubungkan ke pocket, progress akan otomatis mengikuti saldo
      </p>
    </div>

    <div>
      <label for="goal-deadline" class="block text-sm font-medium text-foreground mb-1">
        Deadline (opsional)
      </label>
      <input
        id="goal-deadline"
        type="date"
        bind:value={deadline}
        class="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:border-primary transition-colors"
      />
    </div>

    <div>
      <label for="goal-desc" class="block text-sm font-medium text-foreground mb-1">
        Deskripsi (opsional)
      </label>
      <textarea
        id="goal-desc"
        bind:value={description}
        placeholder="Catatan tentang goal ini..."
        rows={2}
        class="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors resize-none"
      ></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium text-foreground mb-2">Warna</label>
      <div class="flex gap-2 flex-wrap">
        {#each colors as c}
          <button
            type="button"
            onclick={() => (color = c)}
            class="w-8 h-8 rounded-full transition-all {color === c
              ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
              : 'hover:scale-105'}"
            style="background-color: {c}"
          ></button>
        {/each}
      </div>
    </div>

    <div class="flex gap-3 pt-2">
      <Button
        variant="secondary"
        class="flex-1"
        onclick={() => { resetForm(); onClose(); }}
      >
        Batal
      </Button>
      <Button variant="primary" class="flex-1" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Buat Goal"}
      </Button>
    </div>
  </form>
</ResponsiveModal>
