# Mahakam GeoAI Decision Support

A local, interactive spatial screening dashboard for the BRINATHON Mahakam pilot: **WHERE → WHY → WHAT NEXT**. STEP54 is its sole scientific data source. No chatbot, model execution, deployment, regulatory automation, or new scientific scores are included.

The product presentation includes a project overview, persistent section navigation, an emerald/navy visual identity, and a responsive spatial workspace. `components/dashboard/ProjectShell.tsx` owns project navigation and framing; `app/project.css` applies the visual redesign over the original dashboard layout. The redesign keeps the existing data loading, filters, selection, field mappings and scientific copy intact. Next.js remains the framework; a Vite migration is not needed for these visual changes.

## Run locally

Requires Node.js 20.9+ and npm.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. For production validation use `npm run build` and `npm start`. Run `npm test` for package integrity and validation rejection checks, and `npm run typecheck` for TypeScript.

The committed application-local data copies are ready to consume. To refresh from the same verified local STEP54 package, run `npm run data:prepare` from this directory. This reads and verifies sources, copies bytes, and creates presentation metadata (counts, dropdown values, extent). It does not run notebooks, infer classifications, alter geometry, or modify source files. Preparation stops on gate, manifest, schema, count, or canonical-target consistency failures.

On this workstation the system `npm` wrapper points to a missing roaming installation. The working equivalent used for validation is `node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" <command>`. Repairing global npm is outside this application's scope.

## Architecture

Next.js App Router, React, TypeScript, Tailwind CSS, MapLibre GL JS and Recharts. The exact resolved versions are in package-lock.json. CSS provides the institutional blue/teal visual system. No remote fonts or external basemap services are required. MapLibre renders the original polygon grids over a neutral background supplied by the frozen grid extent, plus optional context geometry described below.

`npm install` also copies MapLibre's matching worker and shared module into `public/vendor/maplibre/`, and copies the data-loading Web Worker plus its validation module into `public/workers/`. The explicit local worker URLs are required for this Next.js/MapLibre combination and for the data worker alike. These generated dependency assets are not scientific artifacts.

```
app/                         route, layout, global styles, favicon
components/dashboard/        data loading and shared view state
components/map/              WebGL polygon rendering and selection
components/filters/          contract-defined controls and grid search
components/evidence/         selected grid and frozen follow-up
components/charts/           accessible count chart, tier buttons and bridging-node highlights
components/scientific/       claim boundaries, provenance and the global SHAP summary
lib/data/                    cached application-local data requests + Web Worker source
lib/data/vocabulary.ts       plain-language tier text and indicative stakeholder grouping
lib/data/shap-summary.json   committed STEP46 global SHAP consensus importance (see below)
lib/data/shapPerGrid.ts      fetch + hook for the STEP46B per-grid SHAP lookup
lib/validation/              fail-closed collection validation
types/                       GeoJSON and presentation types
scripts/                     read-only source verification and copying
tests/                       integrity and malformed-data checks
public/data/mahakam/          unchanged STEP54 copies + metadata.json
public/data/context/         additive map context geometry (NOT STEP54, NOT evidence)
public/data/interpretation/  additive STEP46B per-grid SHAP lookup (NOT STEP54, NOT evidence)
public/workers/               generated copies of the data-loading Web Worker and validator
```

## Data flow and interaction

STEP54 manifest/gate/QA → preparation checks → identical local copies + derived presentation metadata → metadata first → target GeoJSON (2.81 MiB) → validation → filters/map/chart. Full GeoJSON (31.28 MiB) loads on All nodes, grid search, reference-tier or reference-target filtering. Both collections are fetched, parsed and validated inside a dedicated Web Worker (`lib/data/data-worker.mjs`, copied to `public/workers/`) so the main thread stays responsive while the full dataset loads; results are promise-cached on the main thread to avoid repeated downloads/parsing. Dynamic MapLibre loading avoids server-side WebGL. React memoizes filtered collections and counts; WebGL renders polygons without a React element per grid. All records and original coordinates remain intact; MapLibre's source tolerance is zero.

Filter predicates are conjunctive. Boolean filters distinguish All / Yes / No. All nodes and Targets only select the available record scope. Search uses a case-insensitive Grid ID substring across the full dataset; an exact or sole result selects and zooms to that grid. Multiple matches remain on the map for selection. Changing filters clears an excluded selection. Layer visibility affects the map only; visible-grid counts mean filter matches. Legend and chart buttons toggle tier filters. Reset view fits the canonical Mahakam extent.

KPI cards always show frozen package totals. Distribution and map summaries show the current filtered scope on a linear scale. The R0 chart button remains available in target scope and loads all nodes when selected.

## Scientific guardrails

The exact required disclaimer is visible in the dashboard. All claim-boundary rows retain their status and reason; unauthorized claims are explicitly marked. R0 maps to stored level **99**. R1–R5 are technical screening/review tiers, not causal-risk or future-probability classes. Retrospective percentile is displayed on its supplied 0–1 scale. Maximum overlap is the supplied percentage, not a Policy Contribution measure. Permit polygons are not observed physical footprints or proof of violations. Association is not causation. Policy decisions remain with authorized humans. The package is CLOSED_WITH_DOCUMENTED_LIMITATIONS.

