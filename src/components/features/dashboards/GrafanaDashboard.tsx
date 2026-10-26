import { AlertTriangle, ExternalLink } from "lucide-react";

const GRAFANA_URL = "/grafana/dashboards";
const GRAFANA_EMBED_URL = "/grafana/dashboards?kiosk";

export function GrafanaDashboard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grafana Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Live monitoring dashboards
          </p>
        </div>
        <a
          href={GRAFANA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#007BFF] hover:underline shrink-0"
        >
          Open in new tab
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          If this panel stays blank, the Grafana server needs{" "}
          <code className="font-mono bg-amber-100 px-1 rounded">
            allow_embedding = true
          </code>{" "}
          set under{" "}
          <code className="font-mono bg-amber-100 px-1 rounded">
            [security]
          </code>{" "}
          in its config (Grafana blocks iframe embedding by default). You may
          also need to be logged into Grafana separately in this browser
          first — use "Open in new tab" to sign in.
        </p>
      </div>

      <div
        className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
        style={{ height: "calc(100vh - 260px)", minHeight: "480px" }}
      >
        <iframe
          src={GRAFANA_EMBED_URL}
          title="Grafana Dashboard"
          className="w-full h-full border-0"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
