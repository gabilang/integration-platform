package controllers

import (
	"encoding/json"
	"errors"
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
	ListBuilds(w http.ResponseWriter, r *http.Request)
	GetBuildStatus(w http.ResponseWriter, r *http.Request)
	GetBuildLogs(w http.ResponseWriter, r *http.Request)
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
		if errors.Is(err, services.ErrUnauthorized) {
			utils.WriteErrorResponse(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
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
		if errors.Is(err, services.ErrUnauthorized) {
			utils.WriteErrorResponse(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		slog.ErrorContext(r.Context(), "create component failed",
			"error", err, "org", org, "project", projectName)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "failed to create component")
		return
	}

	utils.WriteSuccessResponse(w, http.StatusCreated, resp)
}

func (c *componentController) ListBuilds(w http.ResponseWriter, r *http.Request) {
	claims := jwtmw.ClaimsFromContext(r.Context())
	if claims == nil || claims.OrgHandle == "" {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, "missing org context")
		return
	}
	org := claims.OrgHandle
	projectName := r.PathValue("projectName")
	componentName := r.PathValue("componentName")
	cursor := r.URL.Query().Get("cursor")

	list, err := c.service.ListBuilds(r.Context(), org, projectName, componentName, 20, cursor)
	if err != nil {
		if errors.Is(err, services.ErrUnauthorized) {
			utils.WriteErrorResponse(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		slog.ErrorContext(r.Context(), "list builds failed",
			"error", err, "org", org, "project", projectName, "component", componentName)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "failed to list builds")
		return
	}

	utils.WriteSuccessResponse(w, http.StatusOK, list)
}

func (c *componentController) GetBuildStatus(w http.ResponseWriter, r *http.Request) {
	claims := jwtmw.ClaimsFromContext(r.Context())
	if claims == nil || claims.OrgHandle == "" {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, "missing org context")
		return
	}
	org := claims.OrgHandle
	projectName := r.PathValue("projectName")
	componentName := r.PathValue("componentName")
	buildName := r.PathValue("buildName")

	run, err := c.service.GetBuildStatus(r.Context(), org, projectName, componentName, buildName)
	if err != nil {
		if errors.Is(err, services.ErrUnauthorized) {
			utils.WriteErrorResponse(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		if errors.Is(err, services.ErrBuildNotFound) {
			utils.WriteErrorResponse(w, http.StatusNotFound, "build not found")
			return
		}
		slog.ErrorContext(r.Context(), "get build status failed",
			"error", err, "org", org, "project", projectName, "component", componentName, "build", buildName)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "failed to get build status")
		return
	}

	utils.WriteSuccessResponse(w, http.StatusOK, run)
}

func (c *componentController) GetBuildLogs(w http.ResponseWriter, r *http.Request) {
	claims := jwtmw.ClaimsFromContext(r.Context())
	if claims == nil || claims.OrgHandle == "" {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, "missing org context")
		return
	}
	org := claims.OrgHandle
	projectName := r.PathValue("projectName")
	componentName := r.PathValue("componentName")
	buildName := r.PathValue("buildName")

	logs, err := c.service.GetBuildLogs(r.Context(), org, projectName, componentName, buildName)
	if err != nil {
		if errors.Is(err, services.ErrUnauthorized) {
			utils.WriteErrorResponse(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}
		if errors.Is(err, services.ErrLogsUnavailable) {
			utils.WriteErrorResponse(w, http.StatusServiceUnavailable, "build logs service not available")
			return
		}
		slog.ErrorContext(r.Context(), "get build logs failed",
			"error", err, "org", org, "project", projectName, "component", componentName, "build", buildName)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "failed to get build logs")
		return
	}

	utils.WriteSuccessResponse(w, http.StatusOK, logs)
}
