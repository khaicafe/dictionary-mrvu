#!/bin/bash

# Check if sshpass is installed, if not install it
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass not found. Installing..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install sshpass
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y sshpass
        elif command -v yum &> /dev/null; then
            sudo yum install -y sshpass
        fi
    fi
    
    if command -v sshpass &> /dev/null; then
        echo "✅ sshpass installed successfully"
    else
        echo "❌ Failed to install sshpass"
        exit 1
    fi
else
    echo "✅ sshpass is already installed"
fi
