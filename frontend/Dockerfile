# for local development builds
FROM node:13.12.0-alpine

WORKDIR /app

# install and cache app dependencies
COPY package.json package-lock.json ./
RUN npm install --silent

# need to rebuild node-sass due to sass bug that sometimes fails to compile
RUN npm rebuild node-sass

COPY . .

CMD ["npm", "start"]
