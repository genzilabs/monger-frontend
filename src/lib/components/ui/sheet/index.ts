/**
 * Sheet Component Exports
 *
 * Mobile-friendly slide-out panel (drawer/bottom sheet).
 *
 * Usage:
 * ```svelte
 * <script>
 *   import {
 *     Sheet,
 *     SheetContent,
 *     SheetHeader,
 *     SheetTitle,
 *     SheetDescription,
 *     SheetFooter
 *   } from '$lib/components/ui/sheet';
 *
 *   let open = $state(false);
 * </script>
 *
 * <Sheet bind:open>
 *   <SheetContent side="bottom">
 *     <SheetHeader>
 *       <SheetTitle>Sheet Title</SheetTitle>
 *       <SheetDescription>Optional description</SheetDescription>
 *     </SheetHeader>
 *     <div class="py-4">Content here</div>
 *     <SheetFooter>
 *       <Button onclick={() => open = false}>Close</Button>
 *     </SheetFooter>
 *   </SheetContent>
 * </Sheet>
 * ```
 */
export { default as Sheet } from './sheet.svelte';
export { default as SheetContent } from './sheet-content.svelte';
export { default as SheetHeader } from './sheet-header.svelte';
export { default as SheetTitle } from './sheet-title.svelte';
export { default as SheetDescription } from './sheet-description.svelte';
export { default as SheetFooter } from './sheet-footer.svelte';
