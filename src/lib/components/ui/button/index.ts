/**
 * Button Component Exports
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { Button } from '$lib/components/ui/button';
 * </script>
 *
 * <Button variant="default" size="default">Click me</Button>
 * <Button variant="destructive" loading>Deleting...</Button>
 * ```
 */
export { default as Button } from './button.svelte';
export { buttonVariants, type ButtonVariant, type ButtonSize } from './button.variants';
