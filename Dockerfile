FROM node:20-slim

WORKDIR /app

# Install system dependencies and python3-venv
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# First, copy only package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Create and activate virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies in virtual environment
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Expose ports for service and metrics
EXPOSE 8001
EXPOSE 9100

# Start the service
CMD ["node", "src/services/MemoryService.js"]