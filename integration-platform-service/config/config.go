package config

type Config struct {
	ServerHost string
	ServerPort int
	LogLevel   string

	PlatformAPI   PlatformAPIConfig
	Observability ObservabilityConfig
}

// PlatformAPIConfig holds connection settings for the platform-api-service,
// which acts as the API gateway to the OpenChoreo control plane.
type PlatformAPIConfig struct {
	BaseURL string
}

// ObservabilityConfig holds connection settings for the observability service.
// BaseURL is optional; if empty, build log endpoints return an unavailable error.
type ObservabilityConfig struct {
	BaseURL string
}
