import {
  getCommendsSimple,
  getCommendsFull,
  getCommendRank,
} from "../../routes/services/commends";

import { makeFakeDb } from "../factories";

const fakeRedis = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

describe("services/commends.ts", () => {
  let db: any;
  beforeEach(() => {
    db = makeFakeDb({ commends: { parseFull: jest.fn(), get: jest.fn(), aggregate: jest.fn() } });
  });

  it("getCommendsSimple proxies to db", async () => {
    const fake = { foo: true };
    db.commends.parseFull.mockResolvedValueOnce(fake);
    expect(await getCommendsSimple("u", db)).toBe(fake);
  });

  it("getCommendsFull returns null when no data", async () => {
    db.commends.parseFull.mockResolvedValueOnce(null);
    expect(await getCommendsFull("u", db, fakeRedis)).toBeNull();
  });

  it("getCommendsFull computes stats", async () => {
    const userCommends = {
      whoIn: [{ id: "a", count: 3 }, { id: "b", count: 1 }],
      whoOut: [{ id: "c", count: 2 }],
      totalIn: 4,
      totalOut: 2,
    };
    db.commends.parseFull.mockResolvedValueOnce(userCommends);
    const result = await getCommendsFull("u", db, fakeRedis);
    expect(result!.whoIn[0].count).toBe(3);
    expect(result!.average).toBe(Math.floor(4 / userCommends.whoIn.length));
  });

  it("getCommendRank computes rank from aggregate", async () => {
    db.commends.get.mockResolvedValueOnce({ whoIn: [{ count: 5 }] });
    db.commends.aggregate.mockResolvedValueOnce([{ count: 10 }]);
    const r = await getCommendRank("u", "in", db);
    expect(r.rank).toBe(10);
    expect(r.count).toBe(5);
  });
});
