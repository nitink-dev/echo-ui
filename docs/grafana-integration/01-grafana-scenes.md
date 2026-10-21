# Grafana Integration — Option A: `@grafana/scenes` (native, no iframe)

**Written for:** engineers implementing Grafana dashboard embedding in echo-ui.
**Status:** implementation guide / design doc — nothing has been built against this yet.
**Grafana server (dev):** `http://10.201.8.197:3000`
**Companion doc:** `02-api-ds-query.md` (the alternative approach — direct API query + custom charts). Read both before choosing; the two are compared at the end of this file.

---

## 1. What this is

`@grafana/scenes` is the library Grafana Labs built specifically so a third-party React app can render *real* Grafana panels (actual graphs, gauges, tables — Grafana's own rendering, not a re-implementation) **inside its own DOM**, with no `<iframe>`. The browser calls Grafana's HTTP API directly (or through a proxy — see §5), and `@grafana/scenes` renders the result using the same visualization components Grafana itself uses.

This is the option to pick if the goal is: "show the actual Grafana panel, looking exactly like it does in Grafana, living natively inside echo-ui, interactive (hover tooltips, time-range picker, zoom)."

## 2. What it is *not*

- It does not give you a drop-in "paste a dashboard URL, get a dashboard" component. You build a **Scene** — an object graph of panels + queries + layout — in code. Grafana ships tooling to reconstruct a Scene from an existing dashboard's JSON model, but that reconstruction path is primarily Grafana-core-internal and not a stable, documented public API as of general availability. Treat "load dashboard `X` by UID and render it 1:1" as **not guaranteed to work out of the box** — validate it against our actual Grafana version before committing to it (see §7, open questions).
- The safer, well-supported path is to hand-build a Scene whose panels run the **same queries** the existing dashboard panels run (copied from the dashboard JSON, see §4). You get native Grafana rendering of our real data, just not an automatic 1:1 clone of the dashboard layout.

## 3. Prerequisites

- Grafana reachable at `http://10.201.8.197:3000` from wherever the query actually runs (browser, if calling Grafana directly; our backend, if proxying — see §5).
- The login screen shown in the shared screenshot ("username pswd?") is Grafana's **interactive** login. Do not use interactive username/password for this integration — it won't work from a fetch call and stores no durable credential. Instead:
  - Create a **Grafana Service Account** (Grafana's current recommended mechanism; plain "API keys" are the deprecated predecessor) under `Administration → Service accounts`.
  - Generate a **Service Account token** for it. This token is a bearer credential: `Authorization: Bearer <token>`.
  - Scope the service account to **read-only / Viewer** permissions on the specific dashboards/datasources needed — not Admin.
- Know the UID of each datasource actually queried (Prometheus, per the screenshot). Get it via `GET /api/datasources` (needs auth) — look for `"type": "prometheus"` and note its `"uid"`.
- Know the dashboard UID(s) and the exact panel query/queries to replicate — open the dashboard in Grafana, open the panel's "Edit" view, and copy its PromQL expression(s) from the Query tab. (Or `GET /api/dashboards/uid/<uid>` and read `panels[].targets[].expr`.)

## 4. Packages

```bash
npm install @grafana/scenes @grafana/data @grafana/ui @grafana/runtime rxjs
```

Pin all four `@grafana/*` packages to versions that match (or are known-compatible with) the Grafana **server** version at `10.201.8.197:3000` — check `GET /api/health` or the Grafana UI's "About" page for the server version before picking package versions. A client/server version mismatch is the most common source of broken rendering with this library.

## 5. Auth and CORS — read before writing any code

The browser calling `10.201.8.197:3000` directly from echo-ui (a different origin) means:

1. **CORS**: Grafana must send `Access-Control-Allow-Origin` for echo-ui's origin, or the browser blocks the response. This requires Grafana server-side CORS config, which we may not control or want to touch for a shared instance.
2. **Credential exposure**: a Bearer token used directly from the browser is visible in every outgoing request and in the bundled JS if hardcoded — it must come from a backend-served config endpoint at minimum, and ideally never reach the browser at all.

**Recommended: do not call Grafana directly from the browser.** Add a thin proxy in `echo-config-service`:

- `GET /api/grafana/scenes-config` (or similar) — returns only what the frontend needs to construct the Scene (datasource UID, panel query definitions), **not** the Grafana token.
- The actual Grafana API calls `@grafana/scenes`/`@grafana/runtime` makes still go to Grafana's URL directly from the browser *unless* `@grafana/runtime`'s backend-service URL is reconfigured to point at our own proxy, which then forwards to Grafana with the token attached server-side. `@grafana/runtime` supports overriding its base URL for exactly this kind of integration — confirm the exact override point against the installed package version (`setBackendSrv`, or the `GrafanaBootConfig`'s `appUrl`/`apiUrl`).
- This also sidesteps the CORS problem entirely, since the browser only ever talks to our own backend (same origin as echo-ui, or already-CORS-configured).

This proxy is backend work in `echo-config-service`, not yet built — scope it as its own task before frontend work starts.

## 6. Sketch of the frontend integration

```tsx
// src/components/features/dashboards/GrafanaScenePanel.tsx
import { EmbeddedScene, SceneFlexLayout, SceneFlexItem, SceneQueryRunner, VizPanel } from '@grafana/scenes';

function buildScene() {
  const queryRunner = new SceneQueryRunner({
    datasource: { type: 'prometheus', uid: '<DATASOURCE_UID>' }, // from GET /api/datasources
    queries: [
      { refId: 'A', expr: '<PROMQL_EXPR_COPIED_FROM_DASHBOARD_PANEL>' },
    ],
  });

  return new EmbeddedScene({
    body: new SceneFlexLayout({
      children: [
        new SceneFlexItem({
          body: new VizPanel({
            title: '<Panel title, matches Grafana dashboard>',
            pluginId: 'timeseries', // or 'gauge', 'stat', etc. - match the source panel's viz type
            $data: queryRunner,
          }),
        }),
      ],
    }),
  });
}

export function GrafanaScenePanel() {
  const scene = buildScene();
  return <scene.Component model={scene} />;
}
```

Wire this into a new route/menu item (e.g. alongside the existing "Health Status" entry in `App.tsx`/`Layout.tsx`), not into an existing page.

## 7. Open questions to confirm with whoever administers this Grafana instance before building

- Exact Grafana server version (for package pinning).
- Whether a Service Account can be created for this integration, and what scope (Viewer, specific dashboard folder) is acceptable.
- Datasource UID(s) for the panels we actually need.
- Whether `echo-config-service` is an acceptable place to host the proxy, or whether Grafana itself should be reconfigured for CORS instead (a call to make with whoever owns the Grafana deployment, since it affects a shared instance).

## 8. Tradeoffs (for choosing between this and Option B)

| | This option (`@grafana/scenes`) | Option B (`/api/ds/query`, see `02-api-ds-query.md`) |
|---|---|---|
| Visual result | Identical to real Grafana panels (same renderer) | Custom chart, styled to match echo-ui, not Grafana |
| Interactivity | Full (hover, zoom, time-range picker) — Grafana's own | Whatever we build (basic hover/tooltip with Recharts is easy; zoom/time-range picker is extra work) |
| Setup effort | Medium-high (new dependency, version-pinning risk, scene-building code) | Medium (no new frontend viz dependency, but query-parsing code to write) |
| Longer-term maintenance | Tied to Grafana package version compatibility | Tied to the PromQL expression staying correct, no package coupling |
| Best for | "I want the actual Grafana panel in my app" | "I want this data in a chart that matches the rest of my app's design" |
