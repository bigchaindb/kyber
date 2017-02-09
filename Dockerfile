#FROM openresty/openresty:xenial
FROM nginx:alpine
MAINTAINER krish@bigchaindb.com
WORKDIR /

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
ENTRYPOINT ["nginx"]
