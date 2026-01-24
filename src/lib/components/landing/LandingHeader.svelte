<script lang="ts">
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  interface Props {
    class?: string;
  }

  let { class: className = "" }: Props = $props();
</script>

<header
  class="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 {className}"
>
  <div class="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
    <!-- Logo -->
    <a
      href="/"
      class="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <img src={logoOnly} alt="Monger" class="w-6 h-6" />
      <span class="font-bold text-lg text-foreground">Monger</span>
    </a>

    <!-- Navigation -->
    <nav class="flex items-center gap-5 text-sm">
      <a
        href="#cara-kerja"
        class="text-muted hover:text-foreground transition-colors hidden sm:block"
      >
        Cara Kerja
      </a>
      <a
        href="#kemampuan"
        class="text-muted hover:text-foreground transition-colors hidden sm:block"
      >
        Fitur
      </a>
      <a
        href="#alpha"
        class="text-muted hover:text-foreground transition-colors"
      >
        Alpha
      </a>
    </nav>
  </div>
</header>
