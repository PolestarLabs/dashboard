/**
 * utils/cosmetics.ts — helpers related to cosmetics and sticker packs.
 */

export async function stickerCount(pack: any, DB: any): Promise<any> {
  const [pdata, mdata] = await Promise.all([
    DB.cosmetics
      .find({ series_id: pack.icon }, { name: 1, id: 1, rarity: 1 })
      .lean(),
    DB.items
      .find(
        { id: { $in: pack?.materials?.map((x: any) => x.id ?? x) ?? [] } },
        { name: 1, id: 1, rarity: 1 },
      )
      .lean(),
  ]);
  pack.size = pdata.length;
  pack.materialsData = mdata;
  pack.content = pdata;
  return pack;
}
