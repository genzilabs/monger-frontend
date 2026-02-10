<script lang="ts">
  import {
    Button,
    Input,
    Card,
    Divider,
    SocialButtons,
    ErrorAlert,
  } from "$lib/components/ui";
  import { AuthFooterLink } from "$lib/components/auth";
  import { authApi } from "$lib/api";
  import { authStore, toastStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { isValidEmail, isValidPhone } from "$lib/utils/validation";
  import logoOnly from "$lib/assets/Logo/logo-only.webp";

  let email = $state("");
  let phone = $state("");
  let name = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let agreedToTerms = $state(false);
  let isLoading = $state(false);
  let error = $state("");

  function validateForm(): boolean {
    if (!name.trim()) {
      error = "Nama diisi dulu ya";
      return false;
    }
    if (name.trim().length < 2) {
      error = "Namanya terlalu pendek nih";
      return false;
    }
    if (!email.trim()) {
      error = "Email-nya belum diisi";
      return false;
    }
    if (!isValidEmail(email)) {
      error = "Format email belum pas";
      return false;
    }
    if (phone.trim() && !isValidPhone(phone)) {
      error = "Format nomor HP belum pas";
      return false;
    }
    if (!password) {
      error = "Kata sandi belum dibuat";
      return false;
    }
    if (password.length < 8) {
      error = "Kata sandi minimal 8 karakter ya";
      return false;
    }
    if (password !== confirmPassword) {
      error = "Kata sandinya beda nih";
      return false;
    }
    if (!agreedToTerms) {
      error = "Kamu perlu menyetujui Ketentuan Layanan dan Kebijakan Privasi";
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
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
        name: name.trim(),
        locale: "id",
        base_currency: "IDR",
      });

      if (result.error) {
        const errMsg = result.error.error.toLowerCase();
        // If email already exists (user registered but may not have verified),
        // send OTP and redirect to verify page
        if (errMsg.includes("already") || errMsg.includes("exist")) {
          toastStore.info("Email sudah terdaftar. Yuk verifikasi dulu!");
          try {
            const otpResult = await authApi.sendOTP(email.trim().toLowerCase());
            const params = new URLSearchParams({
              identifier: email.trim().toLowerCase(),
              cooldown: String(otpResult.data?.cooldown_seconds || 60),
              register: "true",
            });
            goto(`/verify?${params.toString()}`);
          } catch {
            // If sendOTP also fails, let user try login instead
            error = "Email sudah terdaftar. Coba masuk ya.";
          }
          return;
        }
        error = result.error.error;
        return;
      }

      if (result.data) {
        // Only redirect to verify, DO NOT set auth store (api returns no tokens)
        toastStore.success("Akun dibuat! Masukkan kode OTP yang dikirim.");

        // The API already sent the first OTP in Register logic,
        // so we just go to verify page. We assume standard 60s cooldown.
        // Or if we want to be safe, we can manually trigger sendOTP here,
        // but backend register flow usually sends one.

        const params = new URLSearchParams({
          identifier: email.trim().toLowerCase(),
          cooldown: "60", // Default assumption since register just sent one
          register: "true",
        });
        goto(`/verify?${params.toString()}`);
      }
    } catch {
      error = "Ada gangguan sebentar. Coba lagi nanti ya.";
      toastStore.error(error);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Daftar - Monger</title>
</svelte:head>

<div class="w-full animate-fade-in flex flex-col items-center">
  <!-- Logo (Mobile) -->
  <img src={logoOnly} alt="Monger" class="w-16 h-16 mb-6 md:hidden" />

  <h1 class="text-2xl font-bold text-foreground mb-2 text-center">
    Mulai di sini
  </h1>
  <p class="text-secondary text-center mb-8">
    Buat akun untuk mulai mencatat keuanganmu.
  </p>

  <Card class="space-y-4 w-full">
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

    <!-- Consent Checkbox -->
    <label class="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        bind:checked={agreedToTerms}
        class="mt-0.5 w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
      />
      <span class="text-sm text-secondary leading-relaxed">
        Saya setuju dengan
        <a href="/terms" class="text-primary hover:underline"
          >Ketentuan Layanan</a
        >
        dan
        <a href="/privacy" class="text-primary hover:underline"
          >Kebijakan Privasi</a
        >
        Monger.
      </span>
    </label>

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

  <!-- <div class="mt-6 space-y-4 w-full">
    <Divider text="ATAU LANJUTKAN DENGAN" />
    <SocialButtons />
  </div> -->
</div>
