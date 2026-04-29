#!/usr/bin/env bash
# Installs an TheClaw package candidate in Docker, performs Telegram
# onboarding/doctor recovery, then runs the Telegram QA live harness.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/lib/docker-e2e-image.sh"

IMAGE_NAME="$(docker_e2e_resolve_image "theclaw-npm-telegram-live-e2e" THECLAW_NPM_TELEGRAM_LIVE_E2E_IMAGE)"
DOCKER_TARGET="${THECLAW_NPM_TELEGRAM_DOCKER_TARGET:-build}"
PACKAGE_SPEC="${THECLAW_NPM_TELEGRAM_PACKAGE_SPEC:-theclaw@beta}"
PACKAGE_TGZ="${THECLAW_NPM_TELEGRAM_PACKAGE_TGZ:-${THECLAW_CURRENT_PACKAGE_TGZ:-}}"
PACKAGE_LABEL="${THECLAW_NPM_TELEGRAM_PACKAGE_LABEL:-}"
OUTPUT_DIR="${THECLAW_NPM_TELEGRAM_OUTPUT_DIR:-.artifacts/qa-e2e/npm-telegram-live}"

resolve_credential_source() {
  if [ -n "${THECLAW_NPM_TELEGRAM_CREDENTIAL_SOURCE:-}" ]; then
    printf "%s" "$THECLAW_NPM_TELEGRAM_CREDENTIAL_SOURCE"
    return 0
  fi
  if [ -n "${THECLAW_QA_CREDENTIAL_SOURCE:-}" ]; then
    printf "%s" "$THECLAW_QA_CREDENTIAL_SOURCE"
    return 0
  fi
  if [ -n "${CI:-}" ] && [ -n "${THECLAW_QA_CONVEX_SITE_URL:-}" ]; then
    if [ -n "${THECLAW_QA_CONVEX_SECRET_CI:-}" ] || [ -n "${THECLAW_QA_CONVEX_SECRET_MAINTAINER:-}" ]; then
      printf "convex"
    fi
  fi
}

resolve_credential_role() {
  if [ -n "${THECLAW_NPM_TELEGRAM_CREDENTIAL_ROLE:-}" ]; then
    printf "%s" "$THECLAW_NPM_TELEGRAM_CREDENTIAL_ROLE"
    return 0
  fi
  if [ -n "${THECLAW_QA_CREDENTIAL_ROLE:-}" ]; then
    printf "%s" "$THECLAW_QA_CREDENTIAL_ROLE"
  fi
}

validate_theclaw_package_spec() {
  local spec="$1"
  if [[ "$spec" =~ ^theclaw@(beta|latest|[0-9]{4}\.[1-9][0-9]*\.[1-9][0-9]*(-[1-9][0-9]*|-beta\.[1-9][0-9]*)?)$ ]]; then
    return 0
  fi
  echo "THECLAW_NPM_TELEGRAM_PACKAGE_SPEC must be theclaw@beta, theclaw@latest, or an exact TheClaw release version; got: $spec" >&2
  exit 1
}

resolve_package_tgz() {
  local candidate="$1"
  if [ -z "$candidate" ]; then
    return 0
  fi
  if [ ! -f "$candidate" ]; then
    echo "THECLAW_NPM_TELEGRAM_PACKAGE_TGZ must point to an existing .tgz file; got: $candidate" >&2
    exit 1
  fi
  case "$candidate" in
    *.tgz) ;;
    *)
      echo "THECLAW_NPM_TELEGRAM_PACKAGE_TGZ must point to a .tgz file; got: $candidate" >&2
      exit 1
      ;;
  esac
  local dir
  local base
  dir="$(cd "$(dirname "$candidate")" && pwd)"
  base="$(basename "$candidate")"
  printf "%s/%s" "$dir" "$base"
}

package_mount_args=()
package_install_source="$PACKAGE_SPEC"
resolved_package_tgz="$(resolve_package_tgz "$PACKAGE_TGZ")"
if [ -n "$resolved_package_tgz" ]; then
  package_install_source="/package-under-test/$(basename "$resolved_package_tgz")"
  package_mount_args=(-v "$resolved_package_tgz:$package_install_source:ro")
