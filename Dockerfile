FROM node:22.14.0

# Install system deps for building native modules and ffmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    make \
    g++ \
 && rm -rf /var/lib/apt/lists/*

# Create app dir
WORKDIR /app

# Copy files
COPY . .

# Install node deps
RUN npm install

# Run the bot
CMD ["node", "index.js"]
