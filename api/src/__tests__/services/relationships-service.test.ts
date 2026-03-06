/**
 * Tests for relationships service — ensures usersData uses profile.tagline and
 * profile.featuredMarriage (new schema), not .modules or top-level.
 */
import { getRelationships } from "../../services/relationships";
import { makeFakeDb } from "../factories";

jest.mock("@helpers/discord", () => ({
  getManyDiscordUsers: jest.fn(async (ids: string[]) =>
    ids.map((id) => ({ id, username: `user${id}`, avatar: null, bot: false }))
  ),
}));

describe("@services/relationships.ts", () => {
  afterEach(() => jest.clearAllMocks());

  describe("getRelationships", () => {
    it("maps usersData from profile.tagline and profile.featuredMarriage", async () => {
      const db = makeFakeDb();
      const relId = "rel123";
      const userId1 = "u1";
      const userId2 = "u2";
      const mockRels = [
        {
          _id: relId,
          type: "marriage",
          users: [userId1, userId2],
          initiative: userId1,
          ring: "jade",
          since: new Date(),
          usersData: [
            { id: userId1, profile: { tagline: "Hello", featuredMarriage: "marriage1" } },
            { id: userId2, profile: { tagline: "World", featuredMarriage: null } },
          ],
        },
      ];

      const leanResult = Promise.resolve(mockRels);
      (db.relationships.find as jest.Mock).mockReturnValue({
        populate: () => ({ lean: () => leanResult }),
        limit: () => ({ skip: () => ({ populate: () => ({ lean: () => leanResult }) }) }),
      });

      const result = await getRelationships({ id: relId }, db as any, {});

      expect(result.ok).toBe(true);
      expect(result.data).toHaveLength(1);
      const usersData = result.data![0].usersData;
      expect(usersData).toHaveLength(2);
      expect(usersData[0].tagline).toBe("Hello");
      expect(usersData[0].featuredMarriage).toBe("marriage1");
      expect(usersData[1].tagline).toBe("World");
      expect(usersData[1].featuredMarriage).toBeNull();
    });

    it("returns 400 when neither id nor uid provided", async () => {
      const db = makeFakeDb();
      const result = await getRelationships({}, db as any, {});
      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
    });
  });
});