else
  validate_theclaw_package_spec "$PACKAGE_SPEC"
fi
if [ -z "$PACKAGE_LABEL" ]; then
  if [ -n "$resolved_package_tgz" ]; then
    PACKAGE_LABEL="$(basename "$resolved_package_tgz")"
  else
    PACKAGE_LABEL="$PACKAGE_SPEC"
  fi
fi

docker_e2e_build_or_reuse "$IMAGE_NAME" npm-telegram-live "$ROOT_DIR/scripts/e2e/Dockerfile" "$ROOT_DIR" "$DOCKER_TARGET"
docker_e2e_harness_mount_args

mkdir -p "$ROOT_DIR/.artifacts/qa-e2e"
run_log="$(mktemp "${TMPDIR:-/tmp}/theclaw-npm-telegram-live.XXXXXX")"
npm_prefix_host="$(mktemp -d "$ROOT_DIR/.artifacts/qa-e2e/npm-telegram-live-prefix.XXXXXX")"
trap 'rm -f "$run_log"; rm -rf "$npm_prefix_host"' EXIT
credential_source="$(resolve_credential_source)"
credential_role="$(resolve_credential_role)"
if [ -z "$credential_role" ] && [ -n "${CI:-}" ] && [ "$credential_source" = "convex" ]; then
  credential_role="ci"
fi

docker_env=(
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0
  -e THECLAW_NPM_TELEGRAM_PACKAGE_SPEC="$PACKAGE_SPEC"
  -e THECLAW_NPM_TELEGRAM_PACKAGE_LABEL="$PACKAGE_LABEL"
  -e THECLAW_NPM_TELEGRAM_OUTPUT_DIR="$OUTPUT_DIR"
  -e THECLAW_NPM_TELEGRAM_FAST="${THECLAW_NPM_TELEGRAM_FAST:-1}"
)

forward_env_if_set() {
  local key="$1"
  if [ -n "${!key:-}" ]; then
    docker_env+=(-e "$key")
  fi
}

if [ -n "$credential_source" ]; then
  docker_env+=(-e THECLAW_QA_CREDENTIAL_SOURCE="$credential_source")
fi
if [ -n "$credential_role" ]; then
  docker_env+=(-e THECLAW_QA_CREDENTIAL_ROLE="$credential_role")
fi

for key in \
  OPENAI_API_KEY \
  ANTHROPIC_API_KEY \
  GEMINI_API_KEY \
  GOOGLE_API_KEY \
  THECLAW_LIVE_OPENAI_KEY \
  THECLAW_LIVE_ANTHROPIC_KEY \
  THECLAW_LIVE_GEMINI_KEY \
  THECLAW_QA_TELEGRAM_GROUP_ID \
  THECLAW_QA_TELEGRAM_DRIVER_BOT_TOKEN \
  THECLAW_QA_TELEGRAM_SUT_BOT_TOKEN \
  THECLAW_QA_CONVEX_SITE_URL \
  THECLAW_QA_CONVEX_SECRET_CI \
  THECLAW_QA_CONVEX_SECRET_MAINTAINER \
  THECLAW_QA_CREDENTIAL_LEASE_TTL_MS \
  THECLAW_QA_CREDENTIAL_HEARTBEAT_INTERVAL_MS \
  THECLAW_QA_CREDENTIAL_ACQUIRE_TIMEOUT_MS \
  THECLAW_QA_CREDENTIAL_HTTP_TIMEOUT_MS \
  THECLAW_QA_CONVEX_ENDPOINT_PREFIX \
  THECLAW_QA_CREDENTIAL_OWNER_ID \
  THECLAW_QA_ALLOW_INSECURE_HTTP \
  THECLAW_QA_REDACT_PUBLIC_METADATA \
  THECLAW_QA_TELEGRAM_CAPTURE_CONTENT \
  THECLAW_QA_SUITE_PROGRESS \
  THECLAW_NPM_TELEGRAM_PROVIDER_MODE \
  THECLAW_NPM_TELEGRAM_MODEL \
  THECLAW_NPM_TELEGRAM_ALT_MODEL \
  THECLAW_NPM_TELEGRAM_SCENARIOS \
  THECLAW_NPM_TELEGRAM_SUT_ACCOUNT \
  THECLAW_NPM_TELEGRAM_ALLOW_FAILURES; do
  forward_env_if_set "$key"
