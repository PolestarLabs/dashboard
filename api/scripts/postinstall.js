#!/usr/bin/env node

// postinstall script for pollux-core-api
// ensures skia-canvas native binary is present and logs outcome.

const { execSync } = require("child_process");
const path = require("path");

function run() {
  const prebuild = path.join(
    __dirname,
    "..",
    "node_modules",
    "skia-canvas",
    "lib",
    "prebuild.mjs",
  );
  console.log("[postinstall] 📦 running skia-canvas prebuild...");
  try {
    execSync(`node "${prebuild}" download --or-compile`, { stdio: "inherit" });
    console.log("[postinstall] ✅ skia-canvas native binary ready.");
  } catch (err) {
    console.error("[postinstall] ❌ failed to fetch/compile skia-canvas binary:", err);
    console.error("[postinstall]    you may need a Rust toolchain or internet access.");
    process.exitCode = 1;
  }
}

if (require.main === module) {
  run();
}

module.exports = run;
