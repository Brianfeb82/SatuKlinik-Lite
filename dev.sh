#!/bin/bash
# SatuKlinik Lite - Dev Server Launcher
# Usage: ./dev.sh

set -e
cd "$(dirname "$0")"

echo "🚀 Starting SatuKlinik Lite dev servers..."
echo ""

# Kill existing processes
pkill -f "tsx.*src/index.ts" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Start API
echo "📡 Starting API server (port 3001)..."
cd apps/api
npm run dev > /tmp/satuklinik-api.log 2>&1 &
API_PID=$!
cd ../..

# Wait for API
sleep 3
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
  echo "✅ API server ready (PID: $API_PID)"
else
  echo "⚠️  API server may need more time to start"
fi

# Start Web
echo "🌐 Starting Web server (port 3000)..."
cd apps/web
npm run dev > /tmp/satuklinik-web.log 2>&1 &
WEB_PID=$!
cd ../..

sleep 5
echo "✅ Web server ready (PID: $WEB_PID)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Frontend:  http://localhost:3000"
echo "🔌 API:       http://localhost:3001"
echo "📊 API logs:  tail -f /tmp/satuklinik-api.log"
echo "📊 Web logs:  tail -f /tmp/satuklinik-web.log"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop (processes will continue in background)"
echo "To stop servers: pkill -f 'tsx.*index.ts'; pkill -f 'next dev'"
