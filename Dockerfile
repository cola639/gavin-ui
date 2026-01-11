# Use Nginx 1.22 as the base image (Docker will pull it automatically if not present)
FROM nginx:1.22

# Build args (can be provided in Jenkinsfile when building the image)
# ARG PROFILE

# Copy the built frontend files (dist/) into Nginx's default web root
COPY dist/ /usr/share/nginx/html/

# Replace the default Nginx configuration with our custom config
COPY docker.conf /etc/nginx/nginx.conf

# Expose container ports (documentation only; does not actually publish ports)
EXPOSE 80 443

# Run Nginx in the foreground so the container keeps running
CMD ["nginx", "-g", "daemon off;"]
