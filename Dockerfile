FROM node:lts

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8000
CMD ["npm", "run", "serve"]