/**
 * Card Component Exports
 *
 * Composable card components following shadcn patterns.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui/card';
 * </script>
 *
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description goes here</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card content</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
export { default as Card } from './card.svelte';
export { default as CardHeader } from './card-header.svelte';
export { default as CardTitle } from './card-title.svelte';
export { default as CardDescription } from './card-description.svelte';
export { default as CardContent } from './card-content.svelte';
export { default as CardFooter } from './card-footer.svelte';
