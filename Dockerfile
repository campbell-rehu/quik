FROM nginx:stable-alpine
RUN apk update && apk add --no-cache bash jq

RUN npm ci
RUN SERVER=$QUIK_SERVER_URL BUILD_PATH=./fe-build npm run build
# copy built front-end artifacts
COPY ./fe-build /usr/share/nginx/html
# copy custom nginx.conf to handle react router
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

COPY quik-fe-docker-entrypoint.sh /
ENTRYPOINT ["/quik-fe-docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
