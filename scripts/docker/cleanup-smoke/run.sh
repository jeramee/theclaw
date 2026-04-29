#!/usr/bin/env bash
set -euo pipefail

cd /repo

export THECLAW_STATE_DIR="/tmp/theclaw-test"
export THECLAW_CONFIG_PATH="${THECLAW_STATE_DIR}/theclaw.json"

echo "==> Build"
if ! pnpm build >/tmp/theclaw-cleanup-build.log 2>&1; then
  cat /tmp/theclaw-cleanup-build.log
  exit 1
fi

echo "==> Seed state"
mkdir -p "${THECLAW_STATE_DIR}/credentials"
mkdir -p "${THECLAW_STATE_DIR}/agents/main/sessions"
echo '{}' >"${THECLAW_CONFIG_PATH}"
echo 'creds' >"${THECLAW_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${THECLAW_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
if ! pnpm theclaw reset --scope config+creds+sessions --yes --non-interactive >/tmp/theclaw-cleanup-reset.log 2>&1; then
  cat /tmp/theclaw-cleanup-reset.log
  exit 1
fi

test ! -f "${THECLAW_CONFIG_PATH}"
test ! -d "${THECLAW_STATE_DIR}/credentials"
test ! -d "${THECLAW_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${THECLAW_STATE_DIR}/credentials"
echo '{}' >"${THECLAW_CONFIG_PATH}"

echo "==> Uninstall (state only)"
if ! pnpm theclaw uninstall --state --yes --non-interactive >/tmp/theclaw-cleanup-uninstall.log 2>&1; then
  cat /tmp/theclaw-cleanup-uninstall.log
  exit 1
fi

test ! -d "${THECLAW_STATE_DIR}"

echo "OK"
