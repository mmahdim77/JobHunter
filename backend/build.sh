#!/bin/bash

# Exit on error
set -e

# Print commands as they are executed
set -x

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Create and activate virtual environment
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

# Build the application
echo "Building the application..."
npm run build

echo "Build completed successfully!" 