# ---------- Stage 1: Build the React app ----------

FROM node:20-alpine AS build 

# Set working directory inside container
WORKDIR /app 

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./ 

# Install dependencies
RUN npm install 

# Copy rest of the code
COPY . . 

# Build the app for production
RUN npm run build 

# -- Stage 2: Serve using Nginx ----------
FROM nginx:alpine 

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/* 

# Copy React build files from Stage 1
COPY --from=build /app/build /usr/share/nginx/html
 

# Copy custom nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf 

# Expose port 80
EXPOSE 80 

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]