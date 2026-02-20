<script lang="ts">
  import type { TransactionFormState } from "./transactionForm.svelte";
  import { Combobox } from "$lib/components/ui";
  import type { ComboboxOption } from "$lib/components/ui";

  let {
    form,
    categoryOptions,
    subcategoryOptions,
    pocketOptions,
  }: {
    form: TransactionFormState;
    categoryOptions: ComboboxOption[];
    subcategoryOptions: ComboboxOption[];
    pocketOptions: ComboboxOption[];
  } = $props();
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <Combobox
    label="Kategori"
    options={categoryOptions}
    bind:value={form.categoryId}
    placeholder="Pilih kategori"
    searchPlaceholder="Cari..."
    emptyMessage="Kategori tidak ditemukan"
  />
  <Combobox
    label="Sub-kategori"
    options={subcategoryOptions}
    bind:value={form.subcategoryId}
    placeholder={form.categoryId ? "Pilih (opsional)" : "Pilih kategori dulu"}
    searchPlaceholder="Cari sub-kategori..."
    emptyMessage="Belum ada sub-kategori"
    disabled={!form.categoryId}
  />
</div>

<!-- Pocket Selector -->
<Combobox
  label="Kantong / Sumber Dana"
  options={pocketOptions}
  bind:value={form.pocketId}
  placeholder="Pilih kantong"
  searchPlaceholder="Cari..."
  emptyMessage="Belum ada kantong"
/>
