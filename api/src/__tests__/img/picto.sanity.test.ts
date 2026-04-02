import fs from "fs";
import path from "path";

import  Picto from "../../utils/Picto";

describe("canvas sanity check", () => {
  const fixtureDir = path.resolve(__dirname, "fixtures");
  const controlFile = path.join(fixtureDir, "canvas-red-square.png");

  // determine upfront whether the fixture already exists
  const firstRun = !fs.existsSync(controlFile);

  it(firstRun ? "creates fixture on first run" : "draws a red square and matches control image", async () => {
    if (firstRun) {
      fs.mkdirSync(fixtureDir, { recursive: true });
      const pic = Picto.new(100, 100);
      const ctx = pic.getContext('2d');
      ctx.fillStyle = "red";
      ctx.fillRect(10, 10, 50, 50);
      const buf: Buffer = await pic.toBuffer("png");
      fs.writeFileSync(controlFile, buf);
      console.log("\x1b[34m>>>\x1b[0m", "Control File created.");
      return; // skip assertion by returning early
    }

    const pic = Picto.new(100, 100);
    const ctx = pic.getContext('2d');
    ctx.fillStyle = "red";
    ctx.fillRect(10, 10, 50, 50);
    const buf: Buffer = await pic.toBuffer("png");
    const control = fs.readFileSync(controlFile);
    expect(buf.equals(control)).toBe(true);
  });
});
