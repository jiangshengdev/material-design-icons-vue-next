# Copilot Instructions

## Architecture
- Package entry `src/index.ts` re-exports the shared factories in `src/components` and every generated icon from `src/icons`, so treat icons as data files built atop `createIconComponent` and `MDIcon`.
- `createIconComponent` (`src/components/createIconComponent.tsx`) centralizes variant selection, CSS class naming, and the `md-icon` wrapper; individual icon files should stay declarative (name, iconName, svgMap only).
- Source SVGs live under `material-design-icons-4.0.0/src/{category}/{icon}/{variant}/24px.svg`; generators read them directly, so keep that tree intact when updating assets.
- Demo playground code under `playground/` mounts `playground/views/IconPanes.tsx` (generated) which consumes the published bundle via the `@` alias, so UI tweaks usually belong in templates under `scripts/templates`.

## Icon Generation Workflow
- Run `pnpm icons` (see `scripts/build-icons.ts`) whenever SVG sources, templates, or helpers change; it cleans `src/icons` + `playground/views/icons`, regenerates components, sub-indexes, the root index, and demo panes.
- `scripts/tasks/generate-icons.ts` enforces category/variant scanning, duplicate handling (`DuplicateNameHandler`), SVG normalization (`scripts/utils/svg-converter.ts`), and writes PascalCase `MDI*` components by calling `icon-template`—never hand-edit `src/icons/**`.
- `scripts/tasks/generate-index.ts` and `scripts/tasks/generate-demo.ts` rely on `iconCategories` from `scripts/helpers.ts`; extend that list when onboarding new Material categories to keep exports and demo panes in sync.
- The generator formats everything through `scripts/helpers.format`, which loads `.prettierrc.json`; if formatting drifts, fix the config rather than post-processing outputs.

## Builds & Tooling
- Library bundling goes through `tsdown` (`tsdown.config.ts`) with `fromVite: true` to reuse the Vite resolver; use `pnpm build` for release output in `dist/` and `pnpm dev` for watch mode.
- Playground/dev server commands are separate: `pnpm play` runs Vite against `playground`, while `pnpm play:build` runs `pnpm type-check` before `vite build` via run-parallel.
- `pnpm prepublishOnly` already runs `icons` then `build`; keep those scripts idempotent because publishing depends on them.
- Linting stacks `oxlint` (fast rules with `-D correctness`) and ESLint via `pnpm lint`; prefer fixing oxlint complaints first because ESLint is configured to trust its auto-fixes.

## Testing & QA
- Unit/property tests live in `src/components/__tests__`; `pnpm test:unit` runs Vitest + fast-check and dynamically imports every icon for snapshot coverage (`icon.test.ts`), so expect long runtimes unless you scope with `vitest run src/components/__tests__/icon.property.test.ts -t "..."`.
- Playwright specs in `e2e/vue.spec.ts` assume the playground server; `pnpm test:e2e` starts `pnpm play` locally or `pnpm preview` on CI per `playwright.config.ts`—build the project first when running in CI-like environments.
- Snapshot updates should only happen after regenerating icons; otherwise `src/components/__tests__/__snapshots__/icon.test.ts.snap` will be out of sync with `src/icons/**`.

## Coding Conventions
- Icon names always start with `MDI` and use PascalCase derived via `getComponentName`; duplicates receive a category prefix per `DuplicateNameHandler`, so new helpers must respect that API.
- CSS classes follow `mdi-{kebab}` (filled) or `mdi-{kebab}-{variant}`; `MDIcon` already prepends `md-icon`, so extra wrappers should extend those classes rather than replace them.
- Templates in `scripts/templates/*.ts` are the single source of truth for generated code and demo markup—edit those when changing component structure, then rerun `pnpm icons`.
- Use the `@` alias (to `src/`) everywhere except inside generation scripts, which run under Node and rely on relative paths; mixing the two will break tsdown and Vitest references.
