#!/bin/bash

echo "🚀 Setting up TinyLink..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Run 'npm run server' to start the backend"
echo "  2. In another terminal, run 'npm run client' to start the frontend"
echo "  3. Open http://localhost:3000 in your browser"
echo ""
