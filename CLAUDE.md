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

## Shared UI components (MUST reuse — don't roll your own)

Before writing any raw form control or common UI element, **check `src/shared/ui` first** and reuse the shared component. Do not hand-roll a raw `<input>`, `<select>`, native date field, or spinner when a shared one exists.

Canonical components (`@/shared/ui`): **`Input`** (text/number fields), **`Select`** (dropdowns — never raw `<select>`), **`DatePicker`** (date selection — never `<input type="date">`, value is `"YYYY-MM-DD"`), **`Textarea`**, **`Button`**, **`Skeleton`** (loading placeholders — prefer skeletons over spinners for content areas), **`ConfirmDialog`**, **`ModalShell`**, **`FormSection`**, **`DatePicker`/`Select`/`Input` support `variant="editor"`** for the editor look. For inline/table inputs the shared classes `editorInputClassName` / `editorInlineInputClassName` exist.

Rules:
1. **Reuse over re-implement.** If a shared component fits, use it. Match the existing usage (e.g., `ItemsTableSection` uses `Input variant="editor"`).
2. **Verify before writing raw markup** — grep `src/shared/ui/index.ts`. Only build a local element when no shared one fits, and keep it dumb.
3. **Push shared things down** — if two slices need the same option list/util (e.g., `CURRENCY_OPTIONS` → `shared/config`), move it to `shared`, don't duplicate.
4. Segmented toggles (binary/short mode switches) have no shared component yet — a local segmented button group is acceptable; everything else uses the shared component above.
