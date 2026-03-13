package config

type Config struct {
	ServerHost string
	ServerPort int
	LogLevel   string

	CORSAllowedOrigins string

	PlatformAPI PlatformAPIConfig
}

// PlatformAPIConfig holds connection settings for the platform-api-service,
// which acts as the API gateway to the OpenChoreo control plane.
type PlatformAPIConfig struct {
	BaseURL string
}