Follow-up bundles remain verbatim in their original Indonesian. Separate action booleans are absent, so none are invented. Evidence groups display existing fields without weights or composite scores. STEP01–53 artifacts are never accessed by the application.

## Map context layers

Grid polygons alone gave no geographic orientation, so `public/data/context/` adds optional reference geometry: the DAS Mahakam boundary, BIG RBI 1:250,000 river lines, and kabupaten/kota boundaries clipped to the basin. These are toggled from the layer panel on the map and are labelled on screen as *visual reference, not recommendation evidence*.

They sit outside the STEP54 → application contract and change nothing in it. No context layer feeds scoring, filtering, KPI or recommendation level, and the frozen package keeps its original bytes. Sources, hashes, CRS transforms, simplification tolerances and the river-hierarchy derivation are recorded in `public/data/context/context_manifest.json` and in the addendum of `SCIENTIFIC_DATA_CONTRACT.md`.

Regenerate them from the standardized interim layers:

```sh
python scripts/build_context_layers.py
```

Requires `geopandas`, `shapely` and `pyogrio`. This is intentionally **not** part of the Vercel build; the output is committed so the deployed package stays byte-stable. Total context payload is about 1.8 MiB, of which the tertiary-river layer (0.9 MiB) loads lazily the first time it is switched on.

## Stakeholder-facing presentation additions

Five presentation-only additions make the frozen STEP54 evidence easier for non-technical stakeholders (BNPB, Bappenas, DAS river-basin authorities) to read, without adding, recomputing or approximating any scientific value beyond what STEP46B already computed and verified (see below):

- **Plain-language tier text** (`lib/data/vocabulary.ts`): a short Indonesian paraphrase of each R0–R5 tier's already-authorized contract `interpretation`, shown next to the technical code in the legend and grid detail instead of only in a hover tooltip. It deliberately avoids risk-ranking language to stay inside the required disclaimer that recommendation classes are not calibrated future-risk classes.
- **Bridging-node highlights** (`components/charts/BridgeHighlights.tsx`): the three existing bridge booleans (`critical_cross_system_bridge`, `structural_bridge_candidate`, `administrative_hydrological_bridge`) get a dedicated summary with counts and one-click filtering, instead of being available only as hidden filter checkboxes.
- **Indicative stakeholder grouping** (`relevantStakeholders` in `lib/data/vocabulary.ts`, rendered in `GridDetail.tsx`): a rule-based mapping from existing evidence flags to the institution types that evidence typically concerns (e.g. a bridge flag → "Pengelola DAS / BBWS"). This is explicitly labelled as an indicative grouping aid over the frozen `recommended_action_bundle` text, not an authoritative institutional assignment; the underlying action text is unchanged.
- **Global SHAP summary** (`components/scientific/ShapSummary.tsx`, data in `lib/data/shap-summary.json`): the flood-susceptibility model's already-computed, already-gated STEP46 global feature importance (`slope_mean_deg`, rainfall antecedents, distance to river), translated into plain Indonesian sentences. Regenerate the committed JSON with `npm run shap:prepare` if STEP46 outputs change; like the context layers, this is intentionally **not** part of `postinstall`/the Vercel build.
- **Per-grid SHAP explanation** (`components/evidence/GridShapExplanation.tsx`, data fetched from `public/data/interpretation/shap-per-grid.json`): for the selected grid, which of the four predictors pushed that grid's susceptibility score up or down, shown as a small bar per feature. Sourced from STEP46B (`documentation/step45_modeling/data/STEP46B_SHAP_PER_GRID_REPORT.md`), which extends STEP46's own normalize-then-average consensus method across Random Forest, XGBoost and LightGBM to per-row granularity. Regenerate with `npm run shap:prepare:grid`.

Both SHAP surfaces are model attribution, not causal claims, and neither is IRC or Policy Contribution: `lib/data/shap-summary.json`'s and `public/data/interpretation/shap-per-grid.json`'s `source` blocks carry the gate's own `irc_constructed: false` / `policy_contribution_percent_claim: false` flags, and both preparation scripts refuse to run if a future gate stops asserting that. IRC itself does not exist anywhere in the pipeline yet (STEP52's audit explicitly excludes it); producing it is scientific work for the modeling/IRC owner, not a dashboard change. See `MASTER_PROJECT_INSTRUCTION.md`.

## Known limitations

- No true basemap: the map still has no hillshade, land cover or satellite imagery. Geographic context comes only from the additive context layers described above.
- Context geometry is simplified for the web and is therefore not survey-grade. Do not use it for measurement or overlay analysis; use `data/02_interim/` for that.
- All three context sources carry an unclear redistribution status. Attribution is shown on the map; avoid commercial use.
- Full-data parsing and validation run in a Web Worker (`lib/data/data-worker.mjs`) rather than the main thread, so large loads no longer block UI interaction; do not sample or simplify the scientific data.
- WebGL is required for the map. A controlled error appears if rendering fails.
- Full-node search incurs a one-time full-file load; no separate search index is supplied.
- No separate technical-action flags exist in STEP54; the frozen action bundle is shown instead.
- No final IRC, Policy Contribution, causal attribution, future flood probability, nationwide coverage, or regulatory actions are provided.

See SCIENTIFIC_DATA_CONTRACT.md and COPY_MANIFEST.json for exact source mappings.
