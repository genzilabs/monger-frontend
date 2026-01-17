# Monger Frontend Architecture

**Version:** 0.0.1  
**Framework:** SvelteKit (Svelte 5 with Runes)  
**Styling:** TailwindCSS v4 (Semantic Colors)  
**Language:** TypeScript  
**Package Manager:** pnpm

---

## Project Structure

```
monger-frontend/
├── src/
│   ├── app.css              # Global styles & design tokens
│   ├── app.html             # HTML template
│   ├── app.d.ts             # Type declarations
│   ├── hooks.client.ts      # Client-side hooks (Sentry)
│   ├── hooks.server.ts      # Server-side hooks
│   ├── lib/                  # Shared code library
│   │   ├── api/             # API client & endpoints
│   │   ├── assets/          # Static assets (images, fonts)
│   │   ├── components/      # Reusable components
│   │   ├── icons/           # SVG icon components
│   │   ├── stores/          # Global state management
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Helper functions
│   └── routes/              # SvelteKit file-based routing
│       ├── (auth)/          # Authentication flows
│       ├── (onboarding)/    # Welcome/onboarding screens
│       ├── (protected)/     # Authenticated app routes
│       ├── privacy/         # Privacy policy page
│       └── terms/           # Terms of service page
├── static/                   # Public static files
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
└── eslint.config.js
```

---

## Directory Details

### `/src/lib/api/` - API Layer

Centralized HTTP client and endpoint definitions. **No fetch calls in components!**

| File               | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `client.ts`        | Base HTTP client with auth headers, error handling |
| `auth.ts`          | Authentication endpoints (login, register, OTP)    |
| `books.ts`         | Book CRUD operations                               |
| `pockets.ts`       | Pocket (wallet/account) operations                 |
| `transactions.ts`  | Transaction management                             |
| `categories.ts`    | Category management                                |
| `collaboration.ts` | Book sharing & member management                   |
| `p2p.ts`           | Peer-to-peer transfer requests                     |

---

### `/src/lib/components/` - Component Library

Organized using **Atomic Design** principles:

```
components/
├── ui/                # Atoms/Molecules - Generic, reusable
│   ├── Button.svelte
│   ├── Input.svelte
│   ├── Card.svelte
│   ├── Badge.svelte
│   ├── BottomNavbar.svelte
│   ├── BottomSheet.svelte
│   ├── ResponsiveModal.svelte
│   ├── Toast.svelte
│   ├── Header.svelte
│   ├── Sidebar.svelte
│   └── ... (28+ components)
├── account/           # Account/profile feature components
├── auth/              # Authentication flow components
├── dashboard/         # Dashboard-specific organisms
│   ├── BalanceHeroCard.svelte
│   ├── UserHeader.svelte
│   ├── PocketCard.svelte
│   ├── TransactionList.svelte
│   ├── RecentTransactions.svelte
│   └── PendingInvitations.svelte
├── modals/            # Modal overlays
│   ├── CreateBookModal.svelte
│   ├── CreatePocketModal.svelte
│   ├── CreateTransactionModal.svelte
│   ├── EditBookModal.svelte
│   ├── EditPocketModal.svelte
│   ├── MembersListModal.svelte
│   └── InviteMemberModal.svelte
├── onboarding/        # Onboarding slides/flows
├── pockets/           # Pocket-specific components
└── transactions/      # Transaction-specific components
```

---

### `/src/lib/stores/` - State Management

Using **Svelte 5 Runes** (`$state`, `$derived`, `$effect`) in `.svelte.ts` files:

| Store                    | Purpose                                |
| ------------------------ | -------------------------------------- |
| `auth.svelte.ts`         | User authentication state, tokens      |
| `books.svelte.ts`        | Books, pockets, active book management |
| `transactions.svelte.ts` | Transaction data & operations          |
| `categories.svelte.ts`   | Categories for transactions            |
| `toast.svelte.ts`        | Toast notification queue               |
| `ui.svelte.ts`           | UI state (modals, sidebars)            |

---

### `/src/lib/types/` - TypeScript Definitions

Interfaces matching backend DTOs:

| File               | Contains                                 |
| ------------------ | ---------------------------------------- |
| `auth.ts`          | User, AuthResponse, UpdateProfileRequest |
| `book.ts`          | Book, Pocket, PocketType                 |
| `transaction.ts`   | Transaction, TransactionRequest          |
| `category.ts`      | Category definitions                     |
| `collaboration.ts` | BookMember, Invitation, P2PTransfer      |
| `api.ts`           | Generic API response types               |

---

### `/src/lib/icons/` - Icon Components

SVG icon components (31 icons):

- Navigation: `HomeIcon`, `ChevronLeftIcon`, `ChevronRightIcon`
- Actions: `EditIcon`, `TrashIcon`, `PlusIcon`, `CheckIcon`
- Finance: `WalletIcon`, `BankIcon`, `CashIcon`, `CreditCardIcon`
- UI: `BellIcon`, `SettingsIcon`, `UserIcon`, `EyeIcon`

