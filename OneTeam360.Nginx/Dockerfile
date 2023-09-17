FROM nginx
COPY default.conf /etc/nginx/conf.d
# RUN mkdir crt
COPY ${TOKEN_CERT_KEY_NAME_BE}.crt /etc/ssl
COPY ${TOKEN_CERT_KEY_NAME_BE}.key /etc/ssl
