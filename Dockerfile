FROM nginx:alpine

# Copy all static assets into nginx's web root
COPY . /usr/share/nginx/html

# Patch nginx to listen on Cloud Run's required port 8080 at build time
# and add security headers for HSTS, Frame Options, and Content Type
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf \
 && sed -i 's/listen  \[::\]:80;/listen  [::]:8080;/g' /etc/nginx/conf.d/default.conf \
 && sed -i '/location \/ {/a \    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\n    add_header X-Frame-Options "SAMEORIGIN" always;\n    add_header X-Content-Type-Options "nosniff" always;\n    add_header Referrer-Policy "strict-origin-when-cross-origin" always;' /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]