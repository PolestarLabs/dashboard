// ANSI helpers
const R  = (s: string) => `\x1b[31m${s}\x1b[0m`;   // red
const M  = (s: string) => `\x1b[35m${s}\x1b[0m`;   // magenta
const GR = (s: string) => `\x1b[90m${s}\x1b[0m`;   // gray

export function printBanner(hostname: string, port: number): void {
  const text = [
    R("                                                                "),
    R("                                                                "),
    R("  ,ggggggggggg,                                                 "),
    R(" dP\"\"\"88\"\"\"\"\"\"Y8,      ,dPYb, ,dPYb,                            "),
    R(" Yb,  88      `8b      IP'`Yb IP'`Yb                            "),
    R("  `\"  88      ,8P      I8  8I I8  8I                            "),
    R("      88aaaad8P\"       I8  8' I8  8'                            "),
    R("      88\"\"\"\"\",ggggg,   I8 dP  I8 dP  gg      gg     ,gg,   ,gg  "),
    R("      88    dP\"  \"Y8gggI8dP   I8dP   I8      8I    d8\"\"8b,dP\"   "),
    R("      88   i8'    ,8I  I8P    I8P    I8,    ,8I   dP   ,88\"     "),
    R("      88  ,d8,   ,d8' ,d8b,_ ,d8b,_ ,d8b,  ,d8b,,dP  ,dP\"Y8,   "),
    R("      88  P\"Y8888P\"   8P'\"Y888P'\"Y888P'\"Y88P\"`Y88\"  dP\"   \"Y8  "),
    R("                                                                "),
    `     v8.0.alpha                              ${GR("Powered by Elysia")}`,
    R("                                                                "),
    M(`> API listening on http://${hostname}:${port}/api                `),
    R("                                                                "),
  ].join("\n");

  console.log(text);
}
