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


type CosmeticType = 'background' | 'medal' | 'sticker' | 'flair' | 'skin';

export type CosmeticBaseItem = {
  _id: { toString(): string };
  id?: string;
  name: string;
  tags: string; // space separated
  rarity: Rarity;
  type: CosmeticType;
  event?: string;
  meta: Record<string, unknown>; // for misc data that doesn't fit in other fields
  // Market
  price?: number;
  BUNDLE?: string;
  exclusive: string;

  // Flags
  public: boolean;
  destroyable: boolean;
  tradeable: boolean;
  droppable: boolean;
  buyable: boolean;
};

export type CosmeticSticker = CosmeticBaseItem & {
  id: string;     // PNG
  type: 'sticker';
  release_number?: number;
  series_id?: string;
  series?: string;
  GROUP?: string;
};

export type CosmeticBoosterpack = CosmeticBaseItem & {
  id: string;     // PNG
  type: 'boosterpack';
  color: string;
  GROUP: string;
  price: number;
  items: Array<{ id: string, type: string}>; // array of cosmetic ids
};

export type CosmeticBackground = CosmeticBaseItem & {
  id: string; 
  type: 'background';
  artistName?: string;
  artistLink?: string;
  code: string; // PNG
};

export type CosmeticMedal = CosmeticBaseItem & {
  type: 'medal';
  category: string;
  howto: string; // Legacy: instruction for some seasonal medals.
  icon: string;  // PNG
};

export type CosmeticFlair = CosmeticBaseItem & {
  type: 'flair';
  id: string;  // PNG
};

export type CosmeticBundle = CosmeticBaseItem & {
  type: 'bundle';
  GROUP: string;
  price: number;
  items: Array<{ id: string, type: string}>; // array of cosmetic ids
};

type SkinCompatible = "casino" | "tarot";
type SkinSubtype = "deck"
export type CosmeticSkin = CosmeticBaseItem & {
  type: 'skin';
  localizer: string;
  for: SkinCompatible;
  subtype: SkinSubtype;
  author?: string;
  author_link?: string; // URL
  id: string;     // PNG
}

type CosmeticItem = 
  | CosmeticSkin
  | CosmeticFlair
  | CosmeticMedal
  | CosmeticBackground
  | CosmeticSticker
  | CosmeticBoosterpack
  | CosmeticBundle;

export default CosmeticItem;