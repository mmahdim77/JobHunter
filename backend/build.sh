#!/bin/bash

# Install Node.js dependencies
npm install

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Build the application
npm run build 