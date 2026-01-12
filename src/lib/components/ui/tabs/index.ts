/**
 * Tabs Component Exports
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
 * </script>
 *
 * <Tabs value="account">
 *   <TabsList>
 *     <TabsTrigger value="account">Account</TabsTrigger>
 *     <TabsTrigger value="settings">Settings</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="account">Account content</TabsContent>
 *   <TabsContent value="settings">Settings content</TabsContent>
 * </Tabs>
 * ```
 */
export { default as Tabs } from './tabs.svelte';
export { default as TabsList } from './tabs-list.svelte';
export { default as TabsTrigger } from './tabs-trigger.svelte';
export { default as TabsContent } from './tabs-content.svelte';
