import Elysia, { t } from "elysia";

// generator for the "ship" graphic. Ported from legacy Express route
// located at dashboard/src/routes/generators/ship.js

export const shipRoutes = new Elysia({ prefix: "/generators/ship", tags: ["generators"] })
  .get("/", async ({ query }) => {
    // query params: av1,av2,spn,pct
    const { av1, av2, spn, pct } = query as Record<string, string>;
    if (![av1, av2, spn, pct].every((x) => !!x)) {
      return new Response("INVALID ARGS", { status: 400 });
    }

    const [uid1, hash1] = av1.split("::");
    const [uid2, hash2] = av2.split("::");
    const pctNum = parseFloat(pct);

    // dynamic require to keep compatibility with bot utilities path
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Picto = require(process.env.BOT_PATH + "/core/utilities/Picto");

    const canvas = Picto.new(796, 445);
    const ctx = canvas.getContext("2d");

    const [randPic, mainframe, aviA, aviB] = await Promise.all([
      Picto.getCanvas(`https://cdn.pollux.gg/build/ship/${Math.round(pctNum / 10)}.png`),
      Picto.getCanvas(`https://cdn.pollux.gg/build/ship/mainframe.png`),
      Picto.getCanvas(`https://cdn.discordapp.com/avatars/${uid1}/${hash1}.png?size=256`),
      Picto.getCanvas(`https://cdn.discordapp.com/avatars/${uid2}/${hash2}.png?size=256`),
    ]);

    ctx.fillStyle = "#ffdeaa";
    ctx.fillRect(87, 105, 630, 190);
    ctx.drawImage(aviA, 87 - 10, 95, 200, 200);
    ctx.drawImage(aviB, 522 - 10, 95, 200, 200);
    ctx.drawImage(randPic, 287, 17);

    ctx.drawImage(mainframe, 0, 0);

    Picto.setAndDraw(
      ctx,
      Picto.tag(
        ctx,
        `❤  ${spn}  ❤`,
        "600 35px 'Panton'",
        "#FFF",
      ),
      400,
      318,
      540,
      "center",
    );

    ctx.translate(300, 80);
    ctx.rotate(-0.195);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(30,30,80,.2)";
    const mainW = Picto.popOutTxt(
      ctx,
      pctNum.toString().padStart(3, " "),
      0,
      0,
      "80px 'Corporate Logo Rounded'",
      "#fff",
      null,
      { style: "#f69", line: 20 },
      -1,
    ).w;
    ctx.rotate(0.195 - 0.05);
    Picto.popOutTxt(ctx, "%", mainW - 30, 15, "44px 'Corporate Logo Rounded'", "#fff", null, { style: "#f69", line: 15 }, -1);
    ctx.rotate(0.05);
    ctx.translate(-300, -80);

    const png = await canvas.png;
    return new Response(png, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  }, {
    query: t.Object({
      av1: t.String(),
      av2: t.String(),
      spn: t.String(),
      pct: t.String(),
    }),
  });