---

### `/src/lib/utils/` - Utility Functions

| File            | Purpose                               |
| --------------- | ------------------------------------- |
| `currency.ts`   | Currency formatting (IDR, etc.)       |
| `storage.ts`    | LocalStorage wrapper with type safety |
| `validation.ts` | Form validation helpers               |

---

### `/src/routes/` - Page Routes

SvelteKit file-based routing with route groups:

```
routes/
├── +layout.svelte         # Root layout
├── +page.svelte           # Landing page (/)
├── +error.svelte          # Error page
├── (auth)/                # Auth route group
│   └── auth/
│       └── +page.svelte   # /auth
├── (onboarding)/          # Onboarding route group
│   └── welcome/
│       └── +page.svelte   # /welcome
├── (protected)/           # Protected routes (require auth)
│   ├── +layout.svelte     # Protected layout with navbar
│   ├── dashboard/
│   │   └── +page.svelte   # /dashboard
│   ├── account/
│   │   └── +page.svelte   # /account
│   ├── books/
│   │   └── [id]/
│   │       └── +page.svelte  # /books/:id
│   ├── pockets/
│   │   ├── +page.svelte   # /pockets
│   │   └── [id]/
│   │       └── +page.svelte  # /pockets/:id
│   ├── transactions/
│   │   └── +page.svelte   # /transactions
│   ├── settings/          # /settings/*
│   ├── invitations/       # /invitations
│   └── menu/              # /menu
├── privacy/               # /privacy
└── terms/                 # /terms
```

---

## Design System

### Color Tokens (from `app.css`)

```css
/* Primary Brand (Teal) */
--color-primary: #20a39e;
--color-primary-hover: #188987;

/* Backgrounds */
--color-background: #ffffff;
--color-surface: #f8fafc;

/* Text */
--color-foreground: #0f172a; /* Headings, body */
--color-secondary: #475569; /* Secondary text */
--color-muted: #94a3b8; /* Placeholders, icons */

/* Semantic */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;

/* Borders */
--color-border: #e2e8f0;
```

### Border Radius Tokens

```css
--radius-card: 1rem; /* Cards, containers */
--radius-button: 0.75rem; /* Buttons */
--radius-input: 0.75rem; /* Form inputs */
--radius-badge: 9999px; /* Badges, pills */
```

### Utility Classes

| Class                                             | Usage                |
| ------------------------------------------------- | -------------------- |
| `bg-primary`, `text-primary`                      | Primary brand color  |
| `bg-surface`, `bg-background`                     | Backgrounds          |
| `text-foreground`, `text-secondary`, `text-muted` | Text hierarchy       |
| `border-border`                                   | Standard borders     |
| `animate-fade-in`                                 | Fade-in animation    |
| `card`                                            | Card styling utility |

---

## Key Dependencies

| Package             | Version       | Purpose                 |
| ------------------- | ------------- | ----------------------- |
| `svelte`            | ^5.45.6       | UI framework            |
| `@sveltejs/kit`     | ^2.49.1       | Full-stack framework    |
| `tailwindcss`       | ^4.1.17       | Utility-first CSS       |
| `bits-ui`           | 1.0.0-next.98 | Headless UI components  |
| `lucide-svelte`     | ^0.562.0      | Icon library (extended) |
| `@sentry/sveltekit` | ^10.32.1      | Error tracking          |
| `clsx`              | ^2.1.1        | Class name utility      |
| `tailwind-merge`    | ^3.4.0        | Merge Tailwind classes  |
| `tailwind-variants` | ^3.2.2        | Variant-based styling   |

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm check

# Lint
pnpm lint
```

---

## Best Practices

### Component Design

1. **Keep UI components dumb** - No API calls in `/lib/components/ui/`
2. **Feature components** - Complex logic in feature folders (`dashboard/`, `auth/`)
3. **Extract reusable parts** - If it can be reused, make it a component
4. **Use Snippets** - For passing content instead of excessive props

### Styling

1. **Semantic colors only** - Use `bg-primary`, never `bg-blue-500`
2. **Mobile-first** - Design for mobile, scale up with `sm:`, `md:`
3. **Use design tokens** - Reference variables from `app.css`

### State Management

1. **Stores for logic** - API calls and data transformations in stores
2. **Components for rendering** - Components just display data
3. **Svelte 5 Runes** - Use `$state()`, `$derived()`, `$effect()`

### API Integration

1. **Centralized client** - All HTTP through `lib/api/client.ts`
2. **Typed responses** - Use interfaces from `lib/types/`
3. **Handle errors in stores** - Expose simple messages to UI

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Original architecture guide
- [COPY_GUIDELINE.md](./COPY_GUIDELINE.md) - Bahasa Indonesia copy guidelines

---

_Last updated: January 2026_
