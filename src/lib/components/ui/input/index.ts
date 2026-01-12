/**
 * Input Component Exports
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { Input } from '$lib/components/ui/input';
 *   let email = $state('');
 * </script>
 *
 * <Input
 *   type="email"
 *   label="Email"
 *   placeholder="you@example.com"
 *   bind:value={email}
 *   error={emailError}
 * />
 * ```
 */
export { default as Input } from './input.svelte';
export { inputVariants, type InputSize } from './input.variants';
