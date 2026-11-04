# Ibex Integration — What Was Actually Built: Dedicated-Port Reverse Proxy

**Written for:** engineers maintaining or extending the Ibex embed in echo-ui.
**Status:** implemented and pushed on `ADP-888-IFRAME-SAM-Server`.
**Related docs:** `docs/grafana-integration/03-iframe-same-origin-proxy.md` describes the same-origin, path-prefix proxy pattern (`/grafana/...`) used for Grafana and SAM Server. Ibex **cannot** use that same path-prefix pattern — this doc explains why, what was tried first, and the different approach that was needed instead.

---

## 1. Summary

A new "Ibex" dashboard page in echo-ui embeds Ibex (`https://endeavor.ibex-ai.com`) in an `<iframe>`. The first attempt reused the existing pattern from Grafana/SAM: proxy it same-origin under a path prefix, `/ibex/`. That approach failed — the iframe loaded a blank grey screen, even though every network request behind the scenes (HTML, JS bundles, API calls) returned 200 OK with correct content.

Root cause: **Ibex's frontend is a Vue SPA with a client-side router whose base path is hardcoded to `/`.** It has no concept of being served under a sub-path. A path-prefix proxy (`/ibex/...`) is invisible to nginx's HTTP routing but *not* invisible to the browser's URL bar — and Vue Router matches routes against the real browser URL, not against whatever nginx silently rewrote server-side. So the router never matches any route under `/ibex/...` and renders nothing.

The fix: give Ibex **its own dedicated port** (`3002`) on the same host, proxied at the *root* (`/`, no prefix) instead of under a path. This keeps the "same-origin enough to avoid cookie problems" property (see §4) while satisfying Vue Router's hardcoded root-base assumption.

## 2. Why the `/grafana/`-style path-prefix proxy doesn't work for Ibex

The Grafana/SAM pattern works because of a key fact: **Grafana knows it's being served under a prefix** (`GF_SERVER_ROOT_URL=.../grafana/`, `GF_SERVER_SERVE_FROM_SUB_PATH=true` — see the Grafana doc, §5). Grafana was explicitly configured, server-side, to generate all of its own links, asset paths, and redirects with the `/grafana/` prefix baked in. nginx's job in that case is just to strip the prefix on the way in (`proxy_pass http://grafana/;`) and fix up redirect headers on the way out (`proxy_redirect`).

Ibex has no equivalent configuration knob that we control — it's a third-party app (`endeavor.ibex-ai.com`) with a bundled, pre-built frontend that we cannot reconfigure. Its Vue Router instance is initialized once, at build time, with a hardcoded base of `/` (confirmed by inspecting the minified bundle — route guards like `next("/login")` compute absolute paths assuming `/` is the app root). When the app is loaded from a URL like `http://host:3001/ibex/`, here's what actually happens:

1. nginx proxies the *initial* HTML/JS/CSS requests correctly (prefix-stripping works fine for simple GET passthroughs — this is why DevTools Network tab showed everything as 200 OK and misleadingly looked "fine").
2. The browser's address bar and `window.location` genuinely say `/ibex/...` — nginx rewriting happens server-side and the browser never finds out.
3. Vue Router boots up, reads `window.location.pathname` (`/ibex/` or `/ibex/login`), and tries to match it against its route table — which only contains patterns matching `/`, `/login`, etc., *not* `/ibex/*`.
4. No route matches. Vue Router renders nothing. The page is a blank, styled (CSS loaded fine) grey screen.

This is a fundamentally different failure mode from the Grafana login-loop: that was a **cookie** problem (SameSite blocking the session cookie), fixed by making requests same-origin. This is a **client-side routing** problem (URL-path mismatch), and no amount of cookie/header fiddling fixes it — proxy headers, `Origin`/`Referer` rewriting, and SSL verification settings were all tried and ruled out during investigation; none of them touch the actual cause.

## 3. How this was confirmed (not just theorized)

Because this is a client-side JS behavior, it can't be diagnosed from `curl`/network logs alone — the network layer looks identical whether it works or not. It was confirmed by actually running a headless browser (Playwright) against two local reverse proxies built to faithfully mirror each nginx configuration, both talking to the real `endeavor.ibex-ai.com`:

- **Prefix-proxy test** (mirroring the original `/ibex/` approach): loaded a blank grey screen in the iframe. Screenshot confirmed — not just an `innerText` check, which initially gave a misleading false negative even on the known-working direct case.
- **Root-proxy test** (mirroring the dedicated-port approach): loaded the real Ibex login page correctly, inside an iframe, matching the direct (non-proxied, non-iframed) reference screenshot pixel-for-pixel in layout.

This is why the fix below is the dedicated-port approach and not another attempt at prefix-rewriting tricks (e.g. `sub_filter`-rewriting every absolute `/` reference in the bundle) — that path was considered but rejected as fragile (it would require rewriting routing logic embedded in minified JS, not just static HTML/asset URLs) compared to just giving the app the root it already expects.

## 4. Architecture

```
Browser ──> echo-ui nginx, port 3001         (the main app)
              ├── /                 →  static React app
              ├── /grafana/         →  proxy_pass Grafana      (path-prefix proxy, works)
              ├── /sam/             →  proxy_pass SAM Server   (path-prefix proxy, works)
              └── /synapse-pathology/ → proxy_pass Synapse     (path-prefix proxy, works)

Browser ──> echo-ui nginx, port 3002         (dedicated Ibex proxy, SEPARATE server block)
              └── /                 →  proxy_pass https://endeavor.ibex-ai.com/   (root, no prefix)
```

