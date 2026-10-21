# Grafana Integration — Option B: direct `/api/ds/query` + custom charts

**Written for:** engineers implementing Grafana dashboard embedding in echo-ui.
**Status:** implementation guide / design doc — nothing has been built against this yet.
**Grafana server (dev):** `http://10.201.8.197:3000`
**Example request seen during investigation:** `http://10.201.8.197:3000/api/ds/query?ds_type=prometheus&requestId=SQR103`
**Companion doc:** `01-grafana-scenes.md` (the alternative approach — native Grafana panel rendering via `@grafana/scenes`). Tradeoff table at the end of that doc.

---

## 1. What this is

Grafana's dashboards don't talk to Prometheus/InfluxDB/etc. directly from the browser — every panel's query goes through Grafana's own `/api/ds/query` endpoint, which Grafana forwards to the configured datasource and returns in a common JSON shape regardless of which datasource answered it. This option calls that same endpoint ourselves, gets the raw numbers back, and renders them with our own charting library (Recharts, matching the rest of echo-ui) instead of using any Grafana UI code.

Pick this option if the goal is: "I want this metric/graph inside echo-ui, styled like the rest of our app" rather than "I want the actual Grafana panel."

## 2. The `ds_type`/`requestId` query params, explained

The URL captured during investigation — `.../api/ds/query?ds_type=<type>&requestId=<id>` — is how **Grafana's own frontend** calls this endpoint: it's a `POST` request (not `GET`), with those two values added to the URL purely as metadata for Grafana's internal request-tracking and in-flight-request cancellation (so Grafana can cancel a superseded query when the user changes the time range mid-load). They are not required by the API to function:

- `ds_type` — informational; can be omitted or set to whatever datasource type is being queried.
- `requestId` — any string we choose, useful only if *we* also want to implement request cancellation (e.g. via `AbortController`) using the same ID scheme. Not required otherwise.

The actual query (which datasource, what expression, what time range) lives in the **POST body**, not the URL.

## 3. Request/response shape

**Request:**

```
POST http://10.201.8.197:3000/api/ds/query
Authorization: Bearer <grafana service account token>
Content-Type: application/json
```

```json
{
  "queries": [
    {
      "refId": "A",
      "datasource": { "type": "prometheus", "uid": "<DATASOURCE_UID>" },
      "expr": "<PROMQL_EXPRESSION>",
      "intervalMs": 15000,
      "maxDataPoints": 500
    }
  ],
  "from": "now-6h",
  "to": "now"
}
```

- `datasource.uid` — get via `GET /api/datasources` (requires auth); find the entry with `"type": "prometheus"` and read its `"uid"`.
- `expr` — the exact PromQL expression used by the dashboard panel being replicated. Get it from the dashboard JSON: `GET /api/dashboards/uid/<dashboard-uid>`, then read `dashboard.panels[].targets[].expr`. Copying this from the live panel's "Edit → Query" view in the Grafana UI works too and is easier to verify against what's actually rendering.
- `from`/`to` — Grafana's relative-time syntax (`now-6h`, `now-24h`, etc.) or absolute epoch-ms timestamps.

**Response** — Grafana returns data in its "DataFrame" JSON format, not a simple array of `{time, value}` pairs:

```json
{
  "results": {
    "A": {
      "frames": [
        {
          "schema": { "fields": [ { "name": "Time", "type": "time" }, { "name": "Value", "type": "number" } ] },
          "data": {
            "values": [
              [1697000000000, 1697000015000, 1697000030000],
              [42.1, 43.7, 41.9]
            ]
          }
        }
      ]
    }
  }
}
```

`data.values` is an array of columns, not rows: `values[0]` is every timestamp, `values[1]` is every corresponding metric value, in parallel index order. Converting to a chart-friendly shape:

```ts
function frameToSeries(frame: any): { time: number; value: number }[] {
  const [times, values] = frame.data.values;
  return times.map((t: number, i: number) => ({ time: t, value: values[i] }));
}
```

## 4. Auth and why this needs a backend proxy, not a direct browser call

Same constraints as Option A (§5 of `01-grafana-scenes.md`): calling `10.201.8.197:3000` directly from the browser hits CORS (Grafana would need to allow echo-ui's origin), and a bearer token used from the browser is exposed in every request and in the bundle if hardcoded.

**Required: add a proxy endpoint in `echo-config-service`**, e.g.:

```
GET /api/grafana/query/<metric-key>
```

where `<metric-key>` is one of a small, backend-defined set (not an arbitrary pass-through of PromQL from the frontend — don't let the browser submit raw PromQL to a backend-held Grafana token, that's an injection/abuse surface). The backend:

1. Looks up the datasource UID and PromQL expression for `<metric-key>` from its own config (not hardcoded in multiple places — consider a small YAML similar in spirit to `config/form-labels.yml`, e.g. `config/grafana-metrics.yml`, mapping `metric-key → { datasourceUid, expr }`).
2. Calls Grafana's `/api/ds/query` server-side with the Service Account token (held in backend config/secrets, never sent to the frontend).
3. Returns either the raw DataFrame response or (preferably) the already-flattened `{time, value}[]` shape from §3, so the frontend doesn't need Grafana-specific parsing logic.

This also means the Grafana Service Account token (see Option A doc, §3, for how to create it) only needs to exist in `echo-config-service`'s config — never in frontend code or network traffic visible to the browser.

## 5. Sketch of the frontend integration

```ts
// src/api/services/grafanaService.ts
export const grafanaService = {
  fetchMetric: async (metricKey: string): Promise<{ time: number; value: number }[]> => {
    const res = await apiClient.get(`/api/grafana/query/${metricKey}`);
    return res.data;
  },
};
```

```tsx
// src/components/features/dashboards/MetricChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function MetricChart({ metricKey }: { metricKey: string }) {
  const [data, setData] = useState<{ time: number; value: number }[]>([]);
  useEffect(() => {
    grafanaService.fetchMetric(metricKey).then(setData).catch(() => {});
  }, [metricKey]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
        <YAxis />
        <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
        <Line type="monotone" dataKey="value" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

For live/auto-refreshing data, re-fetch on an interval (`setInterval`, cleaned up on unmount) rather than anything Grafana-specific — this is now just an ordinary polling fetch.

## 6. Open questions to confirm before building

- Which specific metrics/panels actually need to show in echo-ui (drives the `config/grafana-metrics.yml` key list) — don't build a generic "any PromQL" pass-through (see §4's injection note).
- Refresh interval expected for each metric (real-time dashboards vs. periodic health snapshot).
- Same Grafana Service Account / token questions as `01-grafana-scenes.md` §7 — this option and Option A can share the same Service Account and token if both get built.

## 7. Tradeoffs

See the comparison table at the end of `01-grafana-scenes.md`.
