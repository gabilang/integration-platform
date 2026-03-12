# integration-platform-service

A Go REST API service that acts as an API layer for the [OpenChoreo](https://github.com/openchoreo/openchoreo) integration platform. It proxies and exposes resource management operations to the Devant Console and other consumers.

## Project Structure

```
integration-platform-service/
├── cmd/
│   └── platform-api/
│       └── main.go               # Entry point — wires dependencies and starts the HTTP server
├── api/
│   ├── app.go                    # Assembles the HTTP handler and middleware chain
│   └── project_routes.go         # Project route registration
├── clients/
│   ├── openchoreo/
│   │   └── project_client.go     # OpenChoreo API client for project operations
│   └── requests/
│       ├── http_request.go       # Fluent HTTP request builder
│       ├── http_error.go         # HTTP error type
│       └── send_request.go       # HTTP execution and response scanning
├── config/
│   ├── config.go                 # Configuration structs
│   └── config_loader.go          # Environment variable loading
├── controllers/
│   └── project_controller.go     # HTTP handlers for project endpoints
├── middleware/
│   ├── cors.go                   # CORS middleware
│   ├── correlation_id.go         # Correlation ID propagation
│   ├── panic_recover.go          # Panic recovery
│   └── logger/
│       └── request_logger.go     # Structured request logging
├── models/
│   └── project.go                # Project request/response types
├── services/
│   └── project_service.go        # Business logic and error translation
└── utils/
    └── response.go               # JSON response helpers
```

## API Endpoints

| Method   | Path                                                    | Description           |
|----------|---------------------------------------------------------|-----------------------|
| `GET`    | `/health`                                               | Health check          |
| `GET`    | `/organizations/{orgName}/projects`                     | List projects         |
| `POST`   | `/organizations/{orgName}/projects`                     | Create a project      |
| `GET`    | `/organizations/{orgName}/projects/{projectName}`       | Get a project         |
| `PUT`    | `/organizations/{orgName}/projects/{projectName}`       | Update a project      |
| `DELETE` | `/organizations/{orgName}/projects/{projectName}`       | Delete a project      |

## Configuration

Configuration is loaded from environment variables. Set `ENV_FILE_PATH` to point to a `.env` file for local development.

| Variable                | Required | Default                 | Description                          |
|-------------------------|----------|-------------------------|--------------------------------------|
| `OPENCHOREO_BASE_URL`   | Yes      | —                       | OpenChoreo API base URL              |
| `OPENCHOREO_TOKEN`      | No       | —                       | Bearer token for OpenChoreo API auth |
| `SERVER_HOST`           | No       | `0.0.0.0`               | Server bind address                  |
| `SERVER_PORT`           | No       | `8080`                  | Server port                          |
| `LOG_LEVEL`             | No       | `info`                  | Log level: debug, info, warn, error  |
| `CORS_ALLOWED_ORIGINS`  | No       | `*`                     | Allowed CORS origin                  |
| `ENV_FILE_PATH`         | No       | —                       | Path to a `.env` file                |

## Getting Started

### Prerequisites

- Go 1.25+
- Access to an OpenChoreo API instance

### Run locally

```bash
export OPENCHOREO_BASE_URL=http://localhost:19080/wso2cloud-dp
export OPENCHOREO_TOKEN=<your-token>

make run
```

### Build

```bash
make build
# Binary output: bin/platform-api
```

### Using a .env file

```bash
cp .env.example .env
# Edit .env with your values
ENV_FILE_PATH=.env make run
```

## Development

```bash
# Tidy dependencies
make tidy

# Build binary
make build

# Run directly
make run

# Remove build artifacts
make clean
```
