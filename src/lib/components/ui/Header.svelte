<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { authStore, booksStore } from "$lib/stores";
    import {
        ChevronLeftIcon,
        BookIcon,
        PlusIcon,
        ChevronDownIcon,
        LogOutIcon,
        BellIcon,
    } from "$lib/icons";

    let { showBookSwitcher = $bindable() } = $props();

    const showBackButton = $derived($page.url.pathname !== "/dashboard");

    function goBack() {
        if (typeof window !== "undefined" && window.history.length > 1) {
            window.history.back();
        } else {
            goto("/dashboard");
        }
    }

    async function handleLogout() {
        await authStore.logout();
        goto("/auth");
    }
</script>

<header
    class="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border"
>
    <!-- Mobile Header -->
    <div class="px-6 py-3 flex items-center justify-between relative md:hidden">
        <!-- Left Section: Back Button -->
        <div class="flex items-center gap-3 min-w-[40px]">
            {#if showBackButton}
                <button
                    onclick={goBack}
                    class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface transition-colors"
                    aria-label="Kembali"
                >
                    <ChevronLeftIcon class="w-6 h-6 text-foreground" />
                </button>
            {/if}
        </div>

        <!-- Center Section: Book Selector -->
        <div class="absolute left-1/2 -translate-x-1/2">
            <button
                onclick={() => (showBookSwitcher = true)}
                class="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface hover:bg-border transition-colors"
            >
                {#if booksStore.activeBook}
                    <div
                        class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"
                    >
                        <BookIcon class="w-4 h-4 text-primary" size={16} />
                    </div>
                    <p
                        class="text-sm font-medium text-foreground truncate max-w-[120px]"
                    >
                        {booksStore.activeBook.name}
                    </p>
                {:else if booksStore.books.length > 0}
                    <div
                        class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center"
                    >
                        <BookIcon class="w-4 h-4 text-muted" size={16} />
                    </div>
                    <p class="text-sm text-muted">Pilih Buku</p>
                {:else}
                    <div
                        class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
                    >
                        <PlusIcon class="w-4 h-4 text-primary" size={16} />
                    </div>
                    <p class="text-sm text-primary font-medium">Buat Buku</p>
                {/if}
                <ChevronDownIcon class="w-4 h-4 text-muted" size={16} />
            </button>
        </div>

        <!-- Right Section: Notification (Mobile) -->
        <div class="flex items-center gap-3 min-w-[40px] justify-end">
            <button
                class="p-2 text-muted hover:text-foreground transition-colors"
                aria-label="Notifikasi"
            >
                <BellIcon class="w-6 h-6" size={24} />
            </button>
        </div>
    </div>

    <!-- Desktop Header -->
    <div class="px-6 py-4 hidden md:flex items-center justify-between">
        <!-- Book Selector -->
        <button
            onclick={() => (showBookSwitcher = true)}
            class="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface hover:bg-border transition-colors"
        >
            {#if booksStore.activeBook}
                <div
                    class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center"
                >
                    <BookIcon class="text-primary" size={16} />
                </div>
                <p class="text-sm font-medium text-foreground">
                    {booksStore.activeBook.name}
                </p>
            {:else if booksStore.books.length > 0}
                <div
                    class="w-8 h-8 rounded-lg bg-surface flex items-center justify-center"
                >
                    <BookIcon class="text-muted" size={16} />
                </div>
                <p class="text-sm text-muted">Pilih Buku</p>
            {:else}
                <div
                    class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
                >
                    <PlusIcon class="text-primary" size={16} />
                </div>
                <p class="text-sm text-primary font-medium">Buat Buku</p>
            {/if}
            <ChevronDownIcon class="text-muted" size={16} />
        </button>

        <!-- User Info -->
        <div class="flex items-center gap-4">
            {#if authStore.user}
                <span class="text-sm text-secondary"
                    >{authStore.user.name || authStore.user.email}</span
                >
                <button
                    onclick={handleLogout}
                    class="p-2 text-muted hover:text-foreground transition-colors"
                    aria-label="Keluar"
                >
                    <LogOutIcon size={20} />
                </button>
            {:else}
                <div
                    class="h-4 w-24 bg-surface rounded-full animate-pulse"
                ></div>
            {/if}
        </div>
    </div>
</header>
