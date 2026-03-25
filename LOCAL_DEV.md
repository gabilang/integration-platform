# Local Development Guide

Skip the PR → merge → build → Flux reconcile cycle. This guide covers how to run the console and the integration-platform-service locally against your k3d cluster using port-forwarding.

---

## How requests flow in production vs locally

**In the cluster (normal flow)**

```
Browser
  → devant-console pod (nginx)
    → cluster gateway (gateway-default, port 19080)
      → integration-platform-api-service pod (port 8080)
        → platform-api-service (OpenChoreo control plane)
```

**Local dev (port-forward flow)**

```
Browser
  → Vite dev server (localhost:3001)         ← your console changes hot-reload here
    → cluster gateway (localhost:19080)      ← port-forwarded into the cluster
      → integration-platform-api-service     ← either the cluster pod OR your local process
        → platform-api-service              ← always in the cluster
```

---

## Prerequisites

| Tool | Purpose |
|------|---------|
| `kubectl` | Port-forwarding and cluster interaction |
| `pnpm` | Console package manager |
| `go 1.25+` | Running the API service locally |
| `node 20+` | Console dev server |

---

## Scenario 1 — Console changes only

Use this when your changes are in `/console` only. No cluster patching needed.

```bash
cd /Users/gabilan/integration-repos/integration-platform/console
pnpm install
pnpm dev
```

Open `https://localhost:3001`.

**What's happening:**
- Vite proxies all `/integration-platform-api-service/*` requests to the cluster gateway at `http://development-wso2cloud.openchoreoapis.localhost:19080` (configured in [vite.config.ts](console/vite.config.ts))
- Auth is bypassed via `VITE_DEV_BYPASS_AUTH=true` in [.env.local](console/.env.local)
- HMR (hot module replacement) gives you instant feedback on every save

The cluster-side `integration-platform-api-service` pod handles all API calls — you don't touch it.

---

## Scenario 2 — Integration platform service changes only

Use this when your changes are in `/integration-platform-service` only. The console runs in the cluster; you test via `curl` or any HTTP client.

### Step 1 — Port-forward the internal gateway

The service depends on `platform-api-service` (OpenChoreo control plane). Port-forward the data-plane gateway so your local process can reach it:

```bash
kubectl port-forward -n openchoreo-data-plane \
  svc/api-platform-default-gateway-router 18080:8080
```

Keep this running in a dedicated terminal.

### Step 2 — Run the service locally

In a new terminal:

```bash
cd /Users/gabilan/integration-repos/integration-platform/integration-platform-service

PLATFORM_API_SERVICE_BASE_URL="http://localhost:18080/cloud-core-api/v1.0/wso2cloud-dp" \
PLATFORM_API_SERVICE_HOST="development-wso2cloud.openchoreoapis.localhost" \
SERVER_PORT=9090 \
LOG_LEVEL=debug \
  go run ./cmd/platform-api/main.go
```

> `SERVER_PORT=9090` avoids colliding with the cluster pod which is already using 8080 internally.
>
> `PLATFORM_API_SERVICE_HOST` is required — the gateway routes by `Host` header. Without it the gateway returns 404.

**Alternative — use an env file** (cleaner for repeated use):

Create `integration-platform-service/.env.dev-local`:

```bash
PLATFORM_API_SERVICE_BASE_URL=http://localhost:18080/cloud-core-api/v1.0/wso2cloud-dp
PLATFORM_API_SERVICE_HOST=development-wso2cloud.openchoreoapis.localhost
SERVER_PORT=9090
LOG_LEVEL=debug
```

Then run:

```bash
ENV_FILE_PATH=.env.dev-local go run ./cmd/platform-api/main.go
```

### Step 3 — Verify it's working

```bash
# Health check (no auth needed)
curl http://localhost:9090/health

# List projects (needs a valid JWT — copy one from browser DevTools → Network tab)
curl http://localhost:9090/projects \
  -H 'Authorization: Bearer <token>'
```

> **Note:** Requests go directly to your local process, bypassing the kgateway. The JWT is not validated by the gateway here — but the service still parses claims from it to extract `ouHandle`. Use a real token from your browser session.

---

## Scenario 3 — Both console and service running locally

Use this when your change spans both components and you want end-to-end local feedback.

### Step 1 — Port-forward the internal gateway

Same as Scenario 2:

```bash
kubectl port-forward -n openchoreo-data-plane \
  svc/api-platform-default-gateway-router 18080:8080
```

### Step 2 — Run the integration platform service locally

Same as Scenario 2:

```bash
cd /Users/gabilan/integration-repos/integration-platform/integration-platform-service
ENV_FILE_PATH=.env.dev-local go run ./cmd/platform-api/main.go
```

Service is now at `http://localhost:9090`.

### Step 3 — Point the console at your local service

The console uses `VITE_CORE_DP_API_BASE_URL` to build API request paths, and [vite.config.ts](console/vite.config.ts) proxies those to the cluster gateway. To redirect traffic to your local service instead, create a Vite override config:

Create `console/vite.config.local.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      // Route console API calls to the local service instead of the cluster gateway.
      // The rewrite strips the /integration-platform-api-service prefix because
      // the local service serves routes at / (e.g. /projects, /health).
      '/integration-platform-api-service': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/integration-platform-api-service/, ''),
      },
      // Platform API still goes through the cluster gateway
      '/platform-api-service': {
        target: 'http://development-wso2cloud.openchoreoapis.localhost:19080',
        changeOrigin: true,
      },
    },
  },
});
```

Start the console with this config:

```bash
cd /Users/gabilan/integration-repos/integration-platform/console
pnpm vite --config vite.config.local.ts
```

Open `https://localhost:3001`. Every console API call to `/integration-platform-api-service/*` now hits your local Go process at `localhost:9090`.

---

## Quick-reference cheat sheet

| Goal | Commands |
|------|----------|
| Console changes only | `pnpm dev` in `/console` |
| Service changes only | `kubectl port-forward ... 18080:8080` + `ENV_FILE_PATH=.env.dev-local go run ./cmd/platform-api/main.go` |
| Both locally | Above two + `pnpm vite --config vite.config.local.ts` in `/console` |

---

## Troubleshooting

**`PLATFORM_API_SERVICE_BASE_URL is required` on startup**
You forgot to set the env var or `ENV_FILE_PATH`. The service refuses to start without it.

**Gateway returns 404 when calling `platform-api-service`**
The `Host` header is missing. Set `PLATFORM_API_SERVICE_HOST=development-wso2cloud.openchoreoapis.localhost`.

**Port-forward disconnects after a few minutes**
This is a known kubectl behaviour. Re-run the port-forward command. For longer sessions wrap it in a shell loop:
```bash
while true; do
  kubectl port-forward -n openchoreo-data-plane \
    svc/api-platform-default-gateway-router 18080:8080
  sleep 1
done
```

**Console shows stale data after service restart**
Hard-refresh the browser (`Cmd+Shift+R`) to clear any cached responses.

**JWT errors in service logs**
The service parses the token but doesn't validate its signature locally (gateway does that in production). If you're getting auth errors, make sure you're copying a fresh token from browser DevTools — they expire.

**`address already in use` on port 9090**
Something else is on 9090. Change `SERVER_PORT` in `.env.dev-local` to any free port (e.g. `9091`) and update the vite proxy target to match.
