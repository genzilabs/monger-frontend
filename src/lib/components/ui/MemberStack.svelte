<script lang="ts">
  import type { BookMember } from "$lib/types/collaboration";

  interface Props {
    members: BookMember[];
    maxDisplay?: number;
    size?: "sm" | "md";
  }

  let { members, maxDisplay = 3, size = "sm" }: Props = $props();

  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
  };

  const displayMembers = $derived(members.slice(0, maxDisplay));
  const remainingCount = $derived(Math.max(0, members.length - maxDisplay));
</script>

<div class="flex items-center -space-x-2">
  {#each displayMembers as member (member.id)}
    <div
      class="{sizeClasses[size]} rounded-full ring-2 ring-surface bg-surface-elevated flex items-center justify-center overflow-hidden"
      title={member.user_name}
    >
      {#if member.user_avatar}
        <img
          src={member.user_avatar}
          alt={member.user_name}
          class="w-full h-full object-cover"
        />
      {:else}
        <span class="font-bold text-muted">
          {member.user_name?.charAt(0).toUpperCase() || "?"}
        </span>
      {/if}
    </div>
  {/each}

  {#if remainingCount > 0}
    <div
      class="{sizeClasses[size]} rounded-full ring-2 ring-surface bg-primary/10 flex items-center justify-center"
    >
      <span class="font-bold text-primary">+{remainingCount}</span>
    </div>
  {/if}
</div>
