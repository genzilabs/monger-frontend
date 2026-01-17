<script lang="ts">
  import { Button, Card, Input } from "$lib/components/ui";
  import { authStore, toastStore } from "$lib/stores";
  import { authApi } from "$lib/api";
  import { UserIcon } from "$lib/icons";
  import { onMount } from "svelte";

  let loading = $state(false);
  let name = $state(authStore.user?.name || "");
  let email = $state(authStore.user?.email || "");
  let phone = $state(authStore.user?.phone || "");
  let avatarUrl = $state(authStore.user?.avatar_url || "");

  // Extract initials from name (e.g., "Kazuha Nakamura" → "KN")
  function getInitials(fullName: string): string {
    if (!fullName) return "?";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  async function handleSave() {
    loading = true;
    try {
      const res = await authApi.updateProfile({
        name,
        email,
        phone: phone || undefined,
        avatar_url: avatarUrl,
      });

      if (res.data) {
        authStore.setUser(res.data);
        toastStore.success("Profil berhasil diperbarui");
      } else if (res.error) {
        toastStore.error(res.error.error);
      }
    } catch (e) {
      toastStore.error("Terjadi kesalahan");
    } finally {
      loading = false;
    }
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate format
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
      ];
      if (!validTypes.includes(file.type)) {
        toastStore.error(
          "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP."
        );
        return;
      }

      // Validate size (e.g., 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toastStore.error("Ukuran file maksimal 5MB.");
        return;
      }

      // Create preview (in real app, upload here)
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleRemovePhoto() {
    avatarUrl = "";
  }
  import { ChevronLeftIcon } from "$lib/icons";

  let { onBack } = $props<{ onBack: () => void }>();
</script>

<div class="space-y-6 animate-fade-in relative pt-2">
  <div class="flex items-center gap-3 mb-6">
    <h2 class="text-xl font-bold text-foreground">Profil Kamu</h2>
  </div>

  <div class="flex flex-col items-center py-4">
    <div class="relative">
      <div
        class="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-border overflow-hidden"
      >
        {#if avatarUrl}
          <img
            src={avatarUrl}
            alt="Avatar"
            class="w-full h-full object-cover"
          />
        {:else}
          <span class="text-2xl font-bold text-primary"
            >{getInitials(name)}</span
          >
        {/if}
      </div>
      <label
        class="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg text-xs font-bold cursor-pointer"
      >
        +
        <input
          type="file"
          accept="image/*"
          class="hidden"
          onchange={handleFileSelect}
        />
      </label>
    </div>
    {#if avatarUrl}
      <button
        onclick={handleRemovePhoto}
        class="mt-3 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
      >
        Hapus Foto
      </button>
    {/if}
  </div>

  <Card class="p-5 space-y-4">
    <Input label="Nama Lengkap" bind:value={name} />
    <Input label="Email" type="email" bind:value={email} />
    <Input label="Nomor Telepon" type="tel" bind:value={phone} />

    <div class="pt-4">
      <Button fullWidth variant="primary" {loading} onclick={handleSave}>
        Simpan Perubahan
      </Button>
    </div>
  </Card>
</div>
