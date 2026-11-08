#!/usr/bin/env bash

if [ -z "$1" ]; then
    echo "Usage: $0 <base-url>"
    exit 1
fi

url="${1%/}/health"

for attempt in {1..5}; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Attempt $attempt/5"

    if curl --silent --fail --output /dev/null "$url"; then
        echo "Healthcheck Successful"
        exit 0
    fi

    if [ "$attempt" -lt 5 ]; then
        sleep 3
    fi
done

echo "Healthcheck failed"
exit 1