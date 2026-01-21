<script lang="ts">
  import "../app.css";
  import { authStore } from "$lib/stores";
  import { ToastContainer } from "$lib/components/ui";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { pwaInfo } from 'virtual:pwa-info';
  import { page } from "$app/stores";

  let { children } = $props();

  let isPublic = $derived(['/', '/privacy', '/terms'].includes($page.url.pathname));

  onMount(async () => {
    authStore.initialize();

    if (pwaInfo && !isPublic) {
      const { registerSW } = await import('virtual:pwa-register');
      registerSW({
        immediate: true,
        onRegistered(r: ServiceWorkerRegistration | undefined) {
          console.log('SW Registered: ' + r);
        },
        onRegisterError(error: any) {
          console.log('SW Registration Error', error);
        }
      });
    }

    // Lazy load fonts after initial render
    if (browser) {
      const fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
      document.head.appendChild(fontLink);
    }
  });
</script>

<svelte:head>
  <title>Monger - Keuanganmu, Terorganisir</title>
  <meta
    name="description"
    content="Kelola keuanganmu dengan Buku dan Kantong. Monger bikin hidupmu lebih rapi."
  />

  <!-- Preconnect to Google Fonts (improves connection time) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />

  <!-- Preload font CSS (highest priority, non-blocking) -->
  <link
    rel="preload"
    as="style"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  />

  <!-- Fallback for browsers without JS -->
  <noscript>
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </noscript>
  {#if pwaInfo?.webManifest?.linkTag && !isPublic}
    {@html pwaInfo.webManifest.linkTag}
  {/if}
</svelte:head>

{@render children()}
<ToastContainer />
