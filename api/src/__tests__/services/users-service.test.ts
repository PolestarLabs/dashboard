import {
  parseUserdata,
  parseUserAndReturn,
  searchUsers,
  getUserInventory,
  getUserStickers,
  getUserMedals,
  getUserBackgrounds,
} from "../../services/users";

import { makeFakeDb, cursor, makeUser } from "../factories";

const fakeRedis = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

// stub discord helper functions when needed
jest.mock("@helpers/discord", () => ({
  getDiscordUser: jest.fn(async (id: string) => ({ id, username: `user${id}`, avatarURL: null })),
  getManyDiscordUsers: jest.fn(async (ids: string[]) => ids.map((id) => ({ id, username: `user${id}`, avatarURL: null }))),
}));

describe("@services/users.ts", () => {
  afterEach(() => jest.clearAllMocks());

  describe("parseUserdata", () => {
    it("returns minimal object when USR is null and discord user exists", () => {
      const discord = { id: "123", username: "bob", avatarURL: "foo" } as any;
      const { response, STATUS } = parseUserdata(discord, null, 200);
      expect(response.id).toBe("123");
      expect(response.tag).toBe("bob");
      expect(response.avatar).toBe("foo");
      expect(response.isPolluxUser).toBe(false);
      expect(STATUS).toBe(206);
    });

    it("marks discord error appropriately", () => {
      const discord = { id: "", username: "", avatarURL: null, error: "oops" } as any;
      const { response, STATUS } = parseUserdata(discord, null, 200);
      expect(response.discordDataUnavailable).toBe("oops");
      expect(STATUS).toBe(400);
    });

    it("includes profile data when USR is present (new schema: profile/currency/progression)", () => {
      const discord = { id: "1", username: "a", avatarURL: null } as any;
      const USR: any = {
        progression: { level: 2, exp: 100 },
        currency: { RBN: 0, JDE: 0, SPH: 0 },
        counters: { commend: 5 },
        profile: {
          bgID: "bg",
          sticker: "stick",
          favcolor: "red",
          flairTop: "none",
          persotext: "hi",
          tagline: "tl",
          medals: [],
        },
        prime: { tier: "gold" },
        blacklisted: "",
      };
      const cosmetics = { inventory: [{ count: 3 }] };
      const { response, STATUS } = parseUserdata(discord, USR, 200, cosmetics);
      expect(response.level).toBe(2);
      expect(response.donatorTier).toBe("gold");
      expect(response.inventorySize).toBe(3);
      expect(response.profile).toMatchObject({ tagline: "tl", background: "bg" });
      expect(STATUS).toBe(200);
    });

    it("does not rely on .modules (uses profile/currency/progression only)", () => {
      const discord = { id: "2", username: "b", avatarURL: null } as any;
      const USRNoModules: any = {
        progression: { level: 1, exp: 50 },
        currency: { RBN: 500, JDE: 2500, SPH: 0 },
        profile: { tagline: "No modules here", bgID: null },
        prime: {},
        counters: {},
      };
      const { response } = parseUserdata(discord, USRNoModules, 200);
      expect(response.level).toBe(1);
      expect(response.profile.tagline).toBe("No modules here");
      expect(USRNoModules.modules).toBeUndefined();
    });
  });

  describe("searchUsers", () => {
    it("builds queries from allowed keys and returns mapped results", async () => {
      const db = makeFakeDb();
      const sampleUsr = {
        id: "42",
        progression: { level: 0, exp: 0 },
        currency: { RBN: 0, JDE: 0, SPH: 0 },
        profile: {},
        prime: {},
        counters: {},
      };
      (db.users.find as jest.Mock).mockReturnValueOnce({
        skip: () => ({ limit: () => ({ sort: () => ({ lean: async () => [sampleUsr] }) }) }),
      });
      (db.userInventory.get as jest.Mock).mockResolvedValue({ inventory: [] });
      const results = await searchUsers({ id: "42" }, db, fakeRedis);
      expect(results).toMatchObject([{ id: "42", tag: "user42", avatar: null }]);
      expect(db.users.find).toHaveBeenCalled();
    });
  });

  describe("inventory / stickers / medals / backgrounds helpers", () => {
    let db: any;
    beforeEach(() => {
      db = makeFakeDb();
    });

    it("returns null when user not found", async () => {
      (db.userInventory.findOne as jest.Mock).mockReturnValueOnce({
        populate: () => ({ lean: () => Promise.resolve(null) }),
      });
      expect(await getUserInventory("x", db)).toBeNull();
      (db.userInventory.get as jest.Mock).mockResolvedValueOnce(null);
      expect(await getUserStickers("x", db)).toBeNull();
      (db.userInventory.get as jest.Mock).mockResolvedValueOnce(null);
      expect(await getUserMedals("x", db)).toBeNull();
      (db.userInventory.get as jest.Mock).mockResolvedValueOnce(null);
      expect(await getUserBackgrounds("x", db)).toBeNull();
    });

    it("filters inventory and attaches meta (itemsData from populate)", async () => {
      (db.userInventory.findOne as jest.Mock).mockReturnValueOnce({
        populate: () => ({
          lean: () =>
            Promise.resolve({
              inventory: [{ id: "i1", count: 1 }, { id: "i2", count: 0 }],
              itemsData: [{ id: "i1", name: "foo" }],
            }),
        }),
      });
      const inv = await getUserInventory("u", db);
      expect(inv![0].meta.name).toBe("foo");
    });

    it("calculates sticker meta and packData", async () => {
      (db.userInventory.get as jest.Mock).mockResolvedValueOnce({ stickerInventory: ["s1"] });
      (db.cosmetics.find as jest.Mock).mockReturnValueOnce({ lean: async () => [{ id: "s1", series_id: "p1" }] });
      (db.items.find as jest.Mock).mockReturnValueOnce({ lean: async () => [{ icon: "p1" }] });
      const stickers = await getUserStickers("u", db);
      expect(stickers![0].packData.icon).toBe("p1");
    });

    it("calls noCache on medals and returns result", async () => {
      const fakeCursor = { lean: () => ({ noCache: () => "medals" }) };
      (db.userInventory.get as jest.Mock).mockResolvedValueOnce({ medalInventory: ["m1"] });
      (db.cosmetics.find as jest.Mock).mockReturnValueOnce(fakeCursor);
      const medals = await getUserMedals("u", db);
      expect(medals).toBe("medals");
    });

    it("returns backgrounds list", async () => {
      (db.userInventory.get as jest.Mock).mockResolvedValueOnce({ bgInventory: ["bg1"] });
      (db.cosmetics.find as jest.Mock).mockReturnValueOnce({ lean: async () => ["bg1"] });
      const bgs = await getUserBackgrounds("u", db);
      expect(bgs).toEqual(["bg1"]);
    });
  });
});
