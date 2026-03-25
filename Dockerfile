# Use official Python runtime as a parent image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install dependencies (single source of truth with requirements.txt)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
      -i https://mirrors.aliyun.com/pypi/simple/ \
      --trusted-host mirrors.aliyun.com \
      -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app

# Cloud Run injects PORT (default 8080)
EXPOSE 8080

# 与 .github/workflows/deploy.yml 一致：单进程 payment_server（含 Discovery）
CMD ["python3", "payment_server.py"]
