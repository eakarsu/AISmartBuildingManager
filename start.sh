#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"; cd "$ROOT"
if [ ! -f .env ]; then echo "Missing .env; configure it before starting." >&2; exit 1; fi
set -a; . ./.env; set +a
BACKEND_PORT="${BACKEND_PORT:-3001}"; FRONTEND_PORT="${FRONTEND_PORT:-3000}"
if [ ! -d backend/node_modules ] || [ ! -d frontend/node_modules ]; then echo "Dependencies missing; run scripts/bootstrap.sh explicitly." >&2; exit 1; fi
if [[ "${ALLOW_SCHEMA_MIGRATION:-}" != "true" ]]; then echo "ALLOW_SCHEMA_MIGRATION=true is required." >&2; exit 1; fi
for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do if command -v lsof >/dev/null && lsof -ti ":$port" >/dev/null 2>&1; then echo "Port $port is already in use." >&2; exit 1; fi; done
(cd backend && node scripts/prepareRuntime.js)
(cd backend && node server.js) & BACKEND_PID=$!
(cd frontend && npm run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT" --strictPort) & FRONTEND_PID=$!
cleanup() { kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true; wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true; }; trap cleanup EXIT INT TERM
wait "$BACKEND_PID"
