<script lang="ts">
  import {
    Button,
    Input,
    Card,
    Divider,
    SocialButtons,
    ErrorAlert,
  } from "$lib/components/ui";
  import { AuthHeader, AuthFooterLink } from "$lib/components/auth";
  import { authApi } from "$lib/api";
  import { authStore, toastStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { isValidEmail, isValidPhone } from "$lib/utils/validation";

  let email = $state("");
  let phone = $state("");
  let name = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let isLoading = $state(false);
  let error = $state("");

  function validateForm(): boolean {
    if (!name.trim()) {
      error = "Siapa namamu?";
      return false;
    }
    if (name.trim().length < 2) {
      error = "Nama minimal 2 karakter ya";
      return false;
    }
    if (!email.trim()) {
      error = "Email-nya diisi dulu";
      return false;
    }
    if (!isValidEmail(email)) {
      error = "Format email-nya belum sesuai";
      return false;
    }
    if (phone.trim() && !isValidPhone(phone)) {
      error = "Format nomor teleponnya belum sesuai";
      return false;
    }
    if (!password) {
      error = "Buat kata sandi dulu";
      return false;
    }
    if (password.length < 8) {
      error = "Kata sandi minimal 8 karakter";
      return false;
    }
    if (password !== confirmPassword) {
      error = "Kata sandinya belum sama";
      return false;
    }
    error = "";
    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) return;
    isLoading = true;
    error = "";

    try {
      const result = await authApi.register({
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        name: name.trim(),
        locale: "id",
        base_currency: "IDR",
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

        // Clear any old onboarding flag and redirect to onboarding
        if (browser) {
          localStorage.removeItem("hasCompletedOnboarding");
        }
        
        toastStore.success('Akun berhasil dibuat! Silakan verifikasi email.');

        const otpResult = await authApi.sendOTP(email.trim());
        const params = new URLSearchParams({
          identifier: email.trim(),
          cooldown: String(otpResult.data?.cooldown_seconds || 60),
          postRegister: "true",
        });
        goto(`/verify?${params.toString()}`);
      }
    } catch {
      error = "Ada kendala. Coba lagi sebentar ya.";
      toastStore.error(error);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Daftar - Monger</title>
</svelte:head>

<div class="flex-1 flex flex-col animate-fade-in">
  <AuthHeader
    title="Mulai di sini"
    description="Buat akun untuk mulai mencatat keuanganmu."
  />

  <Card class="space-y-4">
    <Input
      type="text"
      label="Nama Lengkap"
      placeholder="cth. Budi Santoso"
      bind:value={name}
      autocomplete="name"
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

    <Input
      type="email"
      label="Alamat Email"
      placeholder="email@contoh.com"
      bind:value={email}
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      {/snippet}
    </Input>

    <Input
      type="password"
      label="Kata Sandi"
      placeholder="Minimal 8 karakter"
      bind:value={password}
      autocomplete="new-password"
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

    <Input
      type="password"
      label="Ulangi Kata Sandi"
      placeholder="Ketik ulang kata sandimu"
      bind:value={confirmPassword}
      autocomplete="new-password"
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      {/snippet}
    </Input>

    <ErrorAlert message={error} />

    <Button
      variant="primary"
      size="lg"
      fullWidth
      loading={isLoading}
      onclick={handleSubmit}
    >
      Daftar
    </Button>
  </Card>

  <AuthFooterLink href="/login" text="Sudah punya akun?" linkText="Masuk" />

  <div class="mt-6 space-y-4">
    <Divider text="ATAU LANJUTKAN DENGAN" />
    <SocialButtons />
  </div>
</div>
