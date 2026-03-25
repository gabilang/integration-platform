# Devant Platform — Architecture & Request Flow

This document describes the end-to-end architecture of the Devant integration platform, covering how browser requests travel from the **devant-console** frontend through the **two-tier gateway** to the **integration-platform-api-service** and ultimately to the **OpenChoreo control plane**.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    Browser                                         │
│                                                                                    │
│  devant-console (React/Vite)                                                       │
│  http://devant-consol-devant-consol-development-wso2cloud-87640b2b                  │
│         .openchoreoapis.localhost:19080                                             │
└──────────────────────────────────┬──────────────────────────────────────────────────┘
                                   │  HTTP (cross-origin or same-origin via nginx proxy)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        Tier 1 — External Envoy Gateway                             │
│                       (gateway-default, port 19080)                                 │
│                                                                                    │
│  • Terminates external traffic                                                     │
│  • Matches HTTPRoute rules by hostname + path prefix                               │
│  • Rewrites URL prefix before forwarding to backend                                │
│  • Does NOT enforce auth or CORS — delegates to Tier 2                             │
└──────────────────────────────────┬──────────────────────────────────────────────────┘
                                   │  Rewritten path
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                   Tier 2 — Internal API Gateway (Policy Engine)                     │
│           (api-platform-default-gateway-gateway-runtime, port 8080)                 │
│                                                                                    │
│  • Matches routes by context path (e.g. /integration-platform-api/v1.0/*)          │
│  • Enforces policies: CORS, JWT authentication                                     │
│  • Strips the context path before forwarding to upstream service                   │
│  • Routes configured via RestApi CRD (created by api-configuration ClusterTrait)   │
└──────────────────────────────────┬──────────────────────────────────────────────────┘
                                   │  Path stripped to root (e.g. /projects)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│              integration-platform-api-service (Go, port 8080)                       │
│                                                                                    │
│  • Receives requests at root-level paths (/projects, /health, etc.)                │
│  • Parses JWT claims (ouHandle) to determine org context                           │
│  • Calls platform-api-service for OpenChoreo CRUD operations                       │
│  • Adds custom business logic for integration-specific APIs                        │
└──────────────────────────────────┬──────────────────────────────────────────────────┘
                                   │  Internal HTTP (via Tier 1 gateway + Host header)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│           platform-api-service (cloud-core-api, port 8081)                          │
│                                                                                    │
│  • OpenChoreo control plane API layer                                              │
│  • Manages projects, components, environments, etc.                                │
│  • Upstream base path: /wso2cloud-dp                                               │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Overview

```mermaid
graph TB
    subgraph Browser
        DC[devant-console<br/>React + Vite]
    end

    subgraph "k3d Cluster — openchoreo-data-plane namespace"
        EG["External Envoy Gateway<br/>(gateway-default:19080)<br/>HTTPRoute + URL Rewrite"]
        IG["Internal API Gateway<br/>(api-platform-default-gateway-gateway-runtime:8080)<br/>CORS · JWT · Route Matching"]
    end

    subgraph "k3d Cluster — dp-wso2cloud-devant-development"
        IPS["integration-platform-api-service<br/>(Go :8080)<br/>JWT parsing · Business logic"]
    end

    subgraph "k3d Cluster — dp-wso2cloud-core-development"
        PAS["platform-api-service<br/>(cloud-core-api :8081)<br/>OpenChoreo API layer"]
    end

    subgraph "k3d Cluster — thunder namespace"
        IDP["platform-idp<br/>OAuth2 / OIDC provider"]
    end

    DC -->|"① /integration-platform-api-service-<br/>integration-platform-api-http/*"| EG
    DC -->|"OAuth2 login"| IDP
    EG -->|"② /integration-platform-api/v1.0/*"| IG
    IG -->|"③ /* (root-level)"| IPS
    IPS -->|"④ /platform-api-service-<br/>platform-api-endpoint/*<br/>(Host: development-wso2cloud...)"| EG
    EG -->|"⑤ /cloud-core-api/v1.0/*"| IG
    IG -->|"⑥ /wso2cloud-dp/*"| PAS
```

## Request Flow — Sequence Diagram

### Browser → integration-platform-api-service → platform-api-service

```mermaid
sequenceDiagram
    participant B as Browser<br/>(devant-console)
    participant EG as External Gateway<br/>(Envoy :19080)
    participant IG as Internal API Gateway<br/>(Policy Engine :8080)
    participant IPS as integration-platform-<br/>api-service (:8080)
    participant PAS as platform-api-service<br/>(:8081)

    Note over B: User navigates to project list

    %% Step 1: Browser → External Gateway
    B->>EG: GET /integration-platform-api-service-integration-platform-api-http/projects<br/>Host: development-wso2cloud.openchoreoapis.localhost<br/>Authorization: Bearer <jwt><br/>Origin: http://devant-consol-...localhost:19080

    Note over EG: HTTPRoute matches path prefix<br/>/integration-platform-api-service-integration-platform-api-http<br/>Rewrites to /integration-platform-api/v1.0

    %% Step 2: External Gateway → Internal Gateway
    EG->>IG: GET /integration-platform-api/v1.0/projects<br/>(forwarded to api-gw-backend)

    Note over IG: Route match: /integration-platform-api/v1.0/*<br/>1. CORS policy — validate Origin<br/>2. JWT policy — validate token signature<br/>   via platform-idp JWKS endpoint<br/>3. Strip context path

    %% Step 3: Internal Gateway → Go service
    IG->>IPS: GET /projects<br/>Authorization: Bearer <jwt>

    Note over IPS: JWT middleware parses ouHandle claim<br/>→ orgName = "myorg"

    %% Step 4: Go service → External Gateway (internal call)
    IPS->>EG: GET /platform-api-service-platform-api-endpoint/projects<br/>Host: development-wso2cloud.openchoreoapis.localhost<br/>Authorization: Bearer <jwt><br/>(via gateway-default.openchoreo-data-plane.svc:19080)

    Note over EG: HTTPRoute matches path prefix<br/>/platform-api-service-platform-api-endpoint<br/>Rewrites to /cloud-core-api/v1.0

    %% Step 5: External Gateway → Internal Gateway
    EG->>IG: GET /cloud-core-api/v1.0/projects

    Note over IG: Route match: /cloud-core-api/v1.0/*<br/>1. CORS policy — skip (server-to-server)<br/>2. JWT policy — validate token<br/>3. Strip context, prepend upstreamBasePath

    %% Step 6: Internal Gateway → platform-api-service
    IG->>PAS: GET /wso2cloud-dp/projects

    PAS-->>IG: 200 OK [{project1}, {project2}]
    IG-->>EG: 200 OK
    EG-->>IPS: 200 OK [{project1}, {project2}]

    Note over IPS: Normalize response,<br/>add integration-specific fields if needed

    IPS-->>IG: 200 OK {items: [...]}
    IG-->>EG: 200 OK<br/>Access-Control-Allow-Origin: http://devant-consol-...
    EG-->>B: 200 OK {items: [...]}
```

### OAuth2 Authentication Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant DC as devant-console
    participant IDP as platform-idp<br/>(Thunder/Asgardeo)

    B->>DC: Navigate to /login
    DC->>IDP: Redirect to /authorize<br/>client_id=DEVANT_CONSOLE<br/>redirect_uri=.../callback<br/>scope=openid profile email

    Note over IDP: User enters credentials<br/>(BasicAuthenticator)

    IDP->>DC: Redirect to /callback?code=<auth_code>
    DC->>IDP: POST /token<br/>grant_type=authorization_code<br/>code=<auth_code>
    IDP-->>DC: {access_token, id_token, refresh_token}

    Note over DC: Store tokens<br/>access_token used as Bearer token<br/>for all API calls

    DC->>B: Redirect to dashboard
```

## Two-Tier Gateway Architecture

### Tier 1 — External Envoy Gateway

| Property | Value |
|----------|-------|
| Service | `gateway-default` |
| Namespace | `openchoreo-data-plane` |
| Ports | `19080` (HTTP), `19443` (HTTPS) |
| Type | `LoadBalancer` (LB IP: `172.18.0.3` in k3d) |
| Managed by | Envoy Gateway (via `Gateway` CRD) |

**Responsibilities:**
- Terminates external HTTP/HTTPS traffic
- Routes requests based on `HTTPRoute` rules (hostname + path prefix)
- Rewrites URL prefixes before forwarding to the Backend resource
- Does **not** enforce authentication or CORS

**HTTPRoute Rules:**

| Path Prefix | Rewrites To | Backend |
|-------------|-------------|---------|
| `/integration-platform-api-service-integration-platform-api-http` | `/integration-platform-api/v1.0` | `integration-platform-api-service-api-gw-backend` |
| `/platform-api-service-platform-api-endpoint` | `/cloud-core-api/v1.0` | `platform-api-service-api-gw-backend` |

The path prefix is auto-generated by the OpenChoreo controller from: `/{component-name}-{endpoint-name}`, where endpoint name comes from `workload.yaml`.

All Backend resources point to the same internal API gateway:

```
api-platform-default-gateway-gateway-runtime.openchoreo-data-plane:8080
```

### Tier 2 — Internal API Gateway (Policy Engine)

| Property | Value |
|----------|-------|
| Service | `api-platform-default-gateway-gateway-runtime` |
| Namespace | `openchoreo-data-plane` |
| Port | `8080` |
| Config port | `9002` |
| Managed by | `api-platform-default-gateway-controller` |

**Responsibilities:**
- Matches incoming requests by context path
- Enforces policies (CORS, JWT authentication)
- Strips the context path and forwards to the upstream service
- Optionally prepends `upstreamBasePath` before forwarding

**Route Configuration (via RestApi CRD):**

| Context Path | Upstream URL | Policies |
|--------------|-------------|----------|
| `/integration-platform-api/v1.0/*` | `http://integration-platform-api-service.dp-wso2cloud-devant-development-0bea7a4d:8080` | cors (v0), jwt-auth (v0) |
| `/cloud-core-api/v1.0/*` | `http://platform-api-service.dp-wso2cloud-core-development-54e3d6ff:8081/wso2cloud-dp` | cors (v0), jwt-auth (v0) |

**Path transformation example:**

```
Browser request:
  /integration-platform-api-service-integration-platform-api-http/projects

After Tier 1 (External Gateway) URL rewrite:
  /integration-platform-api/v1.0/projects

After Tier 2 (Internal Gateway) context strip:
  /projects  →  forwarded to integration-platform-api-service:8080

After Tier 2 for platform-api-service (with upstreamBasePath):
  /cloud-core-api/v1.0/projects  →  /wso2cloud-dp/projects  →  forwarded to platform-api-service:8081
```

## CORS Policy Configuration

CORS is enforced **exclusively at the Internal API Gateway** (Tier 2) via the `api-configuration` ClusterTrait. Neither the Go backend nor the frontend set CORS headers.

### integration-platform-api-service CORS Policy

```yaml
# Source: component.yaml → traits → api-configuration → policies
- name: cors
  version: v0
  params:
    allowedOrigins:
      - "http://devant-consol-devant-consol-development-wso2cloud-87640b2b.openchoreoapis.localhost:19080"
      - "http://localhost:3000"     # nginx container port (production)
      - "http://localhost:3001"     # Vite dev server port
    allowCredentials: true
    allowedHeaders:
      - Authorization
      - Content-Type
      - Accept
      - Origin
    allowedMethods:
      - GET
      - POST
      - PUT
      - DELETE
      - PATCH
      - OPTIONS
```

### platform-api-service CORS Policy

```yaml
- name: cors
  version: v0
  params:
    allowedOrigins:
      - "http://cloud-console-cloud-console-development-wso2cloud-3877df74.openchoreoapis.localhost:19080"
      - "http://sample-consol-sample-consol-development-wso2cloud-eb8e8c84.openchoreoapis.localhost:19080"
      - "http://devant-consol-devant-consol-development-wso2cloud-87640b2b.openchoreoapis.localhost:19080"
      - "http://localhost:3000"
    allowCredentials: true
    allowedHeaders:
      - Authorization
      - Content-Type
      - Accept
      - Origin
    allowedMethods:
      - GET
      - POST
      - PUT
      - DELETE
      - PATCH
      - OPTIONS
```

### platform-idp CORS (Separate Config)

Platform-idp manages its own CORS via application config (`corsAllowedOrigins` in release binding), not the gateway trait. It includes all console origins plus localhost dev ports.

### Why No CORS in Application Code

The devant-console uses two strategies to avoid cross-origin issues at the application layer:

1. **Production (in-cluster):** nginx reverse proxy at `/integration-platform-api-service/*` forwards to the gateway server-side. The browser sees same-origin requests.
2. **Local development:** Vite dev server proxy does the same (`vite.config.ts` → `proxy`).

Even when the release binding overrides `VITE_CORE_DP_API_BASE_URL` with an absolute gateway URL (making requests cross-origin from the browser), the gateway's CORS policy handles the `Access-Control-*` response headers. The Go backend never sets CORS headers, avoiding duplicate header conflicts.

## OpenChoreo Resource Model

```mermaid
graph TD
    subgraph "Component Definition (GitOps)"
        CY["component.yaml<br/>kind: Component"]
        WY["workload.yaml<br/>endpoints definition"]
    end

    subgraph "OpenChoreo Controller"
        OC["OpenChoreo Controller<br/>(control plane)"]
    end

    subgraph "Generated Resources (data plane)"
        RR["RenderedRelease<br/>Orchestrates all data-plane resources"]
        HR["HTTPRoute<br/>Tier 1 routing rules"]
        BE["Backend<br/>Points to internal gateway"]
        RA["RestApi<br/>Tier 2 route + policy config"]
        DEP["Deployment + Service<br/>Application pods"]
    end

    CY -->|"reconciled by"| OC
    WY -->|"endpoint name → path prefix"| OC
    OC -->|"creates"| RR
    RR -->|"manages"| HR
    RR -->|"manages"| BE
    RR -->|"manages"| RA
    RR -->|"manages"| DEP

    CY -->|"traits[].name: api-configuration"| RA
    CY -->|"traits[].parameters.policies"| RA
```

### Key Resources

| Resource | Purpose | Created By |
|----------|---------|------------|
| `Component` | Declares the service, its workflow, and traits | Developer (GitOps) |
| `ReleaseBinding` | Environment-specific config overrides (env vars, files) | Developer (GitOps) |
| `RenderedRelease` | Reconciled state combining Component + ReleaseBinding | OpenChoreo controller |
| `HTTPRoute` | Tier 1 gateway routing (path prefix → backend) | `renderedrelease-controller` |
| `Backend` | Points HTTPRoute to the internal API gateway | `renderedrelease-controller` |
| `RestApi` | Tier 2 gateway config (context path, policies, upstream) | `renderedrelease-controller` |
| `ClusterTrait` (`api-configuration`) | Template for generating RestApi from component traits | Platform team |

## Service-to-Service Communication

The integration-platform-api-service calls platform-api-service **through the gateway** (not pod-to-pod) for two reasons:

1. **NetworkPolicy:** Cross-namespace pod communication is blocked. The gateway namespace has the required network access.
2. **DNS resolution:** The hostname `development-wso2cloud.openchoreoapis.localhost` does not resolve inside cluster pods (`.localhost` is not routable). The service uses the internal gateway service URL instead:

```
# What the Go service calls (env: PLATFORM_API_SERVICE_BASE_URL)
http://gateway-default.openchoreo-data-plane.svc.cluster.local:19080
    /platform-api-service-platform-api-endpoint

# With explicit Host header (env: PLATFORM_API_SERVICE_HOST)
Host: development-wso2cloud.openchoreoapis.localhost
```

The Host header is required because the Envoy gateway uses it to match HTTPRoute rules. Without it, the gateway cannot route the request.

```mermaid
sequenceDiagram
    participant IPS as integration-platform-<br/>api-service
    participant GW as gateway-default<br/>(Envoy :19080)
    participant IG as Internal Gateway<br/>(:8080)
    participant PAS as platform-api-service<br/>(:8081)

    Note over IPS: URL: gateway-default.openchoreo-data-plane.svc:19080<br/>+ Host header for routing

    IPS->>GW: GET /platform-api-service-platform-api-endpoint/projects<br/>Host: development-wso2cloud.openchoreoapis.localhost<br/>Authorization: Bearer <jwt>

    GW->>IG: GET /cloud-core-api/v1.0/projects
    IG->>PAS: GET /wso2cloud-dp/projects
    PAS-->>IG: 200 OK
    IG-->>GW: 200 OK
    GW-->>IPS: 200 OK
```

## Configuration Reference

### integration-platform-api-service Environment Variables

| Variable | Source | Value |
|----------|--------|-------|
| `PLATFORM_API_SERVICE_BASE_URL` | ReleaseBinding | `http://gateway-default.openchoreo-data-plane.svc.cluster.local:19080/platform-api-service-platform-api-endpoint` |
| `PLATFORM_API_SERVICE_HOST` | ReleaseBinding | `development-wso2cloud.openchoreoapis.localhost` |
| `LOG_LEVEL` | ReleaseBinding | `info` |

### devant-console Runtime Configuration (env-config.js)

| Variable | Value |
|----------|-------|
| `VITE_CORE_DP_API_BASE_URL` | `http://development-wso2cloud.openchoreoapis.localhost:19080/integration-platform-api-service-integration-platform-api-http` |
| `VITE_PLATFORM_IDP_URL` | `http://platform-idp.127.0.0.1.nip.io:19080` |
| `VITE_THUNDER_CLIENT_ID` | `DEVANT_CONSOLE` |
| `VITE_THUNDER_REDIRECT_URI` | `http://devant-consol-devant-consol-development-wso2cloud-87640b2b.openchoreoapis.localhost:19080/callback` |

### Kubernetes Namespaces

| Namespace | Contents |
|-----------|----------|
| `openchoreo-data-plane` | External gateway, internal API gateway, gateway controllers |
| `dp-wso2cloud-devant-development-0bea7a4d` | integration-platform-api-service pods, HTTPRoute, Backend, RestApi |
| `dp-wso2cloud-core-development-54e3d6ff` | platform-api-service pods, HTTPRoute, Backend, RestApi |
| `wso2cloud` | Component definitions, ReleaseBindings, RenderedReleases |

## Troubleshooting

### Common 404 Causes

1. **RestApi not Programmed** — Check `kubectl get restapi <name> -n <ns> -o jsonpath='{.status.conditions}'`. If `Programmed` is `False`, the internal gateway rejected the config (e.g. invalid policy version).

2. **Go service expects wrong path** — The internal gateway strips the context path. The service must register routes at root level (`/projects`), not under the context path (`/integration-platform-api/v1.0/projects`).

3. **Missing Host header (service-to-service)** — Calls through the external gateway require the correct `Host` header for HTTPRoute matching. Without it, the gateway returns 404.

### Common CORS Errors

1. **Missing origin in CORS policy** — The browser's `Origin` header must match an entry in the `allowedOrigins` list in the component's `api-configuration` trait.

2. **Duplicate CORS headers** — If both the gateway and the application set `Access-Control-*` headers, the browser may reject the response. The application must not set CORS headers when the gateway handles them.

### Checking Gateway Routes

```bash
# Verify RestApi is deployed and accepted
kubectl get restapi -A

# Check RestApi status
kubectl get restapi <name> -n <namespace> -o jsonpath='{.status.conditions}' | python3 -m json.tool

# Verify HTTPRoute exists
kubectl get httproute -A | grep integration-platform

# Check the Backend target
kubectl get backend -A -o json | python3 -c "
import json, sys
for item in json.load(sys.stdin)['items']:
    print(f\"{item['metadata']['namespace']}/{item['metadata']['name']}: {item['spec']}\")
"
```
