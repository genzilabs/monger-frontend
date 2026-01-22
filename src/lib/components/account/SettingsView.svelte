<script lang="ts">
  import { browser } from "$app/environment";
  import { Card } from "$lib/components/ui";
  import { CheckIcon, ChevronRightIcon } from "$lib/icons";

  // Get current locale from localStorage
  let currentLocale = $state("id");
  let showLanguageSelector = $state(false);

  if (browser) {
    currentLocale = localStorage.getItem("monger:locale") || "id";
  }

  const languages = [
    { code: "id", name: "Bahasa Indonesia", short: "ID" },
    { code: "en", name: "English", short: "EN" },
  ];

  function selectLanguage(code: string) {
    currentLocale = code;
    showLanguageSelector = false;
    if (browser) {
      localStorage.setItem("monger:locale", code);
      // Reload the page to apply the new locale
      window.location.reload();
    }
  }

  const currentLanguage = $derived(
    languages.find((l) => l.code === currentLocale) || languages[0],
  );
</script>

<div class="space-y-6 animate-fade-in">
  <div class="flex items-center gap-3">
    <h2 class="text-xl font-bold text-foreground">Pengaturan</h2>
  </div>

  <Card class="divide-y divide-border overflow-hidden">
    <!-- Language Setting -->
    <button
      onclick={() => (showLanguageSelector = !showLanguageSelector)}
      class="w-full p-4 flex items-center justify-between hover:bg-surface-elevated transition-colors"
    >
      <div class="text-left">
        <p class="font-medium text-foreground">Bahasa</p>
        <p class="text-xs text-secondary">{currentLanguage.name}</p>
      </div>
      <div class="flex items-center gap-2">
        <div
          class="px-3 py-1 bg-surface-elevated rounded text-xs font-mono text-muted"
        >
          {currentLanguage.short}
        </div>
        <ChevronRightIcon
          size={16}
          class="text-muted transition-transform {showLanguageSelector
            ? 'rotate-90'
            : ''}"
        />
      </div>
    </button>

    <!-- Language Selector (Expandable) -->
    {#if showLanguageSelector}
      <div class="bg-muted/30 border-t border-border">
        {#each languages as lang}
          <button
            onclick={() => selectLanguage(lang.code)}
            class="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition-colors border-b border-border last:border-b-0"
          >
            <span
              class="font-medium {currentLocale === lang.code
                ? 'text-primary'
                : 'text-foreground'}">{lang.name}</span
            >
            {#if currentLocale === lang.code}
              <CheckIcon size={18} class="text-primary" />
            {/if}
          </button>
        {/each}
      </div>
    {/if}

    <!-- Currency Setting -->
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

  <p class="text-xs text-muted text-center">
    Perubahan bahasa akan dimuat ulang setelah dipilih.
  </p>
</div>
