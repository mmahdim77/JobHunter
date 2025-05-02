#!/bin/bash
set -e

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

# Build the application
echo "Building application..."
npm run build

echo "Build completed successfully!" 