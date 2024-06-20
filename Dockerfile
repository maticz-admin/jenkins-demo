# Use the official Node.js runtime as the base image
FROM node:21

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code to the container
COPY . .

# Build the React app for production
#RUN npm run build

# Expose port 80 for the React app
EXPOSE 8000

# Run the React app when the container starts
CMD ["npm","run", "demo"]
