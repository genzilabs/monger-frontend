/**
 * Combobox Component (Searchable Select)
 *
 * A searchable dropdown that allows filtering options by typing.
 * Perfect for category selection, user search, etc.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { Combobox, type ComboboxOption } from '$lib/components/ui/combobox';
 *
 *   const categories: ComboboxOption[] = [
 *     { value: 'food', label: 'Food & Drinks', icon: '🍔' },
 *     { value: 'transport', label: 'Transportation', icon: '🚗' },
 *     { value: 'shopping', label: 'Shopping', icon: '🛍️' },
 *   ];
 *
 *   let selectedCategory = $state('');
 * </script>
 *
 * <Combobox
 *   label="Category"
 *   options={categories}
 *   bind:value={selectedCategory}
 *   placeholder="Select a category"
 *   searchPlaceholder="Search categories..."
 * />
 * ```
 */
export { default as Combobox } from './combobox.svelte';
export type { ComboboxOption } from './combobox.svelte';
