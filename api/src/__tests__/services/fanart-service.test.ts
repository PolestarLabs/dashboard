import {
  toggleFanartHeart,
  deleteFanart,
  updateFanart,
} from "../../routes/services/fanart";

function makeFakeDb(): any {
  return {
    collections: { fanart: { findOne: jest.fn(), updateOne: jest.fn() } },
    users: { set: jest.fn() },
    fanart: { get: jest.fn(), remove: jest.fn(), updateMany: jest.fn(), set: jest.fn() },
  };
}

describe("services/fanart.ts", () => {
  let db: any;
  beforeEach(() => {
    db = makeFakeDb();
  });

  it("toggleFanartHeart returns 404 when not found", async () => {
    db.collections.fanart.findOne.mockResolvedValueOnce(null);
    const r = await toggleFanartHeart("u", "f", "add", db);
    expect(r.status).toBe(404);
  });

  it("toggleFanartHeart increments and decrements appropriately", async () => {
    db.collections.fanart.findOne.mockResolvedValueOnce({ id: "f" });
    const r1 = await toggleFanartHeart("u", "f", "add", db);
    expect(r1.status).toBe(200);
    const r2 = await toggleFanartHeart("u", "f", "remove", db);
    expect(r2.ok).toBe(true);
  });

  it("deleteFanart handles missing/forbidden", async () => {
    db.fanart.get.mockResolvedValueOnce(null);
    expect((await deleteFanart("f", "u", db)).status).toBe(404);
    db.fanart.get.mockResolvedValueOnce({ author_ID: "other" });
    expect((await deleteFanart("f", "u", db)).status).toBe(403);
  });

  it("updateFanart handles various fields and permissions", async () => {
    const old = { author_ID: "u" };
    db.fanart.get.mockResolvedValueOnce(old);
    db.fanart.updateMany = jest.fn().mockResolvedValue({});
    db.fanart.set = jest.fn().mockResolvedValue({});

    const rA = await updateFanart("f", "twitter", "u", { value: "v" }, db);
    expect(rA.ok).toBe(true);
    const rB = await updateFanart("f", "link", "u", { value: "v" }, db);
    expect(rB.ok).toBe(true);
    const rC = await updateFanart("f", "title", "u", { title: "t" }, db);
    expect(rC.ok).toBe(true);

    // forbidden
    db.fanart.get.mockResolvedValueOnce({ author_ID: "x" });
    expect((await updateFanart("f", "title", "u", { title: "t" }, db)).status).toBe(403);
  });
});
