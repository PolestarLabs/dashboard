import {
  getGallerySaves,
  getGalleryFanart,
} from "../../services/galleries";

import { makeFakeDb } from "../factories";

describe("services/galleries.ts", () => {
  let db: any;
  beforeEach(() => {
    db = makeFakeDb();
  });

  it("getGallerySaves respects private switch", async () => {
    db.usercols.get.mockResolvedValueOnce({ collections: { boorusave: [1] } });
    db.users.get.mockResolvedValueOnce({ switches: { booruPublic: false } });
    const r = await getGallerySaves("u", db);
    expect(r.status).toBe("PRIVATE");
  });

  it("getGalleryFanart maps fields correctly", async () => {
    const item = { title: "t", description: "d", author_ID: "u", artistlink: "url", hearts: 5, src: "artwork/foo.png", publish: true };
    // return cursor-like object for .lean()
    db.fanart.find.mockReturnValueOnce({ lean: async () => [item] });
    const arr = await getGalleryFanart("u", "x", db);
    expect(arr[0].thumb).toContain("thumbs");
    expect(arr[0].status).toBe("published");
  });
});
