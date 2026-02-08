<script lang="ts">
    import { Button, Input } from "$lib/components/ui";
    import { booksStore, authStore, onboardingStore } from "$lib/stores";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import logoOnly from "$lib/assets/Logo/logo-only.webp";

    let name = $state("");
    let description = $state("");
    let isCreating = $state(false);
    let error = $state("");
    let isReady = $state(false);

    onMount(async () => {
        if (browser) {
            const accessToken = localStorage.getItem("monger_access_token");

            if (!accessToken) {
                // Not logged in, go to auth
                goto("/auth");
                return;
            }

            // Initialize auth and books
            if (!authStore.isInitialized) await authStore.initialize();
            if (!booksStore.isInitialized) await booksStore.initialize();

            // If user already has books, go to dashboard
            if (booksStore.books.length > 0) {
                goto("/dashboard");
                return;
            }

            isReady = true;
        }
    });

    async function handleSubmit() {
        if (!name.trim()) {
            error = "Nama buku diisi dulu ya";
            return;
        }

        if (name.trim().length < 2) {
            error = "Nama buku minimal 2 karakter";
            return;
        }

        isCreating = true;
        error = "";

        try {
            const book = await booksStore.createBook({
                name: name.trim(),
                description: description.trim() || undefined,
            });

            if (book) {
                // Set the newly created book as active
                booksStore.setActiveBook(book);

                // Mark onboarding complete
                onboardingStore.complete();

                // Go to dashboard
                goto("/dashboard");
            } else {
                error = "Gagal membuat buku. Coba lagi ya.";
            }
        } catch (e) {
            error = "Ada gangguan. Coba lagi nanti.";
        } finally {
            isCreating = false;
        }
    }
</script>

<svelte:head>
    <title>Buat Buku Pertama - Monger</title>
</svelte:head>

{#if isReady}
    <div
        class="flex flex-col items-center justify-center min-h-screen p-6 animate-fade-in"
    >
        <!-- Logo -->
        <img src={logoOnly} alt="Monger" class="w-20 h-20 mb-8" />

        <!-- Header -->
        <div class="text-center mb-8 max-w-sm">
            <h1 class="text-2xl font-bold text-foreground mb-2">
                Buat Buku Pertamamu!
            </h1>
            <p class="text-secondary">
                Buku adalah tempat kamu mencatat semua transaksi. Yuk mulai
                dengan yang pertama.
            </p>
        </div>

        <!-- Form -->
        <div class="w-full max-w-sm space-y-4">
            <div>
                <label
                    for="book-name"
                    class="block text-sm font-medium text-foreground mb-1.5"
                >
                    Nama Buku
                </label>
                <input
                    id="book-name"
                    type="text"
                    bind:value={name}
                    placeholder="contoh: Keuangan Pribadi, Rumah Tangga"
                    class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
            </div>

            <div>
                <label
                    for="book-desc"
                    class="block text-sm font-medium text-foreground mb-1.5"
                >
                    Deskripsi <span class="text-muted">(opsional)</span>
                </label>
                <textarea
                    id="book-desc"
                    bind:value={description}
                    placeholder="Buku ini untuk apa?"
                    rows="2"
                    class="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
                ></textarea>
            </div>

            {#if error}
                <div
                    class="text-sm text-error bg-error/10 px-4 py-3 rounded-xl"
                >
                    {error}
                </div>
            {/if}

            <Button
                variant="primary"
                fullWidth
                size="lg"
                loading={isCreating}
                disabled={!name.trim()}
                onclick={handleSubmit}
            >
                Buat Buku & Mulai
            </Button>
        </div>

        <!-- Tips -->
        <div class="mt-12 text-center text-sm text-muted max-w-xs">
            <p>
                Kamu bisa buat buku lain nanti untuk keperluan berbeda, seperti
                tabungan liburan atau bisnis.
            </p>
        </div>
    </div>
{:else}
    <!-- Loading state -->
    <div class="min-h-screen flex items-center justify-center">
        <div class="animate-pulse text-center">
            <div class="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-xl"></div>
            <p class="text-muted">Memuat...</p>
        </div>
    </div>
{/if}
