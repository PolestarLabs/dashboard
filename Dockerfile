# Dashboard application container
FROM node:24-alpine

WORKDIR /app

# copy package files first
COPY package.json package-lock.json* ./

# install git so that github:/* dependencies can be fetched
RUN apk add --no-cache git

# install dependencies
RUN npm install

# copy the rest of the application
COPY . .

# bind to all interfaces so Docker networking works
ENV NODE_ENV=production

EXPOSE 4728

CMD ["npm", "run", "start"]