done

run_logged() {
  if ! "$@" >"$run_log" 2>&1; then
    cat "$run_log"
    exit 1
  fi
  cat "$run_log"
  >"$run_log"
}

echo "Running package Telegram live Docker E2E ($PACKAGE_LABEL)..."
run_logged docker run --rm \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e THECLAW_NPM_TELEGRAM_INSTALL_SOURCE="$package_install_source" \
  -e THECLAW_NPM_TELEGRAM_PACKAGE_LABEL="$PACKAGE_LABEL" \
  "${package_mount_args[@]}" \
  -v "$npm_prefix_host:/npm-global" \
  -i "$IMAGE_NAME" bash -s <<'EOF'
set -euo pipefail

export HOME="$(mktemp -d "/tmp/theclaw-npm-telegram-install.XXXXXX")"
export NPM_CONFIG_PREFIX="/npm-global"
export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"

install_source="${THECLAW_NPM_TELEGRAM_INSTALL_SOURCE:?missing THECLAW_NPM_TELEGRAM_INSTALL_SOURCE}"
package_label="${THECLAW_NPM_TELEGRAM_PACKAGE_LABEL:-$install_source}"
echo "Installing ${package_label} from ${install_source}..."
npm install -g "$install_source" --no-fund --no-audit

command -v theclaw
theclaw --version
EOF

# Mount only test harness/plugin QA sources; the SUT itself is the installed package candidate.
run_logged docker run --rm \
  "${docker_env[@]}" \
  -v "$ROOT_DIR/.artifacts:/app/.artifacts" \
  "${DOCKER_E2E_HARNESS_ARGS[@]}" \
  -v "$ROOT_DIR/extensions:/app/extensions:ro" \
  -v "$npm_prefix_host:/npm-global" \
  -i "$IMAGE_NAME" bash -s <<'EOF'
set -euo pipefail

export HOME="$(mktemp -d "/tmp/theclaw-npm-telegram-runtime.XXXXXX")"
export NPM_CONFIG_PREFIX="/npm-global"
export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"
export THECLAW_NPM_TELEGRAM_REPO_ROOT="/app"

dump_hotpath_logs() {
  local status="$1"
  echo "installed-package onboarding recovery hot path failed with exit code $status" >&2
  for file in \
    /tmp/theclaw-npm-telegram-onboard.json \
    /tmp/theclaw-npm-telegram-channel-add.log \
    /tmp/theclaw-npm-telegram-doctor-fix.log \
    /tmp/theclaw-npm-telegram-doctor-check.log; do
    if [ -f "$file" ]; then
      echo "--- $file ---" >&2
      sed -n '1,220p' "$file" >&2 || true
    fi
  done
}
trap 'status=$?; dump_hotpath_logs "$status"; exit "$status"' ERR

command -v theclaw
theclaw --version
mkdir -p /app/node_modules
theclaw_package_dir="/npm-global/lib/node_modules/theclaw"
# The mounted QA harness imports theclaw/plugin-sdk and package dependencies;
# point those imports at the installed package without copying source into the test image.
rm -rf /app/node_modules/theclaw
ln -sfnT "$theclaw_package_dir" /app/node_modules/theclaw
rm -rf /app/dist
ln -sfnT "$theclaw_package_dir/dist" /app/dist
cp "$theclaw_package_dir/package.json" /app/package.json
rm -rf "$theclaw_package_dir/extensions"
ln -sfnT /app/extensions "$theclaw_package_dir/extensions"
mkdir -p /app/node_modules/@theclaw
rm -rf /app/node_modules/@theclaw/qa-channel
ln -sfnT /app/extensions/qa-channel /app/node_modules/@theclaw/qa-channel
node --input-type=module <<'NODE'
import fs from "node:fs";

