#!/bin/sh

FLAG_FILE="/tmp/healthy"
PORT=${SERVER_PORT:-3000}

# If the flag file exists, return success
if [ -f "$FLAG_FILE" ]; then
    exit 0
fi

if node -e "fetch('http://localhost:${PORT}/healthcheck').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"; then
    touch "$FLAG_FILE"  # Create the flag file on first success
    exit 0
else
    exit 1
fi
