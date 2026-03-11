import subprocess
import time
import socket
import sys
import os

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

backend_path = r'd:\cams\ST\backend\app.py'
print(f"Starting backend from {backend_path}...")

# Start backend in background
process = subprocess.Popen([sys.executable, '-u', backend_path], 
                         stdout=subprocess.PIPE, 
                         stderr=subprocess.STDOUT,
                         text=True,
                         bufsize=1)

start_time = time.time()
timeout = 120 # 2 minutes timeout

print("Waiting for port 5001 to open...")
while time.time() - start_time < timeout:
    # Check if process is still running
    if process.poll() is not None:
        print("Backend process exited unexpectedly!")
        stdout, _ = process.communicate()
        print(stdout)
        break
    
    # Check if port is open
    if is_port_open(5001):
        print("\nBackend is now running on port 5001!")
        break
    
    # Print some output from backend if available
    line = process.stdout.readline()
    if line:
        print(f"Backend: {line.strip()}")
    
    time.sleep(1)
else:
    print("\nTimeout waiting for backend to start.")
    process.terminate()

print("Done.")
