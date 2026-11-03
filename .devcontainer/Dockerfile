FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

USER node
