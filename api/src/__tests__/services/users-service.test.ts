import {
  parseUserdata,
  parseUserAndReturn,
  searchUsers,
  getUserInventory,
  getUserStickers,
  getUserMedals,
  getUserBackgrounds,
} from "../../routes/services/users";

// helpers
function makeFakeDb(): any {
  return {
    users: { get: jest.fn(), find: jest.fn() },
    items: { find: jest.fn() },
    cosmetics: { find: jest.fn() },
    commends: { parseFull: jest.fn(), get: jest.fn(), aggregate: jest.fn() },
    usercols: { get: jest.fn() },
    fanart: { get: jest.fn(), find: jest.fn(), remove: jest.fn() },
    collections: { fanart: { findOne: jest.fn(), updateOne: jest.fn() } },
  };
}

const fakeRedis = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

// stub discord helper functions when needed
jest.mock("@helpers/discord", () => ({
  getDiscordUser: jest.fn(async (id: string) => ({ id, username: `user${id}`, avatarURL: null })),
  getManyDiscordUsers: jest.fn(async (ids: string[]) => ids.map((id) => ({ id, username: `user${id}`, avatarURL: null }))),
}));

describe("services/users.ts", () => {
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

    it("includes profile data when USR is present", () => {
      const discord = { id: "1", username: "a", avatarURL: null } as any;
      const USR: any = {
        modules: {
          level: 2,
          exp: 100,
          commend: 5,
          RBN: 0,
          JDE: 0,
          SPH: 0,
          inventory: [{ count: 2 }],
          bgID: "bg",
          sticker: "stick",
          favcolor: "red",
          flairTop: "none",
          persotext: "hi",
          tagline: "tl",
          medals: [],
          inventory: [{ count: 3 }],
        },
        donator: "gold",
        blacklisted: "",
      };
      const { response, STATUS } = parseUserdata(discord, USR, 200);
      expect(response.level).toBe(2);
      expect(response.donatorTier).toBe("gold");
      expect(response.inventorySize).toBe(3);
      expect(STATUS).toBe(200);
    });
  });

  describe("searchUsers", () => {
    it("builds queries from allowed keys and returns mapped results", async () => {
      const db = makeFakeDb();
      const sampleUsr = { id: "42", modules: {} };
      db.users.find.mockReturnValueOnce({
        skip: () => ({ limit: () => ({ sort: () => ({ lean: async () => [sampleUsr] }) }) }),
      });
      const results = await searchUsers({ id: "42" }, db, fakeRedis);
      expect(results).toEqual([{ id: "42", tag: "user42", avatar: null }]);
      expect(db.users.find).toHaveBeenCalled();
    });
  });

  describe("inventory / stickers / medals / backgrounds helpers", () => {
    let db: any;
    beforeEach(() => {
      db = makeFakeDb();
    });

    it("returns null when user not found", async () => {
      db.users.get.mockResolvedValueOnce(null);
      expect(await getUserInventory("x", db)).toBeNull();
      expect(await getUserStickers("x", db)).toBeNull();
      expect(await getUserMedals("x", db)).toBeNull();
      expect(await getUserBackgrounds("x", db)).toBeNull();
    });

    it("filters inventory and attaches meta", async () => {
      db.users.get.mockResolvedValueOnce({ modules: { inventory: [{ id: "i1", count: 1 }, { id: "i2", count: 0 }] } });
      db.items.find.mockResolvedValueOnce([{ id: "i1", name: "foo" }]);
      const inv = await getUserInventory("u", db);
      expect(inv[0].meta.name).toBe("foo");
    });

    it("calculates sticker meta and packData", async () => {
      db.users.get.mockResolvedValueOnce({ modules: { stickerInventory: ["s1"] } });
    // both finds return a cursor-like object with lean()
    db.cosmetics.find.mockResolvedValueOnce({ lean: async () => [{ id: "s1", series_id: "p1" }] });
    db.items.find.mockResolvedValueOnce({ lean: async () => [{ icon: "p1" }] });
      const stickers = await getUserStickers("u", db);
      expect(stickers[0].packData.icon).toBe("p1");
    });

    it("calls noCache on medals and returns result", async () => {
      const fakeCursor = { lean: () => ({ noCache: () => "medals" }) };
      db.users.get.mockResolvedValueOnce({ modules: { medalInventory: ["m1"] } });
      db.cosmetics.find.mockReturnValueOnce(fakeCursor);
      const medals = await getUserMedals("u", db);
      expect(medals).toBe("medals");
    });

    it("returns backgrounds list", async () => {
      db.users.get.mockResolvedValueOnce({ modules: { bgInventory: ["bg1"] } });
    db.cosmetics.find.mockResolvedValueOnce({ lean: async () => ["bg1"] });
      const bgs = await getUserBackgrounds("u", db);
      expect(bgs).toEqual(["bg1"]);
    });
  });
});
