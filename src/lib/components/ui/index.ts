/**
 * UI Components Index
 *
 * Enterprise-grade shadcn-svelte component library.
 * All components follow SOLID principles with consistent APIs.
 *
 * Usage:
 * ```svelte
 * import { Button, Input, Card } from '$lib/components/ui';
 * ```
 */

// ============================================
// CORE COMPONENTS
// ============================================

// Button
export { Button, buttonVariants, type ButtonVariant, type ButtonSize } from './button';

// Input
export { Input, inputVariants, type InputSize } from './input';

// Textarea
export { Textarea } from './textarea';

// Label
export { Label } from './label';

// ============================================
// LAYOUT COMPONENTS
// ============================================

// Card
export {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter
} from './card';

// Separator
export { Separator } from './separator';

// ============================================
// OVERLAY COMPONENTS
// ============================================

// Dialog
export {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose
} from './dialog';

// Sheet (Bottom Sheet / Drawer)
export {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter
} from './sheet';

// ============================================
// NAVIGATION COMPONENTS
// ============================================

// Tabs
export {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent
} from './tabs';

// ============================================
// FORM COMPONENTS
// ============================================

// Native Select (simple, reliable)
export { NativeSelect } from './native-select';

// Combobox (searchable select)
export { Combobox, type ComboboxOption } from './combobox';

// ============================================
// DATA DISPLAY COMPONENTS
// ============================================

// Badge
export { Badge, badgeVariants, type BadgeVariant, type BadgeSize } from './badge';

// Avatar
export { Avatar, avatarVariants, type AvatarSize } from './avatar';

// ============================================
// FEEDBACK COMPONENTS
// ============================================

// Loader
export { Loader } from './loader';

// Skeleton
export { Skeleton } from './skeleton';

// ============================================
// UTILITY COMPONENTS
// ============================================

// IconButton
export { IconButton } from './icon-button';

// ============================================
// LEGACY EXPORTS (for backward compatibility during migration)
// These are existing components that haven't been migrated yet.
// Plan: Gradually migrate to new shadcn-style components
// ============================================

// Layout Components
export { default as BottomNavbar } from './BottomNavbar.svelte';
export { default as BookSwitcher } from './BookSwitcher.svelte';
export { default as BottomSheet } from './BottomSheet.svelte';

// Form Components
export { default as OTPInput } from './OTPInput.svelte';

// Feedback Components
export { default as ProgressSteps } from './ProgressSteps.svelte';
export { default as ErrorAlert } from './ErrorAlert.svelte';

// Display Components
export { default as Divider } from './Divider.svelte';
export { default as IconBox } from './IconBox.svelte';
export { default as Logo } from './Logo.svelte';
export { default as TabSwitcher } from './TabSwitcher.svelte';

// Social/Auth Components
export { default as SocialButtons } from './SocialButtons.svelte';
export { default as AvatarUpload } from './AvatarUpload.svelte';