Both ports are served by the *same* nginx process / Docker container, just two different `server { listen ... }` blocks in `default.conf`. The iframe in echo-ui points at `http://<same-host>:3002/` instead of a `/ibex/` path on port 3001.

### Why this still avoids the cross-origin cookie problem

`SameSite` cookie scoping is based on the **registrable domain** ("site" = eTLD+1 — e.g. `example.com`), **not** the port. `http://10.201.8.208:3001` and `http://10.201.8.208:3002` are different *origins* (origin includes port) but the same *site* for `SameSite` purposes. So Ibex's session cookie — set on port 3002 — is still sent correctly on same-site requests, and the iframe embedding doesn't trip the `SameSite=Lax/Strict` cross-site blocking that the whole same-origin-proxy pattern exists to avoid in the first place. The dedicated port only changes how Vue Router sees the URL path; it does not reintroduce the cookie problem Grafana/SAM were fixed for.

## 5. Changes, by file

### `default.conf` (nginx)

All `/ibex/`, `/ibex/dist/`, `/dist/`, and `/ibex/api/` location blocks that existed inside the main `server { listen 3001; }` block were **removed**. A new, separate server block was added:

```nginx
server {
    listen 3002;
    listen  [::]:3002;
    server_name  localhost;

    location / {
        proxy_pass https://endeavor.ibex-ai.com/;
        proxy_ssl_verify off;
        proxy_ssl_server_name on;
        proxy_set_header Host endeavor.ibex-ai.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Notes on specific directives:

- **No path prefix in `location /`** — this is the whole point. Ibex sees itself as running at the root of its own origin, exactly as its hardcoded router expects.
- **`proxy_set_header Host endeavor.ibex-ai.com`** (not `$host`) — Ibex's backend is reached over the public internet via its real hostname, and needs to see its own `Host` header to serve the right virtual host / generate correct internal links. (This differs from the Grafana/SAM pattern, which uses `$host` because those backends are internal servers with no hostname-based routing to worry about.)
- **`proxy_ssl_server_name on`** — required alongside the above: without it, nginx's SSL handshake to `endeavor.ibex-ai.com` uses the wrong SNI and the TLS connection can fail or hit the wrong cert.
- **`proxy_ssl_verify off`** — the upstream's certificate isn't in nginx's trusted CA bundle; this was already the pattern used for SAM Server and Synapse Pathology.
- Grafana, SAM, and Synapse Pathology blocks on the main `server { listen 3001; }` block were **left untouched**.

### `src/components/features/dashboards/IbexDashboard.tsx`

```tsx
const IBEX_URL = `${window.location.protocol}//${window.location.hostname}:3002/`;
```

Previously `const IBEX_URL = "/ibex/";`. The URL is now built dynamically from the current page's own protocol/hostname plus the fixed port `3002`, rather than being relative — because this page is no longer a path on the current origin, it's a different port on the same host. Both the iframe `src` and the "Open in new tab" link use this value.

### `vite.config.ts` (dev server only)

The dead `/ibex` proxy entry (which rewrote to `https://endeavor.ibex-ai.com`, stripping the `/ibex` prefix) was removed from `server.proxy`, since the frontend no longer requests anything at `/ibex/*`. Dev-mode Ibex loading relies on the same nginx container's port 3002 (or an equivalent local proxy) being reachable, same as production — there is no Vite-proxy equivalent for the dedicated port, since Vite's dev server itself only listens on one port (3001).

### `Dockerfile`

```dockerfile
# Expose echo-ui (3001) and the dedicated Ibex proxy (3002)
EXPOSE 3001 3002
```

Previously `EXPOSE 80` (stale even before this change — nginx inside the container actually listens on 3001, not 80). `EXPOSE` is documentation only and does not itself publish ports; see §6 for the actual `docker run` flags needed.

## 6. Deployment: port 3002 must be explicitly published

`EXPOSE` in the Dockerfile does **not** make a container port reachable from the host or other machines — it's metadata only. The container must be started with an explicit port-publish flag for **both** ports:

```bash
docker build -t echo-ui .

docker run -d \
  --name echo-ui \
  -p 3001:3001 \
  -p 3002:3002 \
  echo-ui
```

If an existing container was started with only `-p 3001:3001` (or with `-p 80:80`/`-p 3001:3001` from before this change), port 3002 will not be reachable from outside the container even though nginx is correctly listening on it *inside* the container. This was actually hit during rollout: `curl http://<host>:3002/` returned `Connection refused` from a shell confirmed to be running *inside* the Docker bridge network (source IP `172.17.0.x`), which is the signature of exactly this gap — not a firewall or DNS/egress issue, both of which were suspected and ruled out first.

## 7. Known follow-ups / not yet done

- No backend permission exists yet for the Ibex menu item — same situation as Grafana (see Grafana doc §7), open to all users for now.
- Port 3002 is currently hardcoded in `IbexDashboard.tsx`. If the deployment ever needs Ibex on a different port (e.g. port conflicts on some environment), this constant needs to move to an env var, mirroring how `VITE_API_URL` is already handled.
- The Ibex heatmap panel has a known, unrelated rendering issue on the real Ibex server (reproducible even outside any iframe/proxy) — out of scope for this fix and not addressed here.
