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
  <path d="M9 5l7 7-7 7" />
</svg>
