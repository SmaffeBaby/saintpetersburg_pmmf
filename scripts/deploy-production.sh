#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/saint-mmf}"
COMPOSE_SERVICES="${COMPOSE_SERVICES:-saint-mmf}"

cd "$APP_DIR"

for required_file in docker-compose.yml Dockerfile package-lock.json package.json nuxt.config.ts; do
  if [[ ! -f "$required_file" ]]; then
    echo "Missing production file: $APP_DIR/$required_file" >&2
    exit 1
  fi
done

command -v docker >/dev/null 2>&1 || {
  echo "Docker is not installed on this server." >&2
  exit 1
}

docker compose version >/dev/null 2>&1 || {
  echo "Docker Compose v2 is not available on this server." >&2
  exit 1
}

compose() {
  env -i PATH="$PATH" HOME="${HOME:-/root}" docker compose "$@"
}

read -r -a services <<< "$COMPOSE_SERVICES"

compose up -d --build "${services[@]}"
compose ps "${services[@]}"
