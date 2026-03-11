# first stage: extract database_schema source from the prerebuilt image
# use the explicit tag that has been built locally
FROM plx-db:0.20.8 AS dbschema
WORKDIR /db
# the source repo lives at /db in the plx-db image; we’ll copy it later
# no additional commands needed in this stage

# production stage for the API
FROM oven/bun:latest

# Set a working directory inside the container
WORKDIR /app

# Copy package manifest and tsconfig first
COPY  package.json tsconfig.json ./ 
COPY  scripts ./scripts

RUN ls -la ..

# avoid pulling the private package from npm by removing it temporarily
RUN node -e "let p=require('./package.json');delete p.dependencies['@polestarlabs/database_schema'];require('fs').writeFileSync('package.json',JSON.stringify(p,null,2));"

# bun install now only installs public deps
RUN bun install

# bring in the database_schema source from the helper stage
# copy repository into node_modules so bun can resolve the package name
COPY --from=dbschema /db /app/node_modules/@polestarlabs/database_schema

# Copy remaining source code
COPY . .

# expose API port
EXPOSE 7056

# default environment
ENV NODE_ENV=production

# start the API
CMD ["ls", "-la"]
CMD ["bun", "start"]
