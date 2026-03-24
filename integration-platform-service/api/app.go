package api

import (
	"net/http"

	"github.com/gabilang/integration-platform/integration-platform-service/controllers"
	"github.com/gabilang/integration-platform/integration-platform-service/middleware"
	jwtmw "github.com/gabilang/integration-platform/integration-platform-service/middleware/jwt"
	"github.com/gabilang/integration-platform/integration-platform-service/middleware/logger"
)

// AppParams holds all dependencies needed to build the HTTP handler.
type AppParams struct {
	ProjectController   controllers.ProjectController
	ComponentController controllers.ComponentController
}

// NewHandler assembles the full HTTP handler with middleware and routes.
// The internal API gateway strips the context path (/integration-platform-api/v1.0)
// before forwarding, so routes are registered at root level.
func NewHandler(params AppParams) http.Handler {
	mux := http.NewServeMux()

	// Health check — unauthenticated
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`)) //nolint:errcheck
	})

	// API routes — protected by JWT middleware
	apiMux := http.NewServeMux()
	registerProjectRoutes(apiMux, params.ProjectController)
	registerComponentRoutes(apiMux, params.ComponentController)

	mux.Handle("/", jwtmw.Middleware(apiMux))

	// Global middleware stack (outermost applied last)
	var handler http.Handler = mux
	handler = middleware.ExtractAuthToken()(handler)
	handler = logger.RequestLogger()(handler)
	handler = middleware.AddCorrelationID()(handler)
	handler = middleware.RecovererOnPanic()(handler)

	return handler
}
