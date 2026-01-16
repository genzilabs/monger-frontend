<script lang="ts">
  import type { Snippet } from "svelte";

  type ButtonVariant =
    | "primary"
    | "secondary"
    | "ghost"
    | "danger"
    | "outline"
    | "danger-outline";
  type ButtonSize = "sm" | "md" | "lg";

  interface Props {
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    onclick?: () => void;
    children: Snippet;
    icon?: Snippet;
    class?: string;
  }

  let {
    variant = "primary",
    size = "md",
    type = "button",
    disabled = false,
    loading = false,
    fullWidth = false,
    onclick,
    children,
    icon,
    class: className = "",
  }: Props = $props();

  const baseClasses = `
		inline-flex items-center justify-center gap-2
		font-semibold rounded-button
		transition-all duration-200 ease-out
		focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
		disabled:opacity-50 disabled:cursor-not-allowed
	`;

  const variantClasses: Record<ButtonVariant, string> = {
    primary: `
			bg-primary text-white
			hover:bg-primary-hover
			focus-visible:ring-primary
			shadow-button hover:shadow-lg
		`,
    secondary: `
			bg-surface text-foreground
			border border-border
			hover:bg-border
			focus-visible:ring-primary
		`,
    ghost: `
			bg-transparent text-muted-foreground
			hover:bg-surface hover:text-foreground
			focus-visible:ring-primary
		`,
    danger: `
			bg-error text-white
			hover:bg-red-600
			focus-visible:ring-error
			shadow-md hover:shadow-lg
		`,
    outline: `
			bg-transparent text-primary
			border border-border
			hover:bg-primary/5 hover:border-primary
			focus-visible:ring-primary
		`,
    "danger-outline": `
			bg-transparent text-red-500
			border border-red-300
			hover:bg-red-50 hover:border-red-400 hover:text-red-600
			focus-visible:ring-red-500
		`,
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };
</script>

<button
  {type}
  disabled={disabled || loading}
  {onclick}
  class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {fullWidth
    ? 'w-full'
    : ''} {className}"
>
  {#if loading}
    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  {:else if icon}
    {@render icon()}
  {/if}
  {@render children()}
</button>
