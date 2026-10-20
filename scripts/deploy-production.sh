#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/saint-mmf}"
COMPOSE_SERVICES="${COMPOSE_SERVICES:-saint-mmf}"

cd "$APP_DIR"

for required_file in docker-compose.yml docker-compose.production.yml release.env image.tar.gz; do
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

# Read only the image tag; never execute the release file as shell code.
IMAGE_TAG=$(sed -n 's/^IMAGE_TAG=//p' release.env)
if [[ ! "$IMAGE_TAG" =~ ^[a-f0-9]{40}$ ]]; then
  echo "Invalid release image tag." >&2
  exit 1
fi

compose() {
  env -i PATH="$PATH" HOME="${HOME:-/root}" IMAGE_TAG="$IMAGE_TAG" \
    docker compose -f docker-compose.yml -f docker-compose.production.yml "$@"
}

read -r -a services <<< "$COMPOSE_SERVICES"

compose config --quiet
docker load --input image.tar.gz
docker image inspect "saint-mmf-production:$IMAGE_TAG" >/dev/null

if ! compose up -d --no-build --wait --wait-timeout 180 "${services[@]}"; then
  compose ps "${services[@]}"
  compose logs --tail 100 "${services[@]}"
  exit 1
fi
compose ps "${services[@]}"
