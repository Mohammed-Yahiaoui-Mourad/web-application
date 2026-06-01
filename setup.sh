#!/bin/bash
# Quick Setup Script for BloodBridge + Supabase

echo "🚀 BloodBridge Supabase Setup"
echo "=============================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ Missing .env.local"
  echo "Please create .env.local with your Supabase credentials:"
  echo ""
  echo "  VITE_SUPABASE_URL=https://your-project-id.supabase.co"
  echo "  VITE_SUPABASE_ANON_KEY=your-anon-key"
  echo "  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
  echo ""
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Open two terminals"
echo "  2. Terminal 1: npm run dev"
echo "  3. Terminal 2: cd client && npm run dev"
echo ""
echo "🌐 App will be at: http://localhost:5173"
echo "📡 Backend at: http://localhost:4000"
