#!/bin/bash

# Start the payment/main server in the background
# Make sure it listens on the PORT env var provided by Cloud Run
python3 payment_server.py &

# Start the discovery server in the background
# It internally defaults to port 8081 if DISCOVERY_PORT isn't set
python3 discovery_server.py &

# Wait for any process to exit
wait -n
  
# Exit with status of process that exited first
exit $?
