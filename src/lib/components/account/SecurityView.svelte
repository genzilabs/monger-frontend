<script lang="ts">
  import { Button, Card, Input, ErrorAlert } from "$lib/components/ui";
  import { authApi } from "$lib/api";
  import { toastStore } from "$lib/stores";
  import { onMount } from "svelte";

  let isSavingPassword = $state(false);
  let passwordError = $state("");

  // Password State
  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");
  
  async function handleUpdatePassword() {
    passwordError = "";
    if (!currentPassword) {
      passwordError = "Masukkan kata sandi lama";
      return;
    }
    if (newPassword.length < 8) {
      passwordError = "Kata sandi baru minimal 8 karakter";
      return;
    }
    if (newPassword !== confirmPassword) {
      passwordError = "Kata sandi baru tidak sama";
      return;
    }

    isSavingPassword = true;
    try {
      const result = await authApi.updateProfile({
        current_password: currentPassword,
        password: newPassword,
        confirm_password: confirmPassword,
      });

      if (result.error) {
        passwordError = result.error.error;
        return;
      }

      toastStore.success("Kata sandi berhasil diubah");
      currentPassword = "";
      newPassword = "";
      confirmPassword = "";
    } catch {
      passwordError = "Gagal mengubah kata sandi";
    } finally {
      isSavingPassword = false;
    }
  }

  // PIN State
  let pinStatus = $state({
    enabled: false,
    lock_timeout: "immediate",
    is_set: false,
    is_verified: false,
  });
  let isSavingPin = $state(false);

  // PIN Modal State
  let showPinModal = $state(false);
  let pinMode = $state<'set' | 'change'>('set');
  let pinStep = $state<'current' | 'new' | 'confirm'>('new');
  
  let currentPin = $state("");
  let newPin = $state("");
  let confirmPin = $state("");
  let pinError = $state("");

  import { OTPInput, ResponsiveModal } from "$lib/components/ui";
  import { pinStore } from "$lib/stores/pin.svelte";

  onMount(async () => {
    fetchPinStatus();
  });

  async function fetchPinStatus() {
    try {
      const res = await authApi.getPINStatus();
      if (res.data) {
        pinStatus = res.data;
      }
    } catch {}
  }

  async function handlePinToggle() {
    if (isSavingPin) return;
    
    // If enabling and PIN not set, show Set PIN modal
    if (!pinStatus.enabled && !pinStatus.is_set) {
      openPinModal('set');
      return;
    }

    // Otherwise, simple toggle
    isSavingPin = true;
    try {
      const newEnabled = !pinStatus.enabled;
      await authApi.updatePINSettings({ enabled: newEnabled });
      pinStatus.enabled = newEnabled;
      // Sync store
      pinStore.updateSettings(newEnabled, pinStatus.lock_timeout);
      
      toastStore.success(newEnabled ? "PIN diaktifkan" : "PIN dinonaktifkan");
    } catch (e) {
      toastStore.error("Gagal mengubah pengaturan PIN");
    } finally {
      isSavingPin = false;
    }
  }

  async function handleTimeoutChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const newTimeout = select.value;
    
    try {
      await authApi.updatePINSettings({ lock_timeout: newTimeout as any });
      pinStatus.lock_timeout = newTimeout;
      // Sync store
      pinStore.updateSettings(pinStatus.enabled, newTimeout); 

      toastStore.success("Waktu kunci diperbarui");
    } catch {
      toastStore.error("Gagal memperbarui waktu kunci");
      // Revert (simplified: just fetch status again)
      fetchPinStatus();
    }
  }

  function openPinModal(mode: 'set' | 'change') {
    pinMode = mode;
    pinStep = mode === 'change' ? 'current' : 'new';
    currentPin = "";
    newPin = "";
    confirmPin = "";
    pinError = "";
    showPinModal = true;
  }

  async function handlePinSubmit() {
    pinError = "";
    
    // Step 1: Verify Current PIN (Change Mode)
    if (pinStep === 'current') {
      if (currentPin.length !== 6) return;
      // In a real flow we might verify against API here, or just proceed to New PIN 
      // and verify all at end. But checking first is better UX.
      try {
        const res = await authApi.verifyPIN({ pin: currentPin });
        if (res.data) {
          pinStep = 'new';
        } else {
          pinError = "PIN salah";
        }
      } catch {
        pinError = "Terjadi kesalahan";
      }
      return;
    }

    // Step 2: Enter New PIN
    if (pinStep === 'new') {
      if (newPin.length !== 6) return;
      pinStep = 'confirm';
      return;
    }

    // Step 3: Confirm & Save
    if (pinStep === 'confirm') {
      if (confirmPin !== newPin) {
        pinError = "PIN tidak sama";
        return;
      }

      isSavingPin = true;
      try {
        if (pinMode === 'set') {
          await authApi.setPIN({ pin: newPin, confirm_pin: confirmPin });
          toastStore.success("PIN berhasil dibuat");
          // Setting PIN automatically enables it usually? API sets enabled=true.
        } else {
          await authApi.changePIN({ 
            current_pin: currentPin, 
            new_pin: newPin, 
            confirm_pin: confirmPin 
          });
          toastStore.success("PIN berhasil diubah");
        }
        
        await fetchPinStatus();
        showPinModal = false;
      } catch (e: any) {
        pinError = e?.error || "Gagal menyimpan PIN";
      } finally {
        isSavingPin = false;
      }
    }
  }

  import { ChevronLeftIcon } from "$lib/icons";
  let { onBack } = $props<{ onBack: () => void }>();
