# Frontend Architecture & Best Practices

This document outlines the project structure and best practices for the **Monger** frontend. Future development **must** adhere to these guidelines to maintain an "enterprise-grade," clean, and maintainable codebase.

## 1. Technology Stack
- **Framework:** SvelteKit (Svelte 5 with Runes)
- **Styling:** TailwindCSS v4 (Semantic Colors)
- **Language:** TypeScript
- **Package Manager:** pnpm

## 2. Directory Structure

```
frontend/src/
├── lib/
│   ├── api/             # API Client & Endpoints (No fetch calls in UI!)
│   ├── components/      # Atomic Design Components
│   │   ├── ui/          # [Atoms/Molecules] Generic, dumb components (Button, Input, Card)
│   │   ├── auth/        # Auth-specific feature components
│   │   ├── dashboard/   # Dashboard-specific organisms
│   │   ├── modals/      # Reusable modal overlays
│   │   └── onboarding/  # Onboarding specific slides/flows
│   ├── stores/          # Global State (Svelte 5 Runes *.svelte.ts)
│   ├── types/           # TypeScript interfaces (matching Backend DTOs)
│   └── utils/           # Helper functions (validation, formatting)
└── routes/
    ├── (auth)/          # Authentication flows (Login, Register, Verify)
    ├── (onboarding)/    # Welcome flows
    └── (protected)/     # App Routes (Dashboard, Books)
```

## 3. Best Practices

### A. Component Design (Atomic Principles)
1.  **Keep it Dumb:** UI components (`lib/components/ui`) should not contain business logic or API calls.
2.  **Feature Components:** Complex logic belongs in feature folders (e.g., `dashboard/`, `auth/`).
3.  **Extract Reusable Components:** Always extract UI parts into components if they can be reused or if they represent a distinct logical unit, regardless of file size.
4.  **Composition:** Use **Snippets** and **Slots** to pass content rather than excessive props.

### B. Styling & Theming
1.  **Semantic Colors ONLY:** Never use hardcoded hex codes (e.g., `#6366F1`) or `var(...)` manually.
    *   ✅ Use: `bg-primary`, `text-foreground`, `border-border`
    *   ❌ Avoid: `bg-blue-500`, `text-[#000]`, `var(--color-primary)`
2.  **Mobile First:** Design for mobile touch targets first, then scale up using `sm:`, `md:` classes.
3.  **Animations:** Use utility classes like `animate-fade-in` (defined in `app.css`) for smooth transitions.

### C. State Management
1.  **Svelte 5 Runes:** Use `$state()`, `$derived()`, and `$effect()` in `.svelte.ts` store files.
2.  **Separation:** Stores handle logic and data fetching; Components just render.
3.  **Example:** `booksStore.loadBooks()` should be called, not `fetch('/api/books')` inside a component.

### D. API Integration
1.  **Centralized Client:** All HTTP calls go through `lib/api/client.ts`.
2.  **Typed Responses:** Always type the API return values using interfaces from `lib/types`.
3.  **Error Handling:** Handle errors in the store or helper layer, exposing simple error messages to the UI.

## 4. Development Workflow
1.  **Refactor First:** Before adding features, check if existing components can be reused.
2.  **Clean Code:** Remove unused imports and legacy code immediately.
3.  **Type Safety:** No `any`. Define proper interfaces for Props and Data.
