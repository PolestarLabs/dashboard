# Pollux Dashboard (Docker setup)

This repository contains both the **dashboard** (Express/Node) and **api** (Elysia/Bun) services. The following `docker-compose` configuration launches a local MongoDB and Redis alongside both applications, making it easy to run the entire stack with a single command.

## Getting started

```bash
cd /path/to/dashboard

# build images and start everything
docker-compose up --build
```

By default:

- MongoDB is exposed on `localhost:27017` and data is persisted in a Docker volume.
- Redis is exposed on `localhost:6379`.
- API service listens on `localhost:7056`.
- Dashboard listens on `localhost:4728`.

Environment variables used by the services are declared in `docker-compose.yml`. You can override them by exporting values or creating an `.env` file.

### Notes

- The API image uses the official `oven/bun` base image. It runs the Bun command defined in `api/package.json`.
- The dashboard image is based on `node:18-alpine` and runs `npm run start`.
- Both services are configured to connect to MongoDB and Redis via the container hostnames (`mongo`, `redis`).

Feel free to extend or modify the compose file to include additional services or tooling.