for (const packageJsonPath of [
  "/app/package.json",
  "/app/node_modules/theclaw/package.json",
]) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  pkg.exports = pkg.exports && typeof pkg.exports === "object" ? pkg.exports : {};
  if (!pkg.exports["./plugin-sdk/gateway-runtime"]) {
    pkg.exports["./plugin-sdk/gateway-runtime"] = {
      types: "./dist/plugin-sdk/gateway-runtime.d.ts",
      default: "./dist/plugin-sdk/gateway-runtime.js",
    };
  }
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);
}
NODE
for deps_dir in "$theclaw_package_dir/node_modules" /npm-global/lib/node_modules; do
  [ -d "$deps_dir" ] || continue
  for dependency_dir in "$deps_dir"/*; do
    [ -e "$dependency_dir" ] || continue
    dependency_name="$(basename "$dependency_dir")"
    case "$dependency_name" in
      .bin | theclaw)
        continue
        ;;
      @*)
        [ -d "$dependency_dir" ] || continue
        mkdir -p "/app/node_modules/$dependency_name"
        for scoped_dependency_dir in "$dependency_dir"/*; do
          [ -e "$scoped_dependency_dir" ] || continue
          scoped_dependency_name="$(basename "$scoped_dependency_dir")"
          rm -rf "/app/node_modules/$dependency_name/$scoped_dependency_name"
          ln -sfnT "$scoped_dependency_dir" "/app/node_modules/$dependency_name/$scoped_dependency_name"
        done
        ;;
      *)
        rm -rf "/app/node_modules/$dependency_name"
        ln -sfnT "$dependency_dir" "/app/node_modules/$dependency_name"
        ;;
    esac
  done
done

link_installed_package_dependency() {
  local name="$1"
  local source="/npm-global/lib/node_modules/theclaw/node_modules/$name"
  local target="/app/node_modules/$name"
  if [ ! -e "$source" ]; then
    echo "Installed package dependency is missing: $name" >&2
    return 1
  fi
  mkdir -p "$(dirname "$target")"
  ln -sfn "$source" "$target"
}

# QA Lab is intentionally mounted as harness source, so its package-local
# runtime imports must resolve from the installed package dependency tree.
for dependency in \
  @modelcontextprotocol/sdk \
  yaml \
  zod; do
  link_installed_package_dependency "$dependency"
done

echo "Running installed-package onboarding recovery hot path..."
OPENAI_API_KEY="${OPENAI_API_KEY:-sk-theclaw-npm-telegram-hotpath}" theclaw onboard --non-interactive --accept-risk \
  --mode local \
  --auth-choice openai-api-key \
  --secret-input-mode ref \
  --gateway-port 18789 \
  --gateway-bind loopback \
  --skip-daemon \
  --skip-ui \
  --skip-skills \
  --skip-health \
  --json >/tmp/theclaw-npm-telegram-onboard.json </dev/null

theclaw channels add --channel telegram --token "123456:theclaw-npm-telegram-hotpath" >/tmp/theclaw-npm-telegram-channel-add.log 2>&1 </dev/null
theclaw doctor --fix --non-interactive >/tmp/theclaw-npm-telegram-doctor-fix.log 2>&1 </dev/null
theclaw doctor --non-interactive >/tmp/theclaw-npm-telegram-doctor-check.log 2>&1 </dev/null
if grep -F -q "Bundled plugin runtime deps are missing." /tmp/theclaw-npm-telegram-doctor-check.log; then
  exit 1
fi
if grep -F -q "Failed to install bundled plugin runtime deps" /tmp/theclaw-npm-telegram-doctor-fix.log; then
  exit 1
fi

export THECLAW_NPM_TELEGRAM_SUT_COMMAND="$(command -v theclaw)"
trap - ERR
tsx scripts/e2e/npm-telegram-live-runner.ts
EOF

echo "package Telegram live Docker E2E passed ($PACKAGE_LABEL)"
