<script lang="ts">
  import { Button, ResponsiveModal } from "$lib/components/ui";
  import { collaborationApi } from "$lib/api";
  import type { BookMember, CollaborationRole } from "$lib/types";
  import { onMount } from "svelte";

  interface Props {
    open: boolean;
    onClose: () => void;
    bookId: string;
    isOwner: boolean;
    onInvite: () => void;
  }

  let { open, onClose, bookId, isOwner, onInvite }: Props = $props();

  let members = $state<BookMember[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let confirmingRemove = $state<string | null>(null);

  $effect(() => {
    if (open && bookId) {
      loadMembers();
    }
  });

  async function loadMembers() {
    isLoading = true;
    error = null;

    const result = await collaborationApi.listBookMembers(bookId);

    if (result.error) {
      error = (result.error as any).error || "An error occurred";
    } else if (result.data) {
      members = result.data.members;
    }

    isLoading = false;
  }

  async function handleRemoveMember(userId: string) {
    const result = await collaborationApi.removeBookMember(bookId, userId);
    if (result.error) {
      error = (result.error as any).error || "An error occurred";
    } else {
      members = members.filter((m) => m.user_id !== userId);
    }
    confirmingRemove = null;
  }

  function getRoleBadgeClasses(role: string) {
    switch (role) {
      case "owner":
        return "bg-amber-500/20 text-amber-400";
      case "admin":
        return "bg-primary/20 text-primary";
      case "editor":
        return "bg-emerald-500/20 text-emerald-400";
      default:
        return "bg-muted/30 text-muted";
    }
  }
</script>

<ResponsiveModal {open} {onClose} title="Book Members">
  <div class="flex flex-col gap-4">
    {#if error}
      <div
        class="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
      >
        {error}
      </div>
    {/if}

    {#if isLoading}
      <div class="flex items-center justify-center py-8">
        <div
          class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"
        ></div>
      </div>
    {:else if members.length === 0}
      <div class="flex flex-col items-center justify-center py-8 text-center">
        <div
          class="w-12 h-12 mb-3 rounded-full bg-muted/20 flex items-center justify-center"
        >
          <svg
            class="w-6 h-6 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <p class="text-muted text-sm">No members yet</p>
      </div>
    {:else}
      <div class="flex flex-col gap-2">
        {#each members as member}
          <div
            class="flex items-center justify-between p-3 bg-surface rounded-xl border border-border"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
              >
                {#if member.user_avatar}
                  <img
                    src={member.user_avatar}
                    alt=""
                    class="w-10 h-10 rounded-full object-cover"
                  />
                {:else}
                  <span class="text-primary font-semibold text-sm">
                    {member.user_name?.charAt(0) || "?"}
                  </span>
                {/if}
              </div>
              <div class="min-w-0">
                <p class="font-medium text-foreground truncate">
                  {member.user_name || "Unknown"}
                </p>
                <p class="text-xs text-muted truncate">
                  {member.user_email || ""}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span
                class="text-xs px-2 py-1 rounded-full capitalize {getRoleBadgeClasses(
                  member.role
                )}"
              >
                {member.role}
              </span>

              {#if isOwner && member.role !== "owner" && confirmingRemove !== member.user_id}
                <button
                  onclick={() => (confirmingRemove = member.user_id)}
                  class="p-1.5 text-muted hover:text-red-400 transition-colors"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              {:else if isOwner && confirmingRemove === member.user_id}
                <div class="flex items-center gap-1">
                  <button
                    onclick={() => handleRemoveMember(member.user_id)}
                    class="px-2 py-1 text-xs bg-red-500 text-white rounded-lg"
                  >
                    Remove
                  </button>
                  <button
                    onclick={() => (confirmingRemove = null)}
                    class="px-2 py-1 text-xs bg-surface border border-border text-muted rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="flex gap-3 mt-6">
    {#if isOwner}
      <Button variant="primary" fullWidth onclick={onInvite}>
        <svg
          class="w-4 h-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
        Invite Member
      </Button>
    {/if}
    <Button variant="secondary" fullWidth onclick={onClose}>Close</Button>
  </div>
</ResponsiveModal>
