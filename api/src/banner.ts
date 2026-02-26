// ANSI helpers
const R  = (s: string) => `\x1b[31m${s}\x1b[0m`;   // red
const B  = (s: string) => `\x1b[36m${s}\x1b[0m`;   // cyan
const M  = (s: string) => `\x1b[35m${s}\x1b[0m`;   // magenta
const GR = (s: string) => `\x1b[90m${s}\x1b[0m`;   // gray

export function printBanner(hostname: string, port: number, version: string): void {
  const text = [
    B("                                                                "),
    B("                                                                "),
    B("ooooooooo.   oooo                          .o.       ooooooooo.   ooooo "),
    B("`888   `Y88. `888                         .888.      `888   `Y88. `888' "),
    B(" 888   .d88'  888  oooo    ooo           .8\"888.      888   .d88'  888  "),
    B(" 888ooo88P'   888   `88b..8P'   ")+R(",o.o,")+B("   .8' `888.     888ooo88P'   888  "),
    B(" 888          888     Y888'     ")+R("'689'")+B("  .88ooo8888.    888          888  "),
    B(" 888          888   .o8\"'88b   ")+R("   ¨ ")+B("  .8'     `888.   888          888  "),
    B("o888o        o888o o88'   888o       o88o     o8888o o888o        o888o "),
    `     v${version}                               ${GR("Powered by Elysia")}`,
    R("                                                                "),
    M(`> API listening on http://${hostname}:${port}/api                `),
    M(`>                  http://${process.env.HOST}/api                `),
    M(`>                  http://${process.env.API_HOST}                `),
    R("                                                                "),
  ].join("\n");

  console.log(text);
}

