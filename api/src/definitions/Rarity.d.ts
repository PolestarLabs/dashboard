export enum RarityEnum {
  C   = "Common",
  U   = "Uncommon",
  R   = "Rare",
  SR  = "Super Rare",
  UR  = "Ultra Rare",
  XR  = "Extra Rare",
};

export type Rarity = keyof typeof RarityEnum;