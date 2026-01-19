<script lang="ts">
  import { Button, ResponsiveModal } from "$lib/components/ui";
  import { NativeSelect } from "$lib/components/ui/native-select";
  import { collaborationApi } from "$lib/api";
  import type { BookMember, CollaborationRole } from "$lib/types";
  import { Pencil, Check, X, Trash2 } from "lucide-svelte";
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
  let editingMemberId = $state<string | null>(null);
  let editingRole = $state<string>("");
  let isUpdating = $state(false);

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

  function startEditing(member: BookMember) {
    editingMemberId = member.user_id;
    editingRole = member.role;
    confirmingRemove = null;
  }

  function cancelEditing() {
    editingMemberId = null;
    editingRole = "";
  }

  async function saveRole(userId: string) {
    if (!editingRole) return;
    
    isUpdating = true;
    error = null;

    const result = await collaborationApi.updateBookMember(bookId, userId, {
      role: editingRole as CollaborationRole
    });

    if (result.error) {
      error = (result.error as any).error || "Failed to update role";
    } else {
      // Update local state
      members = members.map(m => 
        m.user_id === userId ? { ...m, role: editingRole as CollaborationRole } : m
      );
      cancelEditing();
    }
    
    isUpdating = false;
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

<ResponsiveModal {open} {onClose} title="Anggota Buku">
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
        <p class="text-muted text-sm">Belum ada anggota</p>
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
              {#if editingMemberId === member.user_id}
                <div class="flex items-center gap-1">
                  <div class="w-24">
                    <NativeSelect
                      bind:value={editingRole}
                      class="h-8 py-1 text-xs"
                      aria-label="Role"
                      disabled={isUpdating}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </NativeSelect>
                  </div>
                  <button
                    onclick={() => saveRole(member.user_id)}
                    class="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    disabled={isUpdating}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onclick={cancelEditing}
                    class="p-1.5 text-muted hover:bg-muted/10 rounded-lg transition-colors"
                    disabled={isUpdating}
                  >
                    <X size={16} />
                  </button>
                </div>
              {:else}
                <span
                  class="text-xs px-2 py-1 rounded-full capitalize {getRoleBadgeClasses(
                    member.role
                  )}"
                >
                  {member.role}
                </span>

                {#if isOwner && member.role !== "owner"}
                   {#if confirmingRemove !== member.user_id}
                      <button
                        onclick={() => startEditing(member)}
                        class="p-1.5 text-muted hover:text-primary transition-colors"
                        title="Edit Role"
                      >
                        <Pencil size={14} />
                      </button>
                      
                      <button
                        onclick={() => (confirmingRemove = member.user_id)}
                        class="p-1.5 text-muted hover:text-red-400 transition-colors"
                        title="Remove Member"
                      >
                       <Trash2 size={14} />
                      </button>
                   {:else}
                      <div class="flex items-center gap-1 animate-fade-in">
                        <button
                          onclick={() => handleRemoveMember(member.user_id)}
                          class="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Hapus
                        </button>
                        <button
                          onclick={() => (confirmingRemove = null)}
                          class="px-2 py-1 text-xs bg-surface border border-border text-muted rounded-lg hover:bg-surface-elevated"
                        >
                          Batal
                        </button>
                      </div>
                   {/if}
                {/if}
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
        Undang Anggota
      </Button>
    {/if}
    <Button variant="secondary" fullWidth onclick={onClose}>Tutup</Button>
  </div>
</ResponsiveModal>
