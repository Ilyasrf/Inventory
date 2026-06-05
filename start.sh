#!/bin/bash
set -e

echo ""
echo "  ⚙️  MAKINA MASTERS — Inventory System"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check .env
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Copying from .env.example..."
  cp .env.example .env
  echo "📝 Please edit .env with your 42 API credentials and SMTP config."
  echo "   Then run this script again."
  exit 1
fi

echo "🔨 Building containers..."
docker compose build

echo ""
echo "🚀 Starting services..."
docker compose up -d

echo ""
echo "  ✅ Makina Masters is running!"
echo ""
echo "  🌐 Frontend:  http://localhost:8080"
echo "  🔧 Backend:   http://localhost:3001"
echo "  📊 Health:    http://localhost:3001/health"
echo ""
echo "  📝 Logs:      docker compose logs -f"
echo "  🛑 Stop:      docker compose down"
echo ""
