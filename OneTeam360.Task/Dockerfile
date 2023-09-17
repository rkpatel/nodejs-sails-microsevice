FROM node:15.14-alpine

RUN npm install pm2 -g

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${TOKEN_TASK_PORT}

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
