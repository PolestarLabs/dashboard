/**
 * services/crafting.ts — Pure crafting business logic, decoupled from Elysia.
 * Promoted from services/collections/crafting/service.ts.
 *
 * No Elysia Context imported here — accepts typed payloads, returns plain objects.
 */

import type { Rarity } from "@definitions/Rarity";
import RARITY_VALUES from "@definitions/constants/Rarity";
import { shuffle } from "utils/shuffle";
import { isExact } from "utils/crafting";
import type { PotItem, MixBody, MixResponse, CreateBody, CreateResponse } from "@routes/_schemas";

// ── Internal helpers ─────────────────────────────────────────────────────────

function rarityCompare(a: PotItem, b: PotItem): number {
  const ia = RARITY_VALUES.indexOf(a.rarity as Rarity);
  const ib = RARITY_VALUES.indexOf(b.rarity as Rarity);
  return ia - ib;
}

function findInPot(id: string, pot: PotItem[]): PotItem | undefined {
  return pot.find((i) => i.id === id);
}

const EXP_TABLE: Record<Rarity, number> = { C: 1, U: 2, R: 5, SR: 10, UR: 25, XR: 50 };

// ── Service ──────────────────────────────────────────────────────────────────

export class CraftingService {

  /**
   * Discovers what can be crafted from the given pot of materials.
   * Falls back to type-based matching when no exact recipe exists.
   */
  static async mix(
    payload: MixBody,
    userId: string | undefined,
    DB: any,
  ): Promise<MixResponse> {
    const pot = payload.pot as PotItem[];
    if (!pot?.length) return { error: "No Pot" };

    // Resolve crafting history to detect new discoveries
    let craftingHistory: string[] = [];
    if (userId) {
      const cosmeticsData = await DB.userInventory.get(userId);
      craftingHistory = ((cosmeticsData?.inventory ?? []) as any[])
        .filter((x) => x.crafted > 0)
        .map((i) => i.id);
    }

    const potTypeMap = pot.map((i) => i.type);

    type MaterialClause =
      | { "materials.id": string; "materials.count": { $lte: number } }
      | { materials: { $size: number } };

    const queryExact = {
      $or: [
        { materials: { $size: pot.length, $all: pot.map((i) => i.id) } },
        {
          $and: [
            ...pot.map((itm) => ({
              "materials.id":    itm.id,
              "materials.count": { $lte: itm.count },
            })),
            { materials: { $size: pot.length } } as MaterialClause,
          ],
        },
      ],
      crafted: true,
    };

    const queryBroad = {
      $or: [
        { materials: { $all: pot.map((i) => i.id) } },
        { "materials.id": { $all: pot.map((i) => i.id) } },
      ],
      crafted: true,
    };

    let possible: any[] = [];
    const isExactMatch = (await DB.items.countDocuments(queryExact)) > 0;
    const isBroadMatch = isExactMatch || (await DB.items.countDocuments(queryBroad)) > 0;

    if (!isBroadMatch) {
      // Type-craft fallback — scale count by rarity weight
      const refinedPot: PotItem[] = pot.map((item) => ({
        ...item,
        count: item.count * ((RARITY_VALUES.indexOf(item.rarity as Rarity) + 1) / 2),
      }));

      const querySameType = {
        $and: pot
          .map((itm) => {
            const threshold =
              refinedPot
                .filter((i) => i.type === itm.type)
                .reduce<{ count: number }>(
                  (a, b) => ({ count: a.count + b.count }),
                  { count: 0 },
                ).count ?? 0;
            return {
              "typeCraft.count": { $lte: threshold },
              "typeCraft.type":  itm.type,
            };
          })
          .concat([{ "typeCraft.type": { $all: potTypeMap } } as any]),
        crafted: true,
      };

      const isSameTypeMatch = (await DB.items.countDocuments(querySameType)) > 0;

      const potSorted   = [...pot].sort((a, b) => -rarityCompare(a, b));
      const highestRar  = potSorted[0]?.rarity as Rarity;
      const lowestRar   = potSorted[pot.length - 1]?.rarity as Rarity;

      if (isSameTypeMatch) {
        possible = await DB.items.find(querySameType);
        possible = possible.filter((x: any) => {
          const ri = RARITY_VALUES.indexOf(x.rarity as Rarity);
          return (
            ri >= (RARITY_VALUES.indexOf(lowestRar) || 1) &&
            ri <= RARITY_VALUES.indexOf(highestRar)
          );
        });
      }

      if (possible.length) {
        const pick = shuffle(possible)[0]!;
        return {
          discovery:   pick,
          isDiscovery: !craftingHistory.includes(pick.id),
          canCraftNow: true,
          typeCraft:   true,
        };
      }

      // Last resort — any item with matching types
      possible = await DB.items.find({ "typeCraft.type": { $all: potTypeMap } });
      if (!possible.length) return { possible: 0, noMoreTable: true } as any;

      const fallback = shuffle(possible)[0]!;
      return {
        discovery:   fallback,
        isDiscovery: !craftingHistory.includes(fallback.id),
        canCraftNow: false,
        typeCraft:   true,
        notQuite:    true,
      };
    }

    // Exact match: prefer the result that fits the pot most closely
    if (isExactMatch) {
      possible = await DB.items.find(queryExact);
      if (possible.length > 1) {
        possible = [
          possible.sort((a: any, b: any) => {
            const r = rarityCompare(a, b);
            if (r !== 0) return r;
            const aFits = (a.materials ?? []).every(
              (m: any) => m.count <= (findInPot(m.id, pot)?.count ?? 0),
            );
            return aFits ? -1 : 0;
          })[0]!,
        ];
      }
    }

    if (possible[0]) {
      const [discovery] = possible;
      return {
        discovery,
        isDiscovery: !craftingHistory.includes(discovery.id),
        canCraftNow: isExact(pot, discovery?.materials),
      };
    }

    return { error: "No recipe found" };
  }

  /**
   * Executes a craft: consumes materials from the user's inventory and adds
   * the crafted item. Returns `{ ok, code, body }` for the controller to relay.
   */
  static async craft(
    payload: CreateBody,
    userId: string,
    DB: any,
  ): Promise<{ ok: boolean; code: number; body: CreateResponse }> {
    const { item, pot } = payload;

    const itemToCraft = await DB.items.get({ id: item });
    if (!itemToCraft?.crafted)
      return {
        ok: false, code: 403,
        body: { status: "ERROR", message: "This item can't be crafted" },
      };

    const [userData, cosmeticsDoc] = await Promise.all([
      DB.users.get(userId),
      DB.userInventory.getFull(userId),
    ]);
    if (!userData)
      return {
        ok: false, code: 401,
        body: { status: "ERROR", message: "Not Logged in" },
      };

    const materials = pot ?? itemToCraft.materials;
    for (const itm of materials) {
      const has = cosmeticsDoc.inventory.find((i: any) => i.id === itm.id);
      if (!has || has.count < itm.count)
        return {
          ok: false, code: 403,
          body: { status: "ERROR", message: `You don't have enough of [${itm.id}]` },
        };
    }

    await Promise.all(materials.map((m: any) => cosmeticsDoc.removeItem(m.id, m.count)));
    await Promise.all([
      cosmeticsDoc.addItem(item, 1, true),
      DB.users.set(userId, {
        $inc: { "progression.craftingExp": EXP_TABLE[itemToCraft.rarity as string] ?? 1 },
      }),
    ]);

    return {
      ok:   true,
      code: 200,
      body: {
        status:    "OK",
        message:   "Item has been crafted",
        inventory: cosmeticsDoc.inventory,
      },
    };
  }
}
