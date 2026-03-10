# Dashboard application container
FROM node:18-alpine

WORKDIR /app

# copy package files first
COPY package.json package-lock.json* ./

# install dependencies
RUN npm install --production

# copy the rest of the application
COPY . .

# bind to all interfaces so Docker networking works
ENV NODE_ENV=production

EXPOSE 4728

CMD ["npm", "run", "start"]
