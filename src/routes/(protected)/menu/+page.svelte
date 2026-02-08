<script lang="ts">
  import {
    BookIcon,
    WalletIcon,
    SettingsIcon,
    UserIcon,
    ShieldIcon,
    BellIcon,
    LogOutIcon,
    TagIcon,
    CreditCardIcon,
    RepeatIcon,
    PaperPlaneIcon,
    MessageIcon,
    ChevronRightIcon,
  } from "$lib/icons";
  import { getLatestVersion } from "$lib/data/updates";
  import { authStore } from "$lib/stores";
  import { goto } from "$app/navigation";

  const menuSections = [
    {
      title: "Akun",
      items: [
        {
          label: "Profil Saya",
          href: "/account?view=profile",
          icon: UserIcon,
          color: "text-indigo-600",
          bg: "bg-indigo-100",
        },
        {
          label: "Keamanan",
          href: "/account?view=security",
          icon: ShieldIcon,
          color: "text-rose-600",
          bg: "bg-rose-100",
        },
      ],
    },
    {
      title: "Pengelolaan",
      items: [
        {
          label: "Buku",
          href: "/books",
          icon: BookIcon,
          color: "text-blue-600",
          bg: "bg-blue-100",
        },
        {
          label: "Kantong",
          href: "/pockets",
          icon: WalletIcon,
          color: "text-emerald-600",
          bg: "bg-emerald-100",
        },
        {
          label: "Transaksi Rutin",
          href: "/recurring",
          icon: RepeatIcon,
          color: "text-teal-600",
          bg: "bg-teal-100",
        },
        {
          label: "Undangan",
          href: "/invitations",
          icon: PaperPlaneIcon,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
        },
      ],
    },
    {
      title: "Preferensi",
      items: [
        {
          label: "Kategori",
          href: "/settings/categories",
          icon: TagIcon,
          color: "text-purple-600",
          bg: "bg-purple-100",
        },
        {
          label: "Tipe Kantong",
          href: "/settings/pocket-types",
          icon: CreditCardIcon,
          color: "text-sky-600",
          bg: "bg-sky-100",
        },
        {
          label: "Pengaturan App",
          href: "/account?view=settings",
          icon: SettingsIcon,
          color: "text-orange-600",
          bg: "bg-orange-100",
        },
      ],
    },

    {
      title: "Lainnya",
      items: [
        {
          label: "Pembaruan",
          href: "/menu/updates",
          icon: BellIcon,
          color: "text-lime-600",
          bg: "bg-lime-100",
        },
        {
          label: "Tentang Monger",
          href: "/about",
          icon: ShieldIcon,
          color: "text-indigo-600",
          bg: "bg-indigo-100",
        },
        {
          label: "Beri Masukan",
          href: "/feedback",
          icon: MessageIcon,
          color: "text-violet-600",
          bg: "bg-violet-100",
        },
      ],
    },
  ];

  /*
   * Share functionality
   */
  async function shareApp() {
    const shareData = {
      title: "Monger - Catat Keuanganmu",
      text: "Yuk atur keuangan lebih mudah dengan Monger! Aplikasi pencatat keuangan yang simpel dan modern.",
      url: window.location.origin, // Or specific landing page URL
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`,
        );
        alert("Link berhasil disalin ke clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  }
</script>

<svelte:head>
  <title>Menu - Monger</title>
</svelte:head>

<div class="container mx-auto space-y-6 md:pb-6">
  <div class="flex items-center justify-between px-1">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Menu</h1>
      <p class="text-sm text-secondary mt-1">Semua fitur dalam satu tempat.</p>
    </div>
  </div>

  <div class="space-y-6">
    {#each menuSections as section}
      <div class="space-y-2">
        <h2
          class="text-xs font-semibold text-muted uppercase tracking-wider px-1"
        >
          {section.title}
        </h2>
        <div
          class="bg-surface rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-sm"
        >
          {#each section.items as item}
            <a
              href={item.href}
              class="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors active:bg-muted/50 group"
            >
              <div
                class="{item.bg} {item.color} w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              >
                <item.icon size={18} />
              </div>
              <span class="text-sm font-medium text-foreground flex-1">
                {item.label}
              </span>
              <ChevronRightIcon size={16} class="text-muted/50" />
            </a>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Social Share Section -->
  <div class="space-y-2">
    <h2 class="text-xs font-semibold text-muted uppercase tracking-wider px-1">
      Bagikan
    </h2>
    <div
      class="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm"
    >
      <button
        onclick={shareApp}
        class="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors active:bg-muted/50 group"
      >
        <div
          class="bg-pink-100 text-pink-600 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        >
          <PaperPlaneIcon size={18} />
        </div>
        <span class="text-sm font-medium text-foreground flex-1 text-left">
          Ajak Teman Pakai Monger
        </span>
        <ChevronRightIcon size={16} class="text-muted/50" />
      </button>
    </div>
  </div>

  <div class="pt-8 pb-4 flex flex-col items-center gap-6">
    <!-- Version Info -->
    <p class="text-[10px] text-muted-foreground tracking-widest opacity-60">
      Monger v{getLatestVersion()} • By Genzi Meraih Mimpi
    </p>
  </div>
</div>
