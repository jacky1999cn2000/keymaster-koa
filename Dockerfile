FROM node:5
MAINTAINER <Michael Bosworth> michael.bosworth@bunchball.com

ENV PORT 3000
EXPOSE 3000

COPY . /usr/src/app

WORKDIR /usr/src/app

ENTRYPOINT /usr/src/app/node_modules/.bin/forever app.js --prod
