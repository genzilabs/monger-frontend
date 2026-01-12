/**
 * Dialog Component Exports
 *
 * Accessible dialog/modal using bits-ui primitives.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import {
 *     Dialog,
 *     DialogContent,
 *     DialogHeader,
 *     DialogTitle,
 *     DialogDescription,
 *     DialogFooter,
 *     DialogClose
 *   } from '$lib/components/ui/dialog';
 *   import { Button } from '$lib/components/ui/button';
 *
 *   let open = $state(false);
 * </script>
 *
 * <Button onclick={() => open = true}>Open Dialog</Button>
 *
 * <Dialog bind:open>
 *   <DialogContent>
 *     <DialogClose />
 *     <DialogHeader>
 *       <DialogTitle>Dialog Title</DialogTitle>
 *       <DialogDescription>Dialog description goes here.</DialogDescription>
 *     </DialogHeader>
 *     <div>Main content</div>
 *     <DialogFooter>
 *       <Button variant="secondary" onclick={() => open = false}>Cancel</Button>
 *       <Button>Confirm</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
export { default as Dialog } from './dialog.svelte';
export { default as DialogContent } from './dialog-content.svelte';
export { default as DialogHeader } from './dialog-header.svelte';
export { default as DialogTitle } from './dialog-title.svelte';
export { default as DialogDescription } from './dialog-description.svelte';
export { default as DialogFooter } from './dialog-footer.svelte';
export { default as DialogClose } from './dialog-close.svelte';
