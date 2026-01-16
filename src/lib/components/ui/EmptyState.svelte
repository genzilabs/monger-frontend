<script lang="ts">
  import { type Snippet } from "svelte";

  interface Props {
    title: string;
    description?: string;
    icon?: Snippet;
    action?: Snippet;
    class?: string;
  }

  let {
    title,
    description,
    icon,
    action,
    class: className = "",
  }: Props = $props();
</script>

<div class="py-10 text-center flex flex-col items-center {className}">
  {#if icon}
    <div
      class="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary"
    >
      {@render icon()}
    </div>
  {/if}

  <h2 class="text-lg font-semibold text-foreground mb-2">
    {title}
  </h2>

  {#if description}
    <p class="text-secondary max-w-xs mx-auto mb-6">
      {description}
    </p>
  {/if}

  {#if action}
    {@render action()}
  {/if}
</div>
