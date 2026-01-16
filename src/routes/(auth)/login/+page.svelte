<script lang="ts">
  import {
    Button,
    Input,
    Card,
    Divider,
    SocialButtons,
    ErrorAlert,
  } from "$lib/components/ui";
  import { AuthTabs, AuthFooterLink } from "$lib/components/auth";
  import { authApi } from "$lib/api";
  import { authStore, toastStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { isValidEmail, isValidPhone } from "$lib/utils/validation";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  let loginMethod = $state<"password" | "otp">("password");
  let identifier = $state("");
  let password = $state("");
  let isLoading = $state(false);
  let error = $state("");

  const loginTabs = [
    { id: "password", label: "Kata Sandi" },
    { id: "otp", label: "Kode OTP" },
  ];

  function validateForm(): boolean {
    if (!identifier.trim()) {
      error = "Tolong isi email atau nomor HP dulu ya";
      return false;
    }
    if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
      error = "Formatnya belum pas nih. Coba cek lagi ya.";
      return false;
    }
    if (loginMethod === "password" && !password) {
      error = "Kata sandinya belum diisi";
      return false;
    }
    error = "";
    return true;
  }

  async function handlePasswordLogin() {
    if (!validateForm()) return;
    isLoading = true;
    error = "";

    try {
      const result = await authApi.login({
        email: identifier.trim(),
        password,
      });
      if (result.error) {
        error = result.error.error;
        return;
      }
      if (result.data) {
        authStore.setAuth(
          result.data.user,
          result.data.access_token,
          result.data.refresh_token
        );
        toastStore.success("Selamat datang kembali.");
        goto("/dashboard");
      }
    } catch {
      error = "Ada gangguan sebentar. Coba lagi nanti ya.";
      toastStore.error(error);
    } finally {
      isLoading = false;
    }
  }

  async function handleOTPLogin() {
    if (!validateForm()) return;
    isLoading = true;
    error = "";

    try {
      const result = await authApi.sendOTP(identifier.trim());
      if (result.error) {
        error = result.error.error;
        return;
      }
      const params = new URLSearchParams({
        identifier: identifier.trim(),
        cooldown: String(result.data?.cooldown_seconds || 60),
      });
      goto(`/verify?${params.toString()}`);
    } catch {
      error = "Ada gangguan sebentar. Coba lagi nanti ya.";
    } finally {
      isLoading = false;
    }
  }

  function handleSubmit() {
    loginMethod === "password" ? handlePasswordLogin() : handleOTPLogin();
  }
</script>

<svelte:head>
  <title>Masuk - Monger</title>
</svelte:head>

<div class="w-full animate-fade-in flex flex-col items-center">
  <!-- Logo (Mobile) -->
  <img src={logoOnly} alt="Monger" class="w-16 h-16 mb-6 md:hidden" />

  <h1 class="text-2xl font-bold text-foreground mb-2 text-center">Halo lagi</h1>
  <p class="text-secondary text-center mb-8">Masuk ke Buku dan Kantongmu.</p>

  <div class="w-full">
    <AuthTabs
      tabs={loginTabs}
      active={loginMethod}
      onchange={(id) => (loginMethod = id as "password" | "otp")}
    />
  </div>

  <Card class="space-y-4 w-full">
    <Input
      type="text"
      label="Email atau Nomor HP"
      placeholder="email@contoh.com atau 08..."
      bind:value={identifier}
      autocomplete="email"
    >
      {#snippet icon()}
        <svg
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      {/snippet}
    </Input>

    {#if loginMethod === "password"}
      <Input
        type="password"
        label="Kata Sandi"
        placeholder="Tulis kata sandimu"
        bind:value={password}
        autocomplete="current-password"
      >
        {#snippet icon()}
          <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        {/snippet}
      </Input>
      <div class="text-right">
        <a href="/recover" class="text-sm text-primary hover:underline"
          >Lupa kata sandi?</a
        >
      </div>
    {:else}
      <p class="text-sm text-muted text-center py-2">
        Kami kirim kode 6 digit untuk verifikasi.
      </p>
    {/if}

    <ErrorAlert message={error} />

    <Button
      variant="primary"
      size="lg"
      fullWidth
      loading={isLoading}
      onclick={handleSubmit}
    >
      {loginMethod === "password" ? "Masuk" : "Kirim Kode"}
    </Button>
  </Card>

  <AuthFooterLink href="/register" text="Belum punya akun?" linkText="Daftar" />

  <!-- <div class="mt-6 space-y-4 w-full">
    <Divider text="ATAU LANJUTKAN DENGAN" />
    <SocialButtons />
  </div> -->
</div>
