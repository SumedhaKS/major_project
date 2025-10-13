# Use Python slim for ARM64
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for OpenCV and ultralytics
RUN apt-get update && apt-get install -y \
    libgl1 libglib2.0-0 libjpeg-dev zlib1g && \
    rm -rf /var/lib/apt/lists/*

# Install pip dependencies
COPY pyproject.toml uv.lock ./

# Install dependencies using uv (no cache to save space)
RUN pip install --no-cache-dir uv && \
    uv pip install --system .

# Copy project files
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Environment variable for model name
ENV MODEL_NAME=best.pt

# Command to run FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
