#!/bin/bash
set -euo pipefail

# =========================================================
# VST Vault Local Launcher
# - Kills any process already using port 5173
# - Checks for .env (Supabase credentials)
# - Installs dependencies if node_modules is missing
# - Starts the Vite dev server (:5173)
# - Opens the app in your browser
#
# Notes:
# - Electron-specific features (scan, folder picker, export)
#   require running `npm run dev` to launch the full
#   Electron app instead. This script opens the renderer
#   only — great for UI development and Supabase data work.
# - Requires a .env file with VITE_SUPABASE_URL and
#   VITE_SUPABASE_ANON_KEY before first run.
# =========================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

APP_URL="http://127.0.0.1:5173"
LOG_DIR="$DIR/logs"
LOG_FILE="$LOG_DIR/renderer.log"

cleanup() {
  echo ""
  echo "🧹 Shutting down VST Vault..."
  if [[ -n "${VITE_PID:-}" ]]; then
    kill "$VITE_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Missing required command: $1"
    exit 1
  fi
}

echo "🎛  Starting VST Vault locally..."

# ── Sanity checks ──────────────────────────────────────────

if [[ ! -f "$DIR/package.json" ]]; then
  echo "❌ package.json not found. Put launch.command in the VST Vault repo root."
  exit 1
fi

require_cmd npm
require_cmd curl
require_cmd lsof

if ! grep -q '"name"[[:space:]]*:[[:space:]]*"vst-vault"' "$DIR/package.json"; then
  echo "❌ This doesn't look like the VST Vault project (name mismatch in package.json)."
  exit 1
fi

# ── Environment check ──────────────────────────────────────

if [[ ! -f "$DIR/.env" ]]; then
  echo ""
  echo "⚠️  No .env file found."
  echo "   Copy .env.example → .env and fill in your Supabase credentials:"
  echo ""
  echo "   VITE_SUPABASE_URL=https://your-project.supabase.co"
  echo "   VITE_SUPABASE_ANON_KEY=your-anon-key"
  echo ""
  echo "   The app will load but sign-in will fail without these."
  echo ""
fi

# ── Port cleanup ───────────────────────────────────────────

echo "🧹 Clearing port 5173..."
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

# ── Dependencies ───────────────────────────────────────────

if [[ ! -d "$DIR/node_modules" ]]; then
  echo "📦 node_modules not found — installing dependencies..."
  npm install
fi

# ── Start Vite ─────────────────────────────────────────────

echo "--- Starting VST Vault renderer (Vite :5173) ---"
mkdir -p "$LOG_DIR"
: > "$LOG_FILE"

npm run dev:renderer -- --host 127.0.0.1 --port 5173 > "$LOG_FILE" 2>&1 &
VITE_PID=$!

echo "⏳ Waiting for Vite to be reachable at $APP_URL ..."
for i in {1..60}; do
  if curl -s -I "$APP_URL" >/dev/null 2>&1; then
    break
  fi

  if ! kill -0 "$VITE_PID" 2>/dev/null; then
    echo "❌ Vite exited unexpectedly. Last 50 lines of log:"
    tail -n 50 "$LOG_FILE" || true
    exit 1
  fi

  sleep 1
done

if ! curl -s -I "$APP_URL" >/dev/null 2>&1; then
  echo "❌ VST Vault did not become reachable on port 5173."
  echo "   Last 50 lines of $LOG_FILE:"
  tail -n 50 "$LOG_FILE" || true
  exit 1
fi

echo ""
echo "✅ VST Vault renderer is running:"
echo "   $APP_URL"
echo ""
echo "ℹ️  Browser mode: auth + Supabase data fully functional."
echo "   Scan / folder picker / export require the Electron app:"
echo "   → Run \`npm run dev\` in the project folder instead."
echo ""
echo "ℹ️  Log: $LOG_FILE"
echo ""

open "$APP_URL" >/dev/null 2>&1 || true

echo "🟢 Running. Leave this window open. Press Ctrl+C to stop."
while true; do sleep 1; done
