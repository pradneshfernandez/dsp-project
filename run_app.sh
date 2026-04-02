#!/bin/bash

# Kill background processes on exit
cleanup() {
    echo "Shutting down nodes..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "TARA x 01 | DEEP CYBER"

# Port Clearing
fuser -k 8000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null
sleep 1

# Start Backend
echo "Node Alpha: API (8000)"
source tara_env/bin/activate
python -m uvicorn src.server:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo "Node Beta: UI (5173)"
cd frontend
npm run dev -- --host &
FRONTEND_PID=$!

echo "System Ready."
echo "URL: http://localhost:5173"

wait