</script>

<div class="space-y-6 animate-fade-in pt-2">
  <!-- Inline Header -->
  <div class="flex items-center gap-3 mb-6">
    <button onclick={onBack} class="md:hidden p-2 -ml-2 hover:bg-surface rounded-full">
      <ChevronLeftIcon class="w-5 h-5" />
    </button>
    <h2 class="text-xl font-bold text-foreground">Keamanan</h2>
  </div>

  <Card class="p-5 space-y-5">
    <div class="space-y-1">
      <h3 class="font-medium text-foreground">Kata Sandi</h3>
      <p class="text-xs text-secondary">
        Amankan akunmu dengan kata sandi yang kuat.
      </p>
    </div>

    <div class="space-y-4">
      <Input
        label="Kata Sandi Lama"
        type="password"
        placeholder="••••••••"
        bind:value={currentPassword}
      />
      <Input
        label="Kata Sandi Baru"
        type="password"
        placeholder="Minimal 8 karakter"
        bind:value={newPassword}
      />
      <Input
        label="Ulangi Kata Sandi Baru"
        type="password"
        placeholder="••••••••"
        bind:value={confirmPassword}
      />
    </div>

    {#if passwordError}
      <ErrorAlert message={passwordError} />
    {/if}

    <div class="pt-2">
      <Button
        variant="outline"
        fullWidth
        loading={isSavingPassword}
        class="border-primary/20 text-primary hover:bg-primary/5"
        disabled={!currentPassword || !newPassword}
        onclick={handleUpdatePassword}
      >
        Perbarui Kata Sandi
      </Button>
    </div>
  </Card>

  <Card class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-medium text-foreground">PIN Aplikasi</h3>
        <p class="text-xs text-secondary">
          Kunci aplikasi saat tidak digunakan.
        </p>
      </div>
      
      <!-- Toggle Switch -->
      <button
        onclick={handlePinToggle}
        disabled={isSavingPin}
        class="w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary {pinStatus.enabled ? 'bg-primary' : 'bg-border'}"
      >
        <span
          class="block w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 {pinStatus.enabled ? 'translate-x-6' : 'translate-x-1'}"
        ></span>
      </button>
    </div>

    {#if pinStatus.enabled}
      <div class="pt-4 border-t border-border space-y-4 animate-fade-in">
        <div class="grid grid-cols-2 gap-4 items-center">
          <label class="text-sm font-medium text-foreground">Kunci Otomatis</label>
          <select 
            value={pinStatus.lock_timeout} 
            onchange={handleTimeoutChange}
            class="bg-surface border border-border rounded-lg text-sm p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="immediate">Segera</option>
            <option value="1m">1 menit</option>
            <option value="5m">5 menit</option>
            <option value="15m">15 menit</option>
            <option value="30m">30 menit</option>
            <option value="never">Tidak pernah</option>
          </select>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-foreground">Ubah PIN</span>
          <Button 
            variant="outline" 
            size="sm" 
            onclick={() => openPinModal('change')}
          >
            Ubah
          </Button>
        </div>
      </div>
    {/if}
  </Card>
</div>

<!-- PIN Modal -->
<ResponsiveModal
  open={showPinModal}
  onClose={() => showPinModal = false}
  title={pinMode === 'set' ? 'Buat PIN' : 'Ubah PIN'}
>
  <div class="p-4 space-y-6 flex flex-col items-center">
    <div class="text-center space-y-2">
      <h3 class="text-lg font-semibold">
        {#if pinStep === 'current'}
          Masukkan PIN Lama
        {:else if pinStep === 'new'}
          {pinMode === 'set' ? 'Buat PIN Baru' : 'Masukkan PIN Baru'}
        {:else}
          Konfirmasi PIN Baru
        {/if}
      </h3>
      <p class="text-sm text-secondary">
        {#if pinStep === 'current'}
          Verifikasi identitasmu dulu.
        {:else if pinStep === 'new'}
          Gunakan 6 angka yang susah ditebak.
        {:else}
          Masukkan ulang biar ngga salah.
        {/if}
      </p>
    </div>

    {#key pinStep}
      <OTPInput
        length={6}
        autoFocus
        value={pinStep === 'current' ? currentPin : pinStep === 'new' ? newPin : confirmPin}
        error={!!pinError}
        onchange={(val) => {
          if (pinStep === 'current') currentPin = val;
          else if (pinStep === 'new') newPin = val;
          else confirmPin = val;
          pinError = "";
        }}
        onComplete={handlePinSubmit}
      />
    {/key}

    {#if pinError}
      <p class="text-sm text-red-500 font-medium text-center animate-shake">
        {pinError}
      </p>
    {/if}

    <div class="w-full pt-4">
       {#if pinStep === 'current'}
          <Button fullWidth variant="primary" onclick={handlePinSubmit} loading={isSavingPin}>
             Lanjut
          </Button>
       {:else if pinStep === 'new'}
           <Button fullWidth variant="primary" onclick={handlePinSubmit}>
             Lanjut
          </Button>
       {:else}
           <Button fullWidth variant="primary" onclick={handlePinSubmit} loading={isSavingPin}>
             Simpan PIN
          </Button>
       {/if}
    </div>
  </div>
</ResponsiveModal>
