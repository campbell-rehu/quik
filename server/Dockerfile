FROM node:16.17.1-alpine3.15

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm ci

# Bundle app source
COPY ./dist .

EXPOSE 5000
CMD [ "node", "server.js" ]
