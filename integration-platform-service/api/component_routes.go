package api

import (
	"net/http"

	"github.com/gabilang/integration-platform/integration-platform-service/controllers"
)

func registerComponentRoutes(mux *http.ServeMux, c controllers.ComponentController) {
	mux.HandleFunc("POST /projects/{projectName}/components", c.CreateServiceComponent)
}
