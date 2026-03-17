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
	ListComponents(w http.ResponseWriter, r *http.Request)
	CreateComponent(w http.ResponseWriter, r *http.Request)
}

type componentController struct {
	service services.ComponentService
}

func NewComponentController(service services.ComponentService) ComponentController {
	return &componentController{service: service}
}

func (c *componentController) ListComponents(w http.ResponseWriter, r *http.Request) {
	claims := jwtmw.ClaimsFromContext(r.Context())
	if claims == nil || claims.OrgHandle == "" {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, "missing org context")
		return
	}
	org := claims.OrgHandle
	projectName := r.PathValue("projectName")
	cursor := r.URL.Query().Get("cursor")

	list, err := c.service.ListComponents(r.Context(), org, projectName, 100, cursor)
	if err != nil {
		slog.ErrorContext(r.Context(), "list components failed",
			"error", err, "org", org, "project", projectName)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "failed to list components")
		return
	}

	utils.WriteSuccessResponse(w, http.StatusOK, list)
}

func (c *componentController) CreateComponent(w http.ResponseWriter, r *http.Request) {
	claims := jwtmw.ClaimsFromContext(r.Context())
	if claims == nil || claims.OrgHandle == "" {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, "missing org context")
		return
	}
	org := claims.OrgHandle
	projectName := r.PathValue("projectName")

	var req models.CreateComponentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		utils.WriteErrorResponse(w, http.StatusBadRequest, "name is required")
		return
	}

	resp, err := c.service.CreateComponent(r.Context(), org, projectName, &req)
	if err != nil {
		slog.ErrorContext(r.Context(), "create component failed",
			"error", err, "org", org, "project", projectName)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "failed to create component")
		return
	}

	utils.WriteSuccessResponse(w, http.StatusCreated, resp)
}
