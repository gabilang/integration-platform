package controllers

import (
	"encoding/json"
	"log/slog"
	"net/http"

	jwtmw "github.com/gabilang/integration-platform/integration-platform-service/middleware/jwt"
	"github.com/gabilang/integration-platform/integration-platform-service/models"
	"github.com/gabilang/integration-platform/integration-platform-service/services"
	"github.com/gabilang/integration-platform/integration-platform-service/utils"
)

// ComponentController handles HTTP requests for component operations.
type ComponentController interface {
	CreateServiceComponent(w http.ResponseWriter, r *http.Request)
}

type componentController struct {
	service services.ComponentService
}

func NewComponentController(service services.ComponentService) ComponentController {
	return &componentController{service: service}
}

func (c *componentController) CreateServiceComponent(w http.ResponseWriter, r *http.Request) {
	claims := jwtmw.ClaimsFromContext(r.Context())
	if claims == nil || claims.OrgHandle == "" {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, "missing org context")
		return
	}
	org := claims.OrgHandle
	projectName := r.PathValue("projectName")

	var req models.CreateServiceComponentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.Repository.URL == "" {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "repository.url is required")
		return
	}
	if req.Build.Type == "" {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "build.type is required")
		return
	}

	resp, err := c.service.CreateServiceComponent(r.Context(), org, projectName, &req)
	if err != nil {
		slog.ErrorContext(r.Context(), "create service component failed",
			"error", err, "org", org, "project", projectName)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "failed to create service component")
		return
	}

	utils.WriteSuccessResponse(w, http.StatusCreated, resp)
}
