package api

import (
	"net/http"

	"github.com/gabilang/integration-platform/integration-platform-service/controllers"
	"github.com/gabilang/integration-platform/integration-platform-service/middleware"
	"github.com/gabilang/integration-platform/integration-platform-service/middleware/logger"
)

// AppParams holds all dependencies needed to build the HTTP handler.
type AppParams struct {
	CORSAllowedOrigins string
	ProjectController  controllers.ProjectController
}

// NewHandler assembles the full HTTP handler with middleware and routes.
func NewHandler(params AppParams) http.Handler {
	mux := http.NewServeMux()

	// Health check — no auth, no middleware
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`)) //nolint:errcheck
	})

	// API routes
	registerProjectRoutes(mux, params.ProjectController)

	// Apply middleware (outermost first, innermost applied last)
	var handler http.Handler = mux
	handler = logger.RequestLogger()(handler)
	handler = middleware.AddCorrelationID()(handler)
	handler = middleware.CORS(params.CORSAllowedOrigins)(handler)
	handler = middleware.RecovererOnPanic()(handler)

	return handler
}
