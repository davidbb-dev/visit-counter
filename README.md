# Visit Counter

[![CI](https://github.com/davidbb-dev/visit-counter/actions/workflows/ci.yml/badge.svg)](https://github.com/davidbb-dev/visit-counter/actions/workflows/ci.yml)

A small Node.js/Express app that counts visits in Redis. It runs with Docker Compose, with Nginx distributing requests between two app containers.

## Getting started

**Requirements:** Docker, Docker Compose and Git. `curl` is useful for testing. Node.js/npm are only needed for running tests and linting outside Docker.

```bash
git clone https://github.com/davidbb-dev/visit-counter.git
cd visit-counter
cp .env.example .env
docker compose up -d --build
```

Check that the four containers are running (Redis should be healthy), then try the endpoints:

```bash
docker compose ps
curl http://localhost:8080/
curl http://localhost:8080/visits
curl http://localhost:8080/health
```

Stop the project with `docker compose down`. This keeps the Redis data volume; `down -v` would remove it.

### Configuration

The default values in `.env.example` are:

| Variable | Purpose | Default |
| --- | --- | --- |
| `APP_PORT` | Express port inside its containers | `8080` |
| `REDIS_HOST` | Redis service hostname | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `NGINX_PORT` | Nginx port inside its container | `80` |
| `HOST_PORT` | Port on the local machine | `8080` |

Compose reads `.env` and passes these values to the services. Nginx uses `nginx/default.conf.template` to generate its configuration at startup, so changing `APP_PORT` does not require editing the Nginx config manually. After changing ports, recreate the containers with `docker compose up -d --force-recreate`. Use `http://localhost:<HOST_PORT>` to access the app.

## Architecture

```text
        Client (localhost:8080)
                 |
           Nginx :80
          /         \
   Express :8080  Express :8080
          \         /
           Redis :6379
                 |
        Named volume (AOF)
```

The two Express instances share one Redis counter. Only Nginx publishes a host port, bound to `127.0.0.1`. Nginx uses round-robin load balancing.

## API

| Endpoint | Response |
| --- | --- |
| `GET /` | Welcome message and the responding container's hostname |
| `GET /visits` | Increments and returns the shared Redis counter |
| `GET /health` | `200 {"status":"ok"}` if Redis is reachable; otherwise `503 {"status":"error"}` |

To check load balancing, send several requests to `/`. The `host` value should alternate between two container hostnames:

```bash
for i in {1..8}; do curl -s http://localhost:8080/; echo; done
```

## Tests and CI

Run the local checks after installing Node.js dependencies:

```bash
npm ci
npm run lint
npm test
bash scripts/healthcheck.sh http://localhost:8080
```

The Bash script retries the health check up to five times. GitHub Actions runs linting, the automated test and a Docker build on pushes and pull requests to `main`. It also scans the image with Trivy; security findings are reported but do not currently fail CI.

There is also a `Makefile` with `make build`, `make up`, `make test` and `make down` shortcuts.

## Technical decisions

- **Node.js Alpine image:** small, versioned base image; the app runs as a non-root user. Dependencies are copied and installed before `app.js` to use Docker's build cache.
- **Redis + named volume:** Redis `INCR` increments the shared counter atomically. AOF persistence and the `redis_data` volume keep visits across container recreations.
- **Docker Compose:** starts Redis, waits for its health check, then starts the app and Nginx. Two app instances demonstrate scaling.
- **Environment variables:** ports and Redis connection details live in `.env`, with `.env.example` committed as a template.

## Problems I ran into

- **Missing environment variables:** Compose initially warned about missing values. Adding `.env` and `.env.example` fixed the setup.
- **Nginx and SELinux:** on Fedora, Nginx could not read the bind-mounted config. Adding `:ro,Z` to the volume mount resolved it.
- **Nginx template path:** after renaming the config, an old, unsaved Compose path caused a mount error. Saving the correct path and recreating the container fixed it.
- **ESLint dependencies:** `npm audit` reported vulnerabilities in a transitive dependency. Choosing a compatible ESLint version resolved those reported issues.

## What I'd improve with more time

- Add integration tests for Redis and automatic checks for load balancing and failure cases.
- Review and fix the HIGH-severity findings reported by Trivy, then consider making the scan block CI.
- Add image publishing and deployment if the project moves beyond a local demo.

## AI assistance

I used ChatGPT to clarify concepts, review configuration and troubleshoot issues. I tested the app, persistence, load balancing and port changes locally.
