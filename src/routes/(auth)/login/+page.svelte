<script lang="ts">
  import {
    Button,
    Input,
    Card,
    Divider,
    SocialButtons,
    ErrorAlert,
  } from "$lib/components/ui";
  import { AuthHeader, AuthTabs, AuthFooterLink } from "$lib/components/auth";
  import { authApi } from "$lib/api";
  import { authStore, toastStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { isValidEmail, isValidPhone } from "$lib/utils/validation";

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
      error = "Masukkan email atau nomor teleponmu";
      return false;
    }
    if (!isValidEmail(identifier) && !isValidPhone(identifier)) {
      error = "Hmm, formatnya belum sesuai. Coba cek lagi ya.";
      return false;
    }
    if (loginMethod === "password" && !password) {
      error = "Jangan lupa kata sandinya";
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
        toastStore.success('Berhasil masuk! Selamat datang kembali.');
        goto("/dashboard");
      }
    } catch {
      error = "Ada kendala. Coba lagi sebentar ya.";
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
      error = "Ada kendala. Coba lagi sebentar ya.";
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

<div class="flex-1 flex flex-col animate-fade-in">
  <AuthHeader title="Halo lagi 👋" description="Masuk ke Buku dan Kantongmu." />

  <AuthTabs
    tabs={loginTabs}
    active={loginMethod}
    onchange={(id) => (loginMethod = id as "password" | "otp")}
  />

  <Card class="space-y-4">
    <Input
      type="text"
      label="Email atau Telepon"
      placeholder="email@contoh.com atau +62..."
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
        placeholder="Masukkan kata sandimu"
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

  <div class="mt-6 space-y-4">
    <Divider text="ATAU LANJUTKAN DENGAN" />
    <SocialButtons />
  </div>
</div>
