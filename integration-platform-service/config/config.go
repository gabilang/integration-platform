package config

type Config struct {
	ServerHost string
	ServerPort int
	LogLevel   string

	CORSAllowedOrigins string

	OpenChoreo OpenChoreoConfig
}

type OpenChoreoConfig struct {
	BaseURL string
}
