<script lang="ts">
  import { Button, OTPInput, Card } from "$lib/components/ui";
  import { authApi } from "$lib/api";
  import { authStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { maskIdentifier, isValidOTP } from "$lib/utils/validation";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  const identifier = $derived($page.url.searchParams.get("identifier") || "");
  const initialCooldown = $derived(
    parseInt($page.url.searchParams.get("cooldown") || "60", 10)
  );
  const isPostRegister = $derived(
    $page.url.searchParams.get("postRegister") === "true"
  );

  let otp = $state("");
  let isLoading = $state(false);
  let error = $state("");
  let errorType = $state<"invalid" | "expired" | null>(null);
  let cooldown = $state(0);
  let cooldownInterval: ReturnType<typeof setInterval> | null = null;

  const maskedIdentifier = $derived(maskIdentifier(identifier));

  onMount(() => {
    if (!identifier) {
      goto("/login");
      return;
    }

    cooldown = initialCooldown;
    startCooldownTimer();

    return () => {
      if (cooldownInterval) clearInterval(cooldownInterval);
    };
  });

  function startCooldownTimer() {
    if (cooldownInterval) clearInterval(cooldownInterval);

    cooldownInterval = setInterval(() => {
      cooldown--;
      if (cooldown <= 0) {
        cooldown = 0;
        if (cooldownInterval) {
          clearInterval(cooldownInterval);
          cooldownInterval = null;
        }
      }
    }, 1000);
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `0:${secs.toString().padStart(2, "0")}`;
  }

  async function handleVerify() {
    if (!isValidOTP(otp)) {
      error = "Kode belum pas. Pastikan 6 digit ya.";
      errorType = "invalid";
      return;
    }

    isLoading = true;
    error = "";
    errorType = null;

    try {
      const result = await authApi.verifyOTP({ identifier, otp });

      if (result.error) {
        const errorMsg = result.error.error.toLowerCase();
        if (errorMsg.includes("expired")) {
          errorType = "expired";
          error = "Kodenya sudah kedaluwarsa. Minta baru yuk.";
        } else {
          errorType = "invalid";
          error = result.error.error;
        }
        return;
      }

      if (isPostRegister || result.data) {
        if (result.data) {
          authStore.setAuth(
            result.data.user,
            result.data.access_token,
            result.data.refresh_token
          );
        }

        // After authentication, redirect to dashboard
        goto("/dashboard");
      }
    } catch {
      error = "Ada gangguan sebentar. Coba lagi nanti ya.";
      errorType = "invalid";
    } finally {
      isLoading = false;
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;

    isLoading = true;
    error = "";
    errorType = null;
    otp = "";

    try {
      const result = await authApi.sendOTP(identifier);

      if (result.error) {
        error = result.error.error;
        return;
      }

      cooldown = result.data?.cooldown_seconds || 60;
      startCooldownTimer();
    } catch {
      error = "Gagal kirim ulang. Coba lagi ya.";
    } finally {
      isLoading = false;
    }
  }

  function handleOTPComplete(value: string) {
    otp = value;
    handleVerify();
  }

  function handleOTPChange(value: string) {
    otp = value;
    if (error) {
      error = "";
      errorType = null;
    }
  }
</script>

<svelte:head>
  <title>Verifikasi - Monger</title>
</svelte:head>

<div class="w-full animate-fade-in flex flex-col items-center">
  <!-- Logo (Mobile) -->
  <img src={logoOnly} alt="Monger" class="w-16 h-16 mb-6 md:hidden" />

  <!-- Expired Error State -->
  {#if errorType === "expired"}
    <div
      class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 text-center w-full"
    >
      <div class="flex-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
        <svg
          class="w-6 h-6 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-red-800 mb-1">Kode Kedaluwarsa</h2>
      <p class="text-sm text-red-600">
        Kode untuk {maskedIdentifier} sudah ga berlaku.
      </p>
    </div>
  {/if}

  <h1 class="text-xl font-semibold text-center text-foreground mb-2">
    {errorType === "expired" ? "Minta Kode Baru" : "Isi Kode Verifikasi"}
  </h1>

  <p class="text-center text-secondary text-sm mb-6">
    {#if errorType === "expired"}
      Klik tombol di bawah untuk menerima kode baru.
    {:else}
      Kami kirim kode 6 digit ke<br />
      <span class="font-medium text-foreground">{maskedIdentifier}</span>
    {/if}
  </p>

  <div class="space-y-6 w-full mb-6">
    <div class="flex-between text-sm">
      <span class="text-label">Masukkan 6 digit kode</span>
      {#if error && errorType === "invalid"}
        <span class="text-red-500">Kodenya salah</span>
      {/if}
    </div>

    <OTPInput
      bind:value={otp}
      error={errorType === "invalid"}
      onComplete={handleOTPComplete}
      onchange={handleOTPChange}
    />

    <p class="text-xs text-center text-muted">Mecoba isi otomatis...</p>
  </div>

  <!-- Actions -->
  <div class="w-full mt-auto space-y-3">
    <div class="flex gap-3">
      <div class="flex-1 flex-center gap-2 py-3 bg-surface rounded-xl">
        <svg
          class="w-5 h-5 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-secondary font-mono">{formatTime(cooldown)}</span>
      </div>

      <Button
        variant="primary"
        size="md"
        disabled={cooldown > 0}
        loading={isLoading}
        onclick={handleResend}
      >
        <svg
          class="w-5 h-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Kirim Ulang
      </Button>
    </div>

    <button onclick={() => goto("/login")} class="btn-action">
      <div class="flex items-center gap-3">
        <svg
          class="w-5 h-5 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
        <span class="text-foreground">Salah nomor?</span>
      </div>
      <svg
        class="w-5 h-5 text-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <button class="btn-action">
      <div class="flex items-center gap-3">
        <svg
          class="w-5 h-5 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <span class="text-foreground">Hubungi Bantuan</span>
      </div>
      <svg
        class="w-5 h-5 text-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>

  <!-- Error Alert -->
  {#if error && errorType !== "expired"}
    <div class="mt-4 alert alert-error">
      <svg
        class="w-5 h-5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="text-sm">{error}</span>
    </div>
  {/if}

  <!-- Session expired indicator -->
  {#if errorType === "expired"}
    <div class="mt-auto pt-4">
      <div class="flex-center gap-2 text-sm text-red-500">
        <span class="status-dot status-dot-error"></span>
        Sesi kedaluwarsa. Minta kode baru ya.
      </div>
    </div>
  {/if}
</div>
