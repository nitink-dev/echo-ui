import { ExternalLink } from "lucide-react";

const SAM_URL = "/sam/";

export function SamServer() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SAM Server</h1>
          <p className="text-sm text-gray-600 mt-1">
            SAM server console
          </p>
        </div>
        <a
          href={SAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#007BFF] hover:underline shrink-0"
        >
          Open in new tab
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div
        className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
        style={{ height: "calc(100vh - 220px)", minHeight: "480px" }}
      >
        <iframe
          src={SAM_URL}
          title="SAM Server"
          className="w-full h-full border-0"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
