#!/bin/sh
set -e

echo "🚀 Devant Console - Initializing runtime configuration..."

PLATFORM_API_PROXY_URL="${PLATFORM_API_PROXY_URL:-http://default.development.openchoreoapis.localhost:19080}"
# Hostname used in the proxied request's Host header so the gateway routes correctly.
# Defaults to the hostname extracted from PLATFORM_API_PROXY_URL.
PLATFORM_API_HOST="${PLATFORM_API_HOST:-$(echo "$PLATFORM_API_PROXY_URL" | sed 's|^https\?://||' | sed 's|/.*||' | sed 's|:.*||')}"
THUNDER_URL="${VITE_THUNDER_URL:-$VITE_PLATFORM_IDP_URL}"
THUNDER_APP_ID="${VITE_THUNDER_APP_ID:-}"
THUNDER_CLIENT_ID="${VITE_THUNDER_CLIENT_ID:-}"
THUNDER_CLIENT_SECRET="${VITE_THUNDER_CLIENT_SECRET:-}"
THUNDER_REDIRECT_URI="${VITE_THUNDER_REDIRECT_URI:-}"
THUNDER_SCOPES="${VITE_THUNDER_SCOPES:-openid profile email}"
THUNDER_AUTHENTICATOR="${VITE_THUNDER_AUTHENTICATOR:-BasicAuthenticator}"
THUNDER_AFTER_SIGN_IN_URL="${VITE_THUNDER_AFTER_SIGN_IN_URL:-}"
THUNDER_AFTER_SIGN_OUT_URL="${VITE_THUNDER_AFTER_SIGN_OUT_URL:-}"

cat > /usr/share/nginx/html/env-config.js <<EOF_INNER || echo "env-config.js is read-only (provided by platform injection), skipping write"
// Runtime environment configuration
// Generated at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

window._env_ = {
  // Platform/Core APIs
  VITE_PLATFORM_IDP_URL: "${VITE_PLATFORM_IDP_URL:-}",
  VITE_CORE_DP_API_BASE_URL: "${VITE_CORE_DP_API_BASE_URL:-/integration-platform-api-service}",

  // Thunder/Asgardeo Authentication
  VITE_THUNDER_URL: "${THUNDER_URL}",
  VITE_THUNDER_APP_ID: "${THUNDER_APP_ID}",
  VITE_THUNDER_CLIENT_ID: "${THUNDER_CLIENT_ID}",
  VITE_THUNDER_CLIENT_SECRET: "${THUNDER_CLIENT_SECRET}",
  VITE_THUNDER_REDIRECT_URI: "${THUNDER_REDIRECT_URI}",
  VITE_THUNDER_SCOPES: "${THUNDER_SCOPES}",
  VITE_THUNDER_AUTHENTICATOR: "${THUNDER_AUTHENTICATOR}",
  VITE_THUNDER_AFTER_SIGN_IN_URL: "${THUNDER_AFTER_SIGN_IN_URL}",
  VITE_THUNDER_AFTER_SIGN_OUT_URL: "${THUNDER_AFTER_SIGN_OUT_URL}",

  // Development
  VITE_DEV_BYPASS_AUTH: "${VITE_DEV_BYPASS_AUTH:-}",
};

console.log('[Devant Console] Runtime configuration loaded:', {
  platformIdpUrl: window._env_.VITE_PLATFORM_IDP_URL,
  coreDpApiBaseUrl: window._env_.VITE_CORE_DP_API_BASE_URL,
  thunderUrl: window._env_.VITE_THUNDER_URL,
  clientId: window._env_.VITE_THUNDER_CLIENT_ID,
});
EOF_INNER

echo "✅ Runtime configuration generated at /usr/share/nginx/html/env-config.js"

# Substitute the platform API proxy URL into nginx.conf.
# Requests to /platform-api-service/* are forwarded to PLATFORM_API_PROXY_URL,
# keeping them same-origin from the browser's perspective (no CORS).
sed -i "s|__PLATFORM_API_PROXY_URL__|${PLATFORM_API_PROXY_URL}|g" /etc/nginx/nginx.conf
sed -i "s|__PLATFORM_API_HOST__|${PLATFORM_API_HOST}|g" /etc/nginx/nginx.conf
echo "✅ Nginx proxy configured: /platform-api-service/ -> ${PLATFORM_API_PROXY_URL}/platform-api-service/ (Host: ${PLATFORM_API_HOST})"
echo "✅ Nginx proxy configured: /integration-platform-api-service/ -> ${PLATFORM_API_PROXY_URL}/integration-platform-api-service/ (Host: ${PLATFORM_API_HOST})"

echo "📋 Configuration Summary:"
echo "   Platform IDP URL: ${VITE_PLATFORM_IDP_URL:-[NOT SET]}"
echo "   Core DP API Base URL: ${VITE_CORE_DP_API_BASE_URL:-/integration-platform-api-service}"
echo "   Platform API Proxy URL: ${PLATFORM_API_PROXY_URL}
   Platform API Host:      ${PLATFORM_API_HOST}"
echo "   Thunder URL: ${THUNDER_URL:-[NOT SET]}"
echo "   Thunder Client ID: ${THUNDER_CLIENT_ID:-[NOT SET]}"

echo "🌐 Starting nginx on port 3000..."
exec "$@"
