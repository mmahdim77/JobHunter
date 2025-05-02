#!/bin/bash

# Exit on error
set -e

# Print commands as they are executed
set -x

# Install Python first
echo "Installing Python..."
apt-get update && apt-get install -y python3 python3-pip python3-venv

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