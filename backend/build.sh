#!/bin/bash

# Exit on error
set -e

# Print commands as they are executed
set -x

# Create and activate virtual environment
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

echo "Build completed successfully!" 