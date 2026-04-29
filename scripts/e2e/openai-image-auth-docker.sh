#!/usr/bin/env bash
# Runs a mocked OpenAI image-generation auth smoke inside Docker against the
# package-installed functional E2E image.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/lib/docker-e2e-image.sh"

IMAGE_NAME="$(docker_e2e_resolve_image "theclaw-openai-image-auth-e2e" THECLAW_OPENAI_IMAGE_AUTH_E2E_IMAGE)"
SKIP_BUILD="${THECLAW_OPENAI_IMAGE_AUTH_E2E_SKIP_BUILD:-0}"

docker_e2e_build_or_reuse "$IMAGE_NAME" openai-image-auth "$ROOT_DIR/scripts/e2e/Dockerfile" "$ROOT_DIR" "" "$SKIP_BUILD"
docker_e2e_harness_mount_args
THECLAW_TEST_STATE_SCRIPT_B64="$(docker_e2e_test_state_shell_b64 openai-image-auth empty)"

echo "Running OpenAI image auth Docker E2E..."
# Harness files are mounted read-only; the app under test comes from /app/dist.
run_logged openai-image-auth docker run --rm \
  -e "OPENAI_API_KEY=sk-theclaw-image-auth-e2e" \
  -e "THECLAW_QA_ALLOW_LOCAL_IMAGE_PROVIDER=1" \
  -e "THECLAW_TEST_STATE_SCRIPT_B64=$THECLAW_TEST_STATE_SCRIPT_B64" \
  "${DOCKER_E2E_HARNESS_ARGS[@]}" \
  -i "$IMAGE_NAME" bash -lc '
set -euo pipefail
eval "$(printf "%s" "${THECLAW_TEST_STATE_SCRIPT_B64:?missing THECLAW_TEST_STATE_SCRIPT_B64}" | base64 -d)"
export THECLAW_SKIP_CHANNELS=1
export THECLAW_SKIP_GMAIL_WATCHER=1
export THECLAW_SKIP_CRON=1
export THECLAW_SKIP_CANVAS_HOST=1

tsx scripts/e2e/openai-image-auth-docker-client.ts
'
