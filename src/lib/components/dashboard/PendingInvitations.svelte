<script lang="ts">
    import { onMount } from "svelte";
    import { collaborationApi } from "$lib/api";
    import type { Invitation } from "$lib/types/collaboration";
    import { Button } from "$lib/components/ui";
    import { toastStore } from "$lib/stores";

    let invitations = $state<Invitation[]>([]);
    let isLoading = $state(true);
    let processingId = $state<string | null>(null);

    onMount(() => {
        loadInvitations();
    });

    async function loadInvitations() {
        isLoading = true;
        try {
            const res = await collaborationApi.listInvitations();
            if (res.data) {
                invitations = res.data.invitations.filter(
                    (i) => i.status === "pending",
                );
            }
        } catch (e) {
            console.error("Failed to load invitations", e);
        } finally {
            isLoading = false;
        }
    }

    async function handleAccept(id: string) {
        processingId = id;
        try {
            const res = await collaborationApi.acceptInvitation(id);
            if (!res.error) {
                toastStore.success("Undangan diterima");
                invitations = invitations.filter((i) => i.id !== id);
                window.location.reload();
            } else {
                toastStore.error(res.error.error || "Gagal menerima undangan");
            }
        } catch (e) {
            toastStore.error("Gagal menerima undangan");
        } finally {
            processingId = null;
        }
    }

    async function handleReject(id: string) {
        if (!confirm("Tolak undangan ini?")) return;
        processingId = id;
        try {
            const res = await collaborationApi.rejectInvitation(id);
            if (!res.error) {
                toastStore.success("Undangan ditolak");
                invitations = invitations.filter((i) => i.id !== id);
            } else {
                toastStore.error(res.error.error || "Gagal menolak undangan");
            }
        } catch (e) {
            toastStore.error("Gagal menolak undangan");
        } finally {
            processingId = null;
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    function getRoleBadgeClasses(role: string) {
        switch (role) {
            case "admin":
                return "bg-primary/10 text-primary";
            case "editor":
                return "bg-emerald-500/10 text-emerald-600";
            default:
                return "bg-muted/20 text-muted";
        }
    }

    function getTypeLabel(type: string) {
        return type === "book" ? "Buku" : "Kantong";
    }
</script>

{#if invitations.length > 0}
    <div class="space-y-3">
        <div class="flex justify-between items-center">
            <h3 class="text-sm font-semibold text-foreground">
                Undangan Kolaborasi
            </h3>
        </div>

        <div class="space-y-3">
            {#each invitations as invitation (invitation.id)}
                <div class="bg-surface rounded-2xl border border-border p-4">
                    <div class="flex items-start gap-3">
                        <!-- Sender Avatar -->
                        {#if invitation.inviter_avatar}
                            <img
                                src={invitation.inviter_avatar}
                                alt={invitation.inviter_name ||
                                    invitation.inviter_email ||
                                    "Inviter"}
                                class="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                        {:else}
                            <div
                                class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0"
                            >
                                {(invitation.inviter_name ||
                                    invitation.inviter_email ||
                                    "?")[0].toUpperCase()}
                            </div>
                        {/if}

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap mb-1">
                                <span
                                    class="text-xs px-2 py-0.5 rounded-full {getRoleBadgeClasses(
                                        invitation.role,
                                    )}"
                                >
                                    {invitation.role}
                                </span>
                                <span class="text-xs text-muted">
                                    {getTypeLabel(invitation.type)}
                                </span>
                            </div>

                            <h4 class="font-semibold text-foreground truncate">
                                {invitation.target_name || "Unknown"}
                            </h4>

                            <p class="text-sm text-secondary mt-0.5">
                                Diundang oleh <span class="text-foreground"
                                    >{invitation.inviter_name ||
                                        invitation.inviter_email ||
                                        "Seseorang"}</span
                                >
                            </p>

                            {#if invitation.message}
                                <p class="text-sm text-muted mt-2 italic">
                                    "{invitation.message}"
                                </p>
                            {/if}

                            <p class="text-xs text-muted mt-2">
                                Diterima {formatDate(invitation.created_at)}
                            </p>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            fullWidth
                            disabled={processingId === invitation.id}
                            onclick={() => handleReject(invitation.id)}
                        >
                            Tolak
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            loading={processingId === invitation.id}
                            onclick={() => handleAccept(invitation.id)}
                        >
                            Terima
                        </Button>
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if}
