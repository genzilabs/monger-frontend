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
                return "bg-primary/20 text-primary";
            case "editor":
                return "bg-emerald-500/20 text-emerald-400";
            default:
                return "bg-muted/30 text-muted";
        }
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
                <div class="p-4 bg-surface rounded-2xl border border-border">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span
                                    class="text-xs uppercase font-semibold tracking-wider text-muted"
                                >
                                    {invitation.type}
                                </span>
                                <span
                                    class="text-xs px-2 py-0.5 rounded-full capitalize {getRoleBadgeClasses(
                                        invitation.role,
                                    )}"
                                >
                                    {invitation.role}
                                </span>
                            </div>

                            <h3
                                class="font-semibold text-foreground mt-1 truncate"
                            >
                                {invitation.target_name || "Unknown"}
                            </h3>

                            <p class="text-sm text-muted mt-1">
                                Invited by <span class="text-secondary"
                                    >{invitation.inviter_name ||
                                        invitation.inviter_email ||
                                        "Someone"}</span
                                >
                            </p>

                            {#if invitation.message}
                                <p class="text-sm text-muted mt-2 italic">
                                    "{invitation.message}"
                                </p>
                            {/if}

                            <div
                                class="flex items-center gap-3 mt-2 text-xs text-muted"
                            >
                                <span
                                    >Received {formatDate(
                                        invitation.created_at,
                                    )}</span
                                >
                                {#if invitation.expires_at}
                                    <span
                                        >• Expires {formatDate(
                                            invitation.expires_at,
                                        )}</span
                                    >
                                {/if}
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2 mt-4">
                        <Button
                            variant="primary"
                            fullWidth
                            loading={processingId === invitation.id}
                            onclick={() => handleAccept(invitation.id)}
                        >
                            Accept
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            disabled={processingId === invitation.id}
                            onclick={() => handleReject(invitation.id)}
                        >
                            Decline
                        </Button>
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if}
