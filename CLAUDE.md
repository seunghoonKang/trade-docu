DISABLE_OMC=true

## Agent skills

### Issue tracker

Issues and PRDs are tracked as GitHub issues (`seunghoonKang/trade-docu`) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles, using default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Architecture — Feature-Sliced Design (MUST follow)

Layers, top → bottom: `app → pages → widgets → features → entities → shared`. Full rules in `docs/agents/fsd.md`.

1. **Downward imports only** — a layer imports lower layers, never higher/sideways-up (`shared` ↛ `entities`/`features`).
2. **No imports between slices on the same layer** — if siblings must share, move the shared thing **down** (push-down: value object/util → `shared`, domain type/data → `entities`; used by 1 place → colocate).
3. **Import only via a slice's public API (`index.ts`)** — no deep imports (`@/entities/invoice/model` ✗ → `@/entities/invoice` ✓; `shared` segments by path are fine).

Conventions: session/current-user → `entities/session`; `entities` = flat files + curated `index.ts`; segments named by purpose (`ui/ model/ lib/ api/ config/`, **no `hooks/`**); `shared` components stay dumb (inject domain data via props).

CI runs `npm run lint:fsd` (Steiger) and **blocks violating PRs** — plan to satisfy these from the start and run it before finishing.
