/** Shape of a raw cosmetic document returned from MongoDB. */
export interface CosmeticDoc {
  _id: { toString(): string };
  id: string;
  code?: string;
  icon?: string;
  rarity?: string;
  tags?: string;
  artistName?: string;
  artistLink?: string;
  type?: string;
  GROUP?: unknown;
  BUNDLE?: unknown;
  tradeable?: boolean;
  droppable?: boolean;
  destroyable?: boolean;
  event?: string | false;
  series_id?: string;
  public?: boolean;
}
