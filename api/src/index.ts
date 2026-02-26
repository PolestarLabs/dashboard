import cluster from 'node:cluster'
import os from 'node:os'
import process from 'node:process'

import { printBanner } from "./banner";

const PORT = parseInt(process.env.API_PORT ?? "7056", 10);
const IS_DEV = process.env.NODE_ENV !== "production";
import { version } from "../package.json";


if (cluster.isPrimary) {
  printBanner(IS_DEV ? "0.0.0.0" : "127.0.0.1", PORT, version);

  for (let i = 0; i < os.availableParallelism(); i++) cluster.fork();
} else {
  const clusterId = cluster.worker?.id ?? "X";
  console.log(`Cluster #${clusterId} (PID: ${process.pid}) started`)
  
  const _log = console.log;
  console.log = (...args: any[]) => {
    _log(`[Worker ${clusterId}]`, ...args);
  };
  
  await import('./server')
}
