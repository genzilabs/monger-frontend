<script lang="ts">
  import { Button, Card, Input, ErrorAlert } from "$lib/components/ui";
  import { authApi } from "$lib/api";
  import { toastStore } from "$lib/stores";
  import { onMount } from "svelte";

  let isSavingPassword = $state(false);
  let passwordError = $state("");

  // Password State
  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");

  // PIN State
  let pinEnabled = $state(false); // fetch on mount
  let isSavingPin = $state(false);

  onMount(async () => {
    try {
      const res = await authApi.getPINStatus();
      if (res.data) {
        pinEnabled = res.data.enabled;
      }
    } catch {}
  });

  async function handleUpdatePassword() {
    passwordError = "";
    if (!currentPassword) {
      passwordError = "Masukkan kata sandi lama";
      return;
    }
    if (newPassword.length < 8) {
      passwordError = "Kata sandi baru minimal 8 karakter";
      return;
    }
    if (newPassword !== confirmPassword) {
      passwordError = "Kata sandi baru tidak sama";
      return;
    }

    isSavingPassword = true;
    try {
      const result = await authApi.updateProfile({
        current_password: currentPassword,
        password: newPassword,
        confirm_password: confirmPassword,
      });

      if (result.error) {
        passwordError = result.error.error;
        return;
      }

      toastStore.success("Kata sandi berhasil diubah");
      currentPassword = "";
      newPassword = "";
      confirmPassword = "";
    } catch {
      passwordError = "Gagal mengubah kata sandi";
    } finally {
      isSavingPassword = false;
    }
  }

  // Placeholder for PIN logic (UI only for now as requested plan did not specify full PIN flow implementation details, sticking to Password priority + PIN placeholder structure)
  import { ChevronLeftIcon } from "$lib/icons";

  let { onBack } = $props<{ onBack: () => void }>();

  function handlePinToggle() {
    toastStore.info("Fitur PIN akan segera hadir");
  }
</script>

<div class="space-y-6 animate-fade-in pt-2">
  <!-- Inline Header -->
  <div class="flex items-center gap-3 mb-6">
    <h2 class="text-xl font-bold text-foreground">Keamanan</h2>
  </div>

  <Card class="p-5 space-y-5">
    <div class="space-y-1">
      <h3 class="font-medium text-foreground">Kata Sandi</h3>
      <p class="text-xs text-secondary">
        Amankan akunmu dengan kata sandi yang kuat.
      </p>
    </div>

    <div class="space-y-4">
      <Input
        label="Kata Sandi Lama"
        type="password"
        placeholder="••••••••"
        bind:value={currentPassword}
      />
      <Input
        label="Kata Sandi Baru"
        type="password"
        placeholder="Minimal 8 karakter"
        bind:value={newPassword}
      />
      <Input
        label="Ulangi Kata Sandi Baru"
        type="password"
        placeholder="••••••••"
        bind:value={confirmPassword}
      />
    </div>

    {#if passwordError}
      <ErrorAlert message={passwordError} />
    {/if}

    <div class="pt-2">
      <Button
        variant="outline"
        fullWidth
        loading={isSavingPassword}
        class="border-primary/20 text-primary hover:bg-primary/5"
        disabled={!currentPassword || !newPassword}
        onclick={handleUpdatePassword}
      >
        Perbarui Kata Sandi
      </Button>
    </div>
  </Card>

  <Card class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-medium text-foreground">PIN Aplikasi</h3>
        <p class="text-xs text-secondary">
          Kunci aplikasi saat tidak digunakan.
        </p>
      </div>
      <!-- Toggle Switch Placeholder -->
      <button
        onclick={handlePinToggle}
        class="w-10 h-6 bg-border rounded-full relative transition-colors"
      >
        <div
          class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        ></div>
      </button>
    </div>
  </Card>
</div>
