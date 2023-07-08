# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json files into the container
COPY express/ .

# Install the application dependencies inside the container
RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Inform Docker that the container is listening on the specified port at runtime.
EXPOSE 8080
EXPOSE 8081

# Define the command to run your app using CMD which defines your runtime
# Here we use the "npm start" command to start our application
CMD [ "node", "app.js" ]
