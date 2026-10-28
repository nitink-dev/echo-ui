# Grafana Integration — What Was Actually Built: iframe + Same-Origin Reverse Proxy

**Written for:** engineers maintaining or extending the Grafana embed in echo-ui.
**Status:** implemented and deployed on `ui-updates-oct8`.
**Related docs:** `01-grafana-scenes.md` and `02-api-ds-query.md` describe no-iframe alternatives that were evaluated but not built. This doc describes the approach that shipped instead — a plain `<iframe>`, made to work reliably by eliminating cross-origin cookie problems rather than avoiding iframes altogether.

---

## 1. Summary

A new "Grafana Dashboard" page in echo-ui embeds a live Grafana dashboard in an `<iframe>`. The first working version (iframe pointed straight at Grafana's real address, `http://10.201.8.197:3000`) hit a login loop: the user could see Grafana's login screen inside the iframe, but after logging in, Grafana immediately bounced back to its own login page again.

The fix was **not** anything inside the iframe or in Grafana's auth flow — it was to stop the iframe from being cross-origin in the first place. echo-ui's own nginx (and the Vite dev server) now reverse-proxy `/grafana/*` through to the real Grafana server. The browser only ever talks to echo-ui's origin; Grafana's actual address is resolved server-side and never appears in the browser.

## 2. Root cause of the login loop

- echo-ui and Grafana are served from different origins (different host/port).
- A `<iframe src="http://10.201.8.197:3000/...">` embedded in an echo-ui page is a cross-site context from the browser's point of view.
- Grafana's session cookie, by default, is `SameSite=Lax`. Lax cookies are not sent on requests that originate from inside a cross-site iframe (only on top-level navigations). So the cookie Grafana sets right after login never comes back on the next request — Grafana sees no session and redirects to `/login` again.
- The obvious alternative fix, `SameSite=None; Secure`, requires HTTPS. Our Grafana instance was plain HTTP, so that path was blocked too.
- Making the iframe **same-origin** (same scheme+host+port as the parent page) sidesteps the whole SameSite mechanism: same-origin requests are never subject to cross-site cookie restrictions.

## 3. Architecture

```
Browser ──> echo-ui nginx (or Vite dev server), one origin
              ├── /                →  static React app
              ├── /api/            →  proxy_pass backend API (10.201.8.208:8080)
              └── /grafana/        →  proxy_pass Grafana (10.201.8.197:3000)
```

The browser never makes a direct request to Grafana's real address. From the browser's perspective, `/grafana/...` is just another path on echo-ui's own origin.

## 4. Changes, by file

### `default.conf` (nginx, production — inside the Docker image)

```nginx
location /grafana/ {
    proxy_pass http://10.201.8.197:3000/;
    proxy_redirect / /grafana/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

Two details that matter and are easy to get wrong:

- **Trailing slash on `proxy_pass`** (`http://10.201.8.197:3000/`) — this makes nginx strip the `/grafana` prefix before forwarding, so `/grafana/dashboards` reaches Grafana as `/dashboards`. Grafana itself has no idea it's being served under a sub-path at the HTTP-routing level; this stripping is what makes that work.
- **`proxy_redirect / /grafana/;`** — without this, any `Location:` header Grafana sends back (e.g. a `302` to `/login`) is forwarded to the browser unchanged. Since Grafana doesn't know about the `/grafana` prefix, it writes relative redirects like `Location: /login`. The browser resolves that against the *current* origin, lands on `/login` at echo-ui's root — outside the proxy entirely — and gets a plain nginx 404. `proxy_redirect` rewrites the prefix on the way out so the redirect stays under `/grafana/`. This was the second bug found after the cookie fix; both had to be fixed before the flow worked end-to-end.

### `vite.config.ts` (dev server only)

```ts
server: {
  port: 3001,
  open: true,
  proxy: {
    '/grafana': {
      target: 'http://10.201.8.197:3000',
      changeOrigin: true,
      ws: true,
      rewrite: (path) => path.replace(/^\/grafana/, ''),
    },
  },
},
```

Mirrors the nginx behavior for local dev (`npm run dev`). Vite does not hot-reload `server.proxy` changes — the dev server process must be restarted after editing this file.

### `src/components/features/dashboards/GrafanaDashboard.tsx`

```ts
const GRAFANA_DASHBOARD_PATH = "/grafana/d/X034JGT7Gz/springboot-apm-dashboard";
const GRAFANA_URL = `${GRAFANA_DASHBOARD_PATH}?orgId=1&from=now-6h&to=now`;
const GRAFANA_EMBED_URL = `${GRAFANA_DASHBOARD_PATH}?orgId=1&from=now-6h&to=now&kiosk&theme=light`;
```

- The iframe `src` is a **relative path** — no Grafana IP/port appears in frontend code anywhere. It resolves against whatever origin served the page, which is exactly the point.
- Points directly at a specific dashboard (`springboot-apm-dashboard`, UID `X034JGT7Gz`) rather than Grafana's dashboard list, so the page opens straight into the intended view.
- `?kiosk` — Grafana's built-in kiosk mode, hides Grafana's own top nav and left sidebar (Home / Bookmarks / Starred / Explore / Alerting / Connections / Administration) inside the iframe, leaving just the dashboard panels.
- `&theme=light` — forces Grafana's light theme regardless of the logged-in user's own Grafana preference.
- The "Open in new tab" link uses `GRAFANA_URL` (no `kiosk`), so a user who clicks through gets full Grafana chrome to actually administer things, not the stripped-down embed view.

### `src/components/Layout.tsx`, `src/App.tsx`, `src/types/common.types.ts`

Standard wiring for a new page in echo-ui's state-based router: `PageType` union gets `'grafana-dashboard'`, a nav item under the Operations section (`BarChart3` icon), an entry in `buildPermissionMap` (currently open to everyone — no backend permission exists for this feature yet), and corresponding entries in `App.tsx`'s `VALID_PAGES`, breadcrumb map, and `pageComponents` map.

## 5. Grafana-side configuration (owned by the Grafana admin, not this repo)

For the proxy approach to work, Grafana itself needs to agree that it's being served under `/grafana/` on echo-ui's origin. This is configured in Grafana's own `docker-compose.yml`, already set correctly in the current deployment:

```yaml
GF_SECURITY_ALLOW_EMBEDDING: "true"       # otherwise Grafana sends X-Frame-Options and refuses to be framed at all
GF_SECURITY_COOKIE_SAMESITE: "disabled"   # belt-and-braces; same-origin proxy means this shouldn't matter anymore
GF_SECURITY_COOKIE_SECURE: "false"        # Grafana is served over plain HTTP
GF_SERVER_ROOT_URL: "http://10.201.8.208:3001/grafana/"
GF_SERVER_SERVE_FROM_SUB_PATH: "true"
```

- `GF_SERVER_ROOT_URL` + `GF_SERVER_SERVE_FROM_SUB_PATH` are what make Grafana generate its own internal links, static asset paths, and API calls with the `/grafana/` prefix baked in — this matters for everything *other* than the top-level redirect (which `proxy_redirect` handles on the nginx side regardless).
- If the port echo-ui is actually served on ever changes, `GF_SERVER_ROOT_URL` has to be updated to match, or Grafana's self-referencing links will point at the wrong port again.

## 6. Deployment gotchas hit during rollout (worth knowing before touching this again)

- **Vite proxy changes require a dev server restart** — editing `vite.config.ts` while `npm run dev` is running does not take effect until the process is restarted.
- **Docker build caching**: `docker build` (without `--no-cache`) can silently reuse a stale layer. When a fix didn't seem to take effect, `docker build --no-cache` was the reliable way to confirm whether it was a real bug or a stale image.
- **Multiple containers on the same host, different ports**: the deployment host had more than one echo-ui container running simultaneously — a long-lived "production" one bound to host port 80, and a short-lived test one on port 3001. Browsing the bare IP (no port) silently hit the old port-80 container, which didn't have any of this proxy work yet, producing confusing, inconsistent symptoms (404s, redirects to the wrong port) that looked like proxy bugs but were actually just the wrong container being tested. Always confirm which container is being exercised with `docker ps` before trusting a test result, and test against an explicit port rather than a bare IP when more than one container might be listening.
- **`VITE_API_URL` must never be `localhost`** — it's baked into the frontend bundle at Vite *build* time and then runs in the browser on whichever machine opens the page, not on the server. A `localhost`-pointing API URL only works if the browser happens to be on the exact same machine as the backend; for any other client it fails with a same-machine-relative, connection-refused request. Use the server's real LAN IP.

## 7. Known follow-ups / not yet done

- No backend permission exists for the Grafana Dashboard menu item (`buildPermissionMap` hardcodes it to `true` for all users). If this needs to be role-gated, that requires a new permission key on the backend.
- A separate "SAM Server" menu item (`https://10.201.8.35/`) was added as a plain cross-origin iframe, without the same-origin proxy treatment described here. If SAM Server turns out to be cookie/session-based like Grafana was, it will likely hit the same login-loop failure mode, and the same fix (proxy it through `/sam/` with `proxy_redirect`) would apply.
