package api

import (
	"net/http"

	"github.com/gabilang/integration-platform/integration-platform-service/controllers"
)

func registerProjectRoutes(mux *http.ServeMux, c controllers.ProjectController) {
	mux.HandleFunc("GET /organizations/{orgName}/projects", c.ListProjects)
	mux.HandleFunc("POST /organizations/{orgName}/projects", c.CreateProject)
	mux.HandleFunc("GET /organizations/{orgName}/projects/{projectName}", c.GetProject)
	mux.HandleFunc("PUT /organizations/{orgName}/projects/{projectName}", c.UpdateProject)
	mux.HandleFunc("DELETE /organizations/{orgName}/projects/{projectName}", c.DeleteProject)
}
