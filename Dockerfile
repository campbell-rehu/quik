FROM nginx:stable-alpine
RUN apk update \
 && apk add --no-cache curl jq \
 && rm -rf /var/cache/apk/*

# copy built front-end artifacts
COPY ./build /usr/share/nginx/html
# copy custom nginx.conf to handle react router
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

COPY quik-fe-docker-entrypoint.sh /
ENTRYPOINT ["/quik-fe-docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
