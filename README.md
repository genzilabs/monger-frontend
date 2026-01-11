# Monger Frontend

The modern web interface for the Monger financial ledger system, built with efficiency and user experience in mind.

## Tech Stack

- **SvelteKit** — Full-stack framework
- **TypeScript** — Type safety
- **TailwindCSS** — Utility-first styling
- **Sentry** — Error monitoring and performance tracing
- **Vite** — Next-generation frontend tooling

## Features

- **Dashboard**: Real-time overview of your finances.
- **Transactions**: Advanced transaction management with category and pocket tagging.
- **Pockets**: Organize your money into separate buckets (savings, spending, etc.).
- **Categories**: Detailed categorization for income and expenses.
- **Responsive Design**: Optimized for both desktop and mobile usage.

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Setup

1. **Clone the repository:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
   
   required variables:
   - `PUBLIC_API_URL`: URL of the backend API (e.g., `http://localhost:8080/api/v1`)
   - `PUBLIC_SENTRY_DSN`: Your Sentry DSN for error monitoring

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run check    # Run Svelte check and TypeScript validation
npm run lint     # Lint code
```
