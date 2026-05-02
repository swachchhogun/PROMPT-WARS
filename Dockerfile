FROM nginx:alpine

# Copy all static assets into nginx's web root
COPY . /usr/share/nginx/html

# Patch nginx to:
#  1. Listen on Cloud Run's required port 8080
#  2. Enable gzip compression for text assets
#  3. Set long-lived cache headers for versioned static files
RUN sed -i 's/listen       80;/listen       8080;/g'       /etc/nginx/conf.d/default.conf \
 && sed -i 's/listen  \[::\]:80;/listen  [::]:8080;/g'    /etc/nginx/conf.d/default.conf \
 && sed -i '/server {/a \    gzip on;\n    gzip_types text/plain text/css application/javascript application/json image/svg+xml;\n    gzip_min_length 1024;\n    gzip_vary on;\n\n    # Long-lived cache for cache-busted versioned assets\n    location ~* \\.(js|css|woff2?)$ {\n        expires 1y;\n        add_header Cache-Control "public, immutable";\n    }' /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]