# Tablora Frontend (Таблора)

This project is built with **Next.js App Router** following the **Feature-Sliced Design (FSD) v2.1** architectural methodology and styled with **shadcn/ui** and **Tailwind CSS**.

---

## Directory Architecture

```text
frontend/
├── app/                        # Next.js App Router (Routing only, no business logic)
│   ├── layout.tsx              # Root layout mounting @/_app/styles/globals.css & Providers
│   └── page.tsx                # Thin route re-exporting from @/_pages/home
├── src/                        # FSD Layers
│   ├── _app/                   # App layer: initialization, global styles, providers
│   │   ├── providers/          # Root React context providers
│   │   └── styles/             # Global CSS & Tailwind configuration (globals.css)
│   ├── _pages/                 # Pages layer: route-level composition & page logic
│   │   └── home/               # Home page slice (ui/HomePage.tsx, index.ts)
│   └── shared/                 # Shared layer: infrastructure without business logic
│       ├── ui/                 # UI kit & shadcn primitives (Button, etc.)
│       ├── lib/                # Reusable utilities (cn, helpers)
│       ├── api/                # API client & base transport types
│       └── config/             # App-wide constants & environment flags
├── components.json             # shadcn/ui configuration with FSD path mappings
├── tailwind.config.ts          # Tailwind CSS theme configuration
├── tsconfig.json               # Path aliases configuration
└── package.json
```

---

## Key FSD Rules & Conventions

1. **Underscore Prefix (`_app/`, `_pages/`)**:
   Next.js uses `app/` and `pages/` at root for routing. In FSD, the corresponding layers inside `src/` are prefixed with `_` (`src/_app`, `src/_pages`) to avoid naming collisions and satisfy the FSD linter (`steiger`).
2. **Public API Contract**:
   Every slice must export through its `index.ts`. External consumers must import from `@/layer/slice` and never reach into slice internals directly.
3. **Layer Hierarchy**:
   A module may only import from layers strictly below it:
   `app` $\rightarrow$ `_pages` $\rightarrow$ `features` $\rightarrow$ `entities` $\rightarrow$ `shared`.
4. **Minimal Layers First**:
   Start with `_app/`, `_pages/`, and `shared/`. Add `features/` or `entities/` only when the extraction rule holds (confirmed multi-use with independent reason to change).
5. **shadcn/ui Integration**:
   UI primitives added via shadcn CLI land directly in `src/shared/ui/` with `cn` located in `src/shared/lib/utils.ts`.

---

## Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting
- `npm run lint:fsd` - Validate FSD architectural rules using Steiger

