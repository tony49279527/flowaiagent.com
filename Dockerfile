# Use official Python runtime as a parent image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install dependencies (single source of truth with requirements.txt)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run start.sh when the container launches to start both servers
CMD ["./start.sh"]
