# Feature-Sliced Design (FSD) — architecture rules

This project follows Feature-Sliced Design. **New code MUST satisfy these rules.**
CI runs `npm run lint:fsd` (Steiger) and blocks PRs that violate them — so plan
features to fit the rules from the start, and run `npm run lint:fsd` before finishing.

## Layers (top → bottom)

```
app → pages → widgets → features → entities → shared
```

- **app** — entry, providers, router, global config
- **pages** — route-level screens that compose slices (flat files; OK to lack a public API)
- **widgets** — self-contained UI blocks (InvoiceForm, AppSidebar, …)
- **features** — user actions (auth, export-pdf, draft-autosave, …)
- **entities** — domain models (invoice, seller, buyer, product, session)
- **shared** — business-agnostic reusables (ui, lib, config, i18n)

## The 3 import rules

1. **Downward imports only.** A layer may import lower layers, never higher and
   never sideways-up. `shared` must not import `entities`/`features`; `entities`
   must not import `features`; etc.
2. **No imports between slices on the same layer.** `features/auth` must not import
   `features/profile`. If two sibling slices need to share something, move the shared
   thing **down** (see push-down rule).
3. **Import only through a slice's public API (`index.ts`).** Never deep-import a
   slice's internal files.
   - ✗ `import { Invoice } from "@/entities/invoice/model"`
   - ✓ `import { Invoice } from "@/entities/invoice"`
   - (Importing `shared` segments by path — `@/shared/lib/utils`, `@/shared/ui` — is fine.)

## push-down rule (resolving a same-layer/upward dependency)

When two slices need to share something, or a slice reaches up:

- **(a) When to move down:** only when ≥2 sibling slices actually share it. If only
  one place uses it, **colocate it there** instead.
- **(b) Where to move it — decided by the thing's *nature*, not how many use it:**
  - value object / pure util / contract type → `shared`
  - domain type / domain data access → `entities`

Examples applied in this codebase: data op `upsertSeller` + domain type `SellerProfile`
→ `entities/seller`; generic UI (language switcher, ProfileSectionCard) → `shared/ui`;
DOM capture util `invoiceCapture` → `shared/lib`; nav config `mainNavItems` → `shared/config`.

## Conventions

- **Session / current user** lives in `entities/session` (the `<SessionProvider>` is
  rendered by `app`, but the state/hook live in the entity). Don't put shared app
  state in the `app` layer for lower layers to reach up to.
- **entities** use flat files + a **curated** `index.ts` — export only what's consumed
  externally; keep internal helpers private.
- **Segments are named by purpose**, not by technical kind: `ui/ model/ lib/ api/ config/`.
  Do **not** create a `hooks/` segment — hooks go in `lib/`.
- A `shared` component that needs domain data stays dumb: inject the data via props
  (e.g. `Layout`'s `showSidebar`) rather than importing upward.

## Checking

```bash
npm run lint:fsd     # Steiger — must report "No problems found"
npx tsc -b           # types
npx vitest run       # tests
```

Visualize actual import flow (optional): `npx madge --image dep.svg src`,
cycles: `npx madge --circular src`.
