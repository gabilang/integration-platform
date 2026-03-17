package services

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gabilang/integration-platform/integration-platform-service/clients/openchoreo"
	"github.com/gabilang/integration-platform/integration-platform-service/clients/requests"
	"github.com/gabilang/integration-platform/integration-platform-service/models"
)

var ErrComponentNotFound = errors.New("component not found")

// ComponentService handles business logic for component operations.
type ComponentService interface {
	CreateServiceComponent(ctx context.Context, orgName, projectName string, req *models.CreateServiceComponentRequest) (*models.CreateServiceComponentResponse, error)
}

type componentService struct {
	client openchoreo.ComponentClient
}

func NewComponentService(client openchoreo.ComponentClient) ComponentService {
	return &componentService{client: client}
}

// CreateServiceComponent creates the component and triggers its initial build.
// If the build trigger fails the component is still returned — the caller can
// retry the build later.
func (s *componentService) CreateServiceComponent(ctx context.Context, orgName, projectName string, req *models.CreateServiceComponentRequest) (*models.CreateServiceComponentResponse, error) {
	component, err := s.client.CreateServiceComponent(ctx, orgName, projectName, req)
	if err != nil {
		return nil, translateComponentHTTPError(err)
	}

	buildRun, err := s.client.TriggerBuild(ctx, orgName, projectName, component.Name)
	if err != nil {
		// Log but don't fail — component was created successfully.
		slog.WarnContext(ctx, "initial build trigger failed",
			"error", err,
			"org", orgName,
			"project", projectName,
			"component", component.Name,
		)
	}

	return &models.CreateServiceComponentResponse{
		Component: component,
		BuildRun:  buildRun,
	}, nil
}

func translateComponentHTTPError(err error) error {
	if err == nil {
		return nil
	}
	var httpErr *requests.HttpError
	if errors.As(err, &httpErr) {
		switch httpErr.StatusCode {
		case http.StatusNotFound:
			return fmt.Errorf("%w: %s", ErrComponentNotFound, httpErr.Body)
		}
	}
	return err
}
