# Use official lightweight Nginx image
FROM nginx:alpine

# Copy the static HTML, CSS, and JS files to Nginx's default serving directory
COPY . /usr/share/nginx/html

# Expose the default HTTP port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
