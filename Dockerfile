FROM nginx:alpine

# Copy all static assets into nginx's web root
COPY . /usr/share/nginx/html

# Patch nginx to listen on Cloud Run's required port 8080 at build time
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf \
 && sed -i 's/listen  \[::\]:80;/listen  [::]:8080;/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
