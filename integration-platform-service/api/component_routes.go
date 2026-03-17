package api

import (
	"net/http"

	"github.com/gabilang/integration-platform/integration-platform-service/controllers"
)

func registerComponentRoutes(mux *http.ServeMux, c controllers.ComponentController) {
	mux.HandleFunc("GET /projects/{projectName}/components", c.ListComponents)
	mux.HandleFunc("POST /projects/{projectName}/components", c.CreateComponent)
}
