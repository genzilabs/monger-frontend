<script lang="ts">
  import { Button } from "$lib/components/ui";
  import { authStore, toastStore } from "$lib/stores";
  import { feedbackApi } from "$lib/api/feedback";
  import type { FeedbackType } from "$lib/types/feedback";

  const feedbackTypes: { value: FeedbackType; label: string; desc: string }[] =
    [
      {
        value: "saran",
        label: "Saran",
        desc: "Ide untuk membuat Monger lebih baik",
      },
      {
        value: "masalah",
        label: "Masalah",
        desc: "Sesuatu yang tidak berjalan semestinya",
      },
      {
        value: "lainnya",
        label: "Lainnya",
        desc: "Apapun yang ingin kamu sampaikan",
      },
    ];

  let feedbackType = $state<FeedbackType>("saran");
  let description = $state("");
  let isSubmitting = $state(false);

  async function handleSubmit() {
    if (!description.trim() || !authStore.user) return;

    isSubmitting = true;

    const result = await feedbackApi.submit({
      user_id: authStore.user.id,
      feedback_type: feedbackType,
      description: description.trim(),
    });

    isSubmitting = false;

    if (result.error) {
      toastStore.error(
        "Maaf, feedback belum bisa terkirim. Coba lagi nanti ya.",
      );
      return;
    }

    toastStore.success(
      "Terima kasih sudah berbagi. Feedbackmu sangat berarti.",
    );
    description = "";
    feedbackType = "saran";
  }
</script>

<svelte:head>
  <title>Beri Feedback - Monger</title>
</svelte:head>

<div class="container mx-auto pb-24 md:pb-6">
  <!-- Page Title -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-foreground">Beri Feedback</h1>
    <p class="text-secondary text-sm">
      Bantu kami jadi lebih baik, pelan-pelan.
    </p>
  </div>

  <div class="space-y-6">
    <!-- Friendly intro -->
    <div class="p-4 bg-primary/5 rounded-2xl border border-primary/20">
      <p class="text-sm text-secondary leading-relaxed">
        Setiap masukan membantu kami memahami apa yang kamu butuhkan. Tidak
        harus sempurna, isi yang ada di pikiranmu saja.
      </p>
    </div>

    <!-- Feedback Type Selector -->
    <div>
      <span
        id="feedback-type-label"
        class="block text-sm font-medium text-secondary mb-2"
        >Jenis Feedback</span
      >
      <div
        class="flex flex-col gap-2"
        role="radiogroup"
        aria-labelledby="feedback-type-label"
      >
        {#each feedbackTypes as type}
          <button
            type="button"
            onclick={() => (feedbackType = type.value)}
            class="flex items-start gap-3 p-4 rounded-xl border transition-colors text-left {feedbackType ===
            type.value
              ? 'bg-primary/10 border-primary'
              : 'bg-surface border-border hover:border-muted'}"
          >
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 {feedbackType ===
              type.value
                ? 'border-primary'
                : 'border-muted'}"
            >
              {#if feedbackType === type.value}
                <div class="w-2.5 h-2.5 bg-primary rounded-full"></div>
              {/if}
            </div>
            <div>
              <span class="font-medium text-foreground">{type.label}</span>
              <p class="text-xs text-muted mt-0.5">{type.desc}</p>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Description -->
    <div>
      <label
        for="description"
        class="block text-sm font-medium text-secondary mb-2"
      >
        Ceritakan lebih lanjut
      </label>
      <textarea
        id="description"
        bind:value={description}
        placeholder="Tulis di sini..."
        rows="5"
        class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      ></textarea>
      <p class="text-xs text-muted mt-1.5">
        Bisa diedit atau ditambah kapan saja sebelum dikirim.
      </p>
    </div>

    <!-- Submit -->
    <Button
      variant="primary"
      fullWidth
      loading={isSubmitting}
      disabled={!description.trim()}
      onclick={handleSubmit}
    >
      Kirim Feedback
    </Button>
  </div>
</div>
