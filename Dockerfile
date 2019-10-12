FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 4000
CMD ["npm", "run", "serve"]