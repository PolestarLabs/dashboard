FROM oven/bun:latest

# Set a working directory inside the container
WORKDIR /app

# Copy package manifest and tsconfig first (including local schema dependency)
COPY package.json tsconfig.json ./

# install all dependencies; file:./schema will be pulled from workspace
RUN bun install

# Copy remaining source code and scripts
COPY . .

# expose API port
EXPOSE 7056

# default environment
ENV NODE_ENV=production

# start the API
CMD ["bun", "start"]
