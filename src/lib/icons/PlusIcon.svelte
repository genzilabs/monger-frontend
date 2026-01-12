<script lang="ts">
  interface Props {
    class?: string;
    size?: number;
  }

  let { class: className = "", size = 24 }: Props = $props();
</script>

<svg
  class={className}
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
</svg>
