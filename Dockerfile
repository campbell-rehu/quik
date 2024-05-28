# Set the base image to node:12-alpine
FROM node:12-alpine as build

# Specify where our app will live in the container
WORKDIR /app

# Copy the React App to the container
COPY . /app/

ARG SERVER

# Prepare the container for building React
RUN npm install
# We want the production version
RUN SERVER=${SERVER} npm run build

FROM nginx:stable-alpine
RUN apk update && apk add --no-cache bash jq

# copy built front-end artifacts
COPY --from=build /app/build  /usr/share/nginx/html

# copy custom nginx.conf to handle react router
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

COPY quik-fe-docker-entrypoint.sh /
ENTRYPOINT ["/quik-fe-docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
