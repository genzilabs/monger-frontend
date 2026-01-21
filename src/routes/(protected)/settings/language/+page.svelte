<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { ChevronLeftIcon, CheckIcon } from "$lib/icons";
  import { Card } from "$lib/components/ui";

  // Get current locale from localStorage
  let currentLocale = $state("id");

  if (browser) {
    currentLocale = localStorage.getItem("monger:locale") || "id";
  }

  const languages = [
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "en", name: "English", flag: "🇺🇸" },
  ];

  function selectLanguage(code: string) {
    currentLocale = code;
    if (browser) {
      localStorage.setItem("monger:locale", code);
      // Reload the page to apply the new locale
      window.location.reload();
    }
  }
</script>

<svelte:head>
  <title>Bahasa - Monger</title>
</svelte:head>

<div class="container mx-auto space-y-6 pb-24 md:pb-6">
  <div>
    <h1 class="text-2xl font-bold text-foreground">Bahasa</h1>
    <p class="text-secondary text-sm">Pilih bahasa aplikasi</p>
  </div>

  <Card class="p-0 overflow-hidden">
    {#each languages as lang, i}
      <button
        onclick={() => selectLanguage(lang.code)}
        class="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition-colors
        {i < languages.length - 1 ? 'border-b border-border' : ''}"
      >
        <div class="flex items-center gap-3">
          <span class="text-2xl">{lang.flag}</span>
          <span class="font-medium text-foreground">{lang.name}</span>
        </div>
        {#if currentLocale === lang.code}
          <CheckIcon size={20} class="text-primary" />
        {/if}
      </button>
    {/each}
  </Card>

  <p class="text-xs text-muted text-center">
    Perubahan bahasa akan dimuat ulang setelah dipilih.
  </p>
</div>
