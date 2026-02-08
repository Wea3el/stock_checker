"""Start both backend and frontend with a single command: python start.py"""

import subprocess
import sys
import os
import signal

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT, "backend")
FRONTEND_DIR = os.path.join(ROOT, "frontend")

procs: list[subprocess.Popen] = []


def cleanup(*_):
    for p in procs:
        p.terminate()
    sys.exit(0)


signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

print("Starting backend (http://localhost:8000) ...")
procs.append(subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"],
    cwd=BACKEND_DIR,
))

print("Starting frontend (http://localhost:5173) ...")
procs.append(subprocess.Popen(
    ["npm", "run", "dev"],
    cwd=FRONTEND_DIR,
    shell=True,
))

print("\nBoth servers running. Press Ctrl+C to stop.\n")

try:
    for p in procs:
        p.wait()
except KeyboardInterrupt:
    cleanup()
