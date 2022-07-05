FROM node:16-alpine

RUN mkdir -p /home/app

WORKDIR /home/app

COPY ./dist/crm-build-comfort-ui /home/app

RUN npm install http-server -g

CMD ["http-server", "/home/app"]