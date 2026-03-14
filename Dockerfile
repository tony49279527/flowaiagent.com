# Use official Python runtime as a parent image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install dependencies directly
RUN pip install flask flask-cors requests python-docx google-cloud-firestore

# Copy the current directory contents into the container at /app
COPY . /app

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run start.sh when the container launches to start both servers
CMD ["./start.sh"]
