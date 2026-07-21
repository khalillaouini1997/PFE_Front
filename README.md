# PFE Frontend — Angular Admin Dashboard

Fleet management admin dashboard built with Angular 19 and PrimeNG.

## Tech Stack

- **Framework:** Angular 19 (Standalone components)
- **UI:** PrimeNG + Bootstrap
- **State:** Angular Signals
- **Charts:** Chart.js
- **Maps:** Leaflet
- **WebSocket:** SockJS + STOMP

## CI/CD Pipeline (GitLab)

```
lint-test-audit → docker-build-scan-push → sonarcloud
```

| Stage | Description |
|-------|-------------|
| `lint-test-audit` | ESLint, unit tests with coverage, npm audit |
| `docker` | Builds Docker image (nginx), pushes to `registry.gitlab.com` |
| `sonarcloud` | SonarCloud code quality analysis |

### Required CI/CD Variables

| Variable | Purpose |
|----------|---------|
| `SONAR_TOKEN` | SonarCloud authentication |

## Setup

### Prerequisites
- Node.js 24+
- npm

### Install Dependencies
```bash
npm ci --legacy-peer-deps
```

### Run Locally
```bash
ng serve
```

Navigate to `http://localhost:4200/`

### Build
```bash
ng build --configuration production
```

### Run Tests
```bash
ng test --watch=false
```

### Lint
```bash
ng lint
```

## Docker

```bash
docker build -t pfe_front .
docker run -p 4200:4200 pfe_front
```

## Project Structure

```
src/app/
├── admin-web-component/     # Feature modules (dashboard, billing, config, etc.)
├── shared/                  # Shared components, stores, styles
├── service/                 # HTTP services
├── utils/                   # Interceptors, guards, helpers
├── data/                    # Models and interfaces
└── environments/            # Environment configs
```
