require('colors')
console.log(" -- Full Start -- ")

console.log("•".yellow + " Setting up environment...");

try{
    const [,DASHBOARD] = require("../../_Pollux-ecosystem.config").apps;
    console.table(DASHBOARD.env);
    Object.assign(process.env, DASHBOARD.env)
}catch(err){
    console.error(" DASHBOARD ECOSYSTEM FILE NOT FOUND ".bgRed);
    process.exit(1);
}

const  ARG = process.argv[2] || "src";
console.log(`• Starting as ${ARG}`.gray)
console.log("\n -- Starting Neodash: -- ".bgBlue)
const Dash = require(`./${ARG}/neodash.js`)
console.log("\n -- Starting CDN: -- ".bgCyan)
const CDN  = require(`./${ARG}/cdn.js`)
