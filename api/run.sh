#!/usr/bin/env bash
# PM2 shell wrapper — avoids ProcessContainerForkBun.js require() which
# cannot handle Elysia's ESM-only Bun dist (named export resolution fails).
exec bun run src/index.ts
