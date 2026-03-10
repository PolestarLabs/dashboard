FROM oven/bun:latest

# Set a working directory inside the container
WORKDIR /app

# Copy package manifest and install dependencies first so layer can be cached
COPY package.json tsconfig.json ./

# bun will generate bun.lockb if needed; run install
RUN bun install

# Copy remaining source code
COPY . .

# expose API port
EXPOSE 7056

# default environment
ENV NODE_ENV=production

# start the API
CMD ["bun", "run", "src/index.ts"]
