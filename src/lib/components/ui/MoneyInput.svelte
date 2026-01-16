<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    value?: string | number;
    placeholder?: string;
    class?: string;
    id?: string;
    oninput?: (e: Event) => void;
  }

  let {
    value = $bindable(""),
    placeholder = "0",
    class: className,
    id,
    oninput,
  }: Props = $props();

  // Format number with thousand separators
  function formatNumber(num: string) {
    return num.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Handle display value
  let displayValue = $state("");

  $effect(() => {
    // When external value changes, update display if not focused or aligned
    if (value !== undefined && value !== null) {
      const strVal = value.toString();
      // If we are just typing, we handle display update in handleInput
      // But if value comes from outside (edit mode init), we need to format it
      // Simple check: if removing dots from display doesn't match value, sync it
      const numericDisplay = displayValue.replace(/\./g, "");
      if (numericDisplay !== strVal) {
        displayValue = formatNumber(strVal);
      }
    } else {
      displayValue = "";
    }
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    let raw = target.value.replace(/\D/g, "");

    // Prevent leading zeros unless it's just "0"
    if (raw.length > 1 && raw.startsWith("0")) {
      raw = raw.replace(/^0+/, "");
    }

    displayValue = formatNumber(raw);
    value = raw; // Export clean number string

    if (oninput) oninput(e);
  }
</script>

<div class="relative">
  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium"
    >Rp</span
  >
  <input
    {id}
    type="tel"
    inputmode="numeric"
    value={displayValue}
    {placeholder}
    oninput={handleInput}
    class={cn(
      "w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground text-lg font-semibold placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all",
      className
    )}
  />
</div>
