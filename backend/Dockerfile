FROM node:20-alpine

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Start the server
CMD ["npm", "start"]
