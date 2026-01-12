/**
 * Native Select Component
 *
 * A simple, accessible select using the native HTML select element.
 * Use this for simple select needs, or when bits-ui Select has issues.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { NativeSelect } from '$lib/components/ui/native-select';
 *   let category = $state('');
 * </script>
 *
 * <NativeSelect label="Category" bind:value={category} placeholder="Select a category">
 *   <option value="food">Food</option>
 *   <option value="transport">Transport</option>
 * </NativeSelect>
 * ```
 */
export { default as NativeSelect } from './native-select.svelte';
