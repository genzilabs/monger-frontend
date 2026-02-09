<script lang="ts">
    import { HeartIcon, UsersIcon } from "$lib/icons";
    import { getLatestVersion } from "$lib/data/updates";
    import logoOnly from "$lib/assets/Logo/logo-only.webp";
</script>

<svelte:head>
    <title>Tentang Monger</title>
</svelte:head>

<div class="min-h-screen bg-background pb-20">
    <div class="container mx-auto px-4 py-6 space-y-8 animate-fade-in">
        <!-- Hero / Brand -->
        <div class="text-center space-y-4 py-8">
            <div class="relative inline-block">
                <div
                    class="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto"
                >
                    <img src={logoOnly} alt="Monger" class="w-12 h-12" />
                </div>
                <div
                    class="absolute -bottom-2 -right-2 bg-surface border border-border px-2 py-0.5 rounded-full text-[10px] font-medium shadow-sm"
                >
                    v{getLatestVersion()}
                </div>
            </div>
            <div>
                <h1 class="text-2xl font-bold text-foreground">Monger</h1>
                <p class="text-secondary">Catat Keuangan, Raih Impian.</p>
            </div>
        </div>

        <!-- Mission -->
        <section class="space-y-3">
            <div class="flex items-center gap-2">
                <HeartIcon size={18} class="text-rose-500" />
                <h2
                    class="text-sm font-semibold text-foreground uppercase tracking-wider"
                >
                    Misi Kami
                </h2>
            </div>
            <div
                class="bg-surface rounded-2xl p-5 border border-border shadow-sm"
            >
                <p class="text-sm text-secondary leading-relaxed">
                    Monger hadir untuk membantu setiap gen-z mengambil kendali
                    penuh atas keuangan mereka. Kami percaya bahwa pencatatan
                    keuangan tidak harus rumit atau membosankan.
                </p>
                <p class="text-sm text-secondary leading-relaxed mt-3">
                    Dengan desain yang simpel dan fitur yang fokus pada esensi,
                    kami ingin menciptakan rasa tenang (peace of mind) dalam
                    setiap keputusan finansialmu.
                </p>
            </div>
        </section>

        <!-- Team -->
        <section class="space-y-3">
            <div class="flex items-center gap-2">
                <UsersIcon size={18} class="text-blue-500" />
                <h2
                    class="text-sm font-semibold text-foreground uppercase tracking-wider"
                >
                    Tim Di Balik Layar
                </h2>
            </div>
            <div
                class="bg-surface rounded-2xl p-5 border border-border shadow-sm"
            >
                <h3 class="font-medium text-foreground mb-1">
                    Genzi Meraih Mimpi
                </h3>
                <p class="text-xs text-muted mb-4">Jakarta, Indonesia</p>

                <p class="text-sm text-secondary leading-relaxed">
                    Kami adalah sekumpulan pemimpi yang ingin membuat dampak
                    positif bagi literasi keuangan di Indonesia.
                </p>

                <div class="mt-4 pt-4 border-t border-border flex gap-4">
                    <!-- <a
                        href="https://twitter.com/genzilabs"
                        target="_blank"
                        class="text-xs font-medium text-primary hover:underline"
                    >
                        Twitter / X
                    </a> -->
                    <a
                        href="https://instagram.com/genzilabs"
                        target="_blank"
                        class="text-xs font-medium text-primary hover:underline"
                    >
                        Instagram
                    </a>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <div class="text-center pt-8">
            <p class="text-[10px] text-muted-foreground">
                &copy; {new Date().getFullYear()} Genzi Meraih Mimpi. All rights
                reserved.
            </p>
        </div>
    </div>
</div>
