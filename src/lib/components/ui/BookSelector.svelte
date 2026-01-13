<script lang="ts">
  import { Combobox } from "$lib/components/ui";
  import { booksStore } from "$lib/stores";
  import type { ComboboxOption } from "$lib/components/ui";

  interface Props {
    value: string;
    onValueChange?: (value: string) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    excludeBookId?: string;
  }

  let {
    value = $bindable(),
    onValueChange,
    label = "Book",
    placeholder = "Select book",
    disabled = false,
    excludeBookId
  }: Props = $props();

  const options = $derived<ComboboxOption[]>(
    booksStore.books
      .filter(b => !excludeBookId || b.id !== excludeBookId)
      .map(b => ({
        value: b.id,
        label: b.name,
        icon: "📚" // Default book icon
      }))
  );
</script>

<Combobox
  {label}
  {value}
  {onValueChange}
  {options}
  {placeholder}
  searchPlaceholder="Search books..."
  emptyMessage="No books found"
  {disabled}
/>
