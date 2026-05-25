#!/bin/bash
set -euo pipefail

# =========================================================
# VST Vault Local Launcher
# - Kills any process already using port 5173
# - Checks for .env (Supabase credentials)
# - Installs dependencies if node_modules is missing
# - Builds the Electron main process
# - Starts Vite dev server + Electron app together
# =========================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

LOG_DIR="$DIR/logs"
LOG_FILE="$LOG_DIR/app.log"

cleanup() {
  echo ""
  echo "Shutting down VST Vault..."
  kill 0 2>/dev/null || true
}
trap cleanup EXIT INT TERM

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Missing required command: $1"
    exit 1
  fi
}

echo "Starting VST Vault..."

# ── Sanity checks ──────────────────────────────────────────

if [[ ! -f "$DIR/package.json" ]]; then
  echo "❌ package.json not found. Put launch.command in the VST Vault repo root."
  exit 1
fi

require_cmd npm
require_cmd lsof

if ! grep -q '"name"[[:space:]]*:[[:space:]]*"vst-vault"' "$DIR/package.json"; then
  echo "❌ This doesn't look like the VST Vault project (name mismatch in package.json)."
  exit 1
fi

# ── Environment check ──────────────────────────────────────

if [[ ! -f "$DIR/.env" ]]; then
  echo ""
  echo "⚠️  No .env file found."
  echo "   Create a .env file with your Supabase credentials:"
  echo ""
  echo "   VITE_SUPABASE_URL=https://your-project.supabase.co"
  echo "   VITE_SUPABASE_ANON_KEY=your-anon-key"
  echo ""
fi

# ── Port cleanup ───────────────────────────────────────────

echo "Clearing port 5173..."
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

# ── Dependencies ───────────────────────────────────────────

if [[ ! -d "$DIR/node_modules" ]]; then
  echo "Installing dependencies..."
  npm install
fi

# ── Build main process ─────────────────────────────────────

echo "Building Electron main process..."
mkdir -p "$LOG_DIR"
npm run build:main 2>&1 | tee "$LOG_DIR/build.log"

# ── Launch Vite + Electron ─────────────────────────────────

echo ""
echo "✅ Launching VST Vault (Electron + Vite dev server)..."
echo "   Log: $LOG_FILE"
echo ""

npm run dev 2>&1 | tee "$LOG_FILE"
