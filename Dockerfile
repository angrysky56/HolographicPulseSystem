FROM node:20-slim

WORKDIR /app

# First, copy only package files and install dependencies
COPY package*.json ./
RUN npm install

# Then copy the rest of the application
COPY . .

# Display directory contents for debugging
RUN ls -la
RUN ls -la src/

EXPOSE 5000

CMD ["npm", "start"]