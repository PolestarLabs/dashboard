/**
 * utils/cosmetics.ts — helpers related to cosmetics and sticker packs.
 */

import { db } from "@plugins/db";

export async function stickerCount(pack: any): Promise<any> {
  const [pdata, mdata] = await Promise.all([
    db.cosmetics
      .find({ series_id: pack.icon }, { name: 1, id: 1, rarity: 1 }),
    db.items
      .find(
        { id: { $in: pack?.materials?.map((x: any) => x.id ?? x) ?? [] } },
        { name: 1, id: 1, rarity: 1 },
      ),
  ]);
  pack.size = pdata.length;
  pack.materialsData = mdata;
  pack.content = pdata;
  return pack;
}
