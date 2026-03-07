/**
 * services/galleries.ts — User gallery business logic.
 * Extracted from services/users.ts.
 */

import type { DB } from "@routes/types";

export async function getGallerySaves(userId: string, db: DB) {
  const [gallery, user] = await Promise.all([
    db.usercols.get(userId),
    db.users.get(userId, { switches: 1 }),
  ]);
  if (user?.switches?.booruPublic === false) return { loading: true, status: "PRIVATE" };
  return gallery?.collections.boorusave ?? [];
}

export async function getGalleryFanart(userId: string, viewerId: string | undefined, db: DB) {
  const query: Record<string, unknown> = { author_ID: userId };
  if (viewerId !== userId) query.publish = true;

  // .find() returns a query/cursor; ensure we execute it via .lean()
  const gallery: any[] = await db.fanart.find(query).lean();
  return gallery.map((item: any) => ({
    title:       item.title,
    description: item.description,
    author:      item.author_ID,
    author_url:  item.artistlink,
    likes:       item.hearts || 0,
    url:         item.src,
    thumb:       item.src.replace("artwork/", "artwork/thumbs/"),
    status:      item.publish ? "published" : item.publish === false ? "denied" : "pending",
  }));
}
