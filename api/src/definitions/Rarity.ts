export enum RarityEnum {
  C  = "C",
  U  = "U",
  R  = "R",
  SR = "SR",
  UR = "UR",
  XR = "XR",
};

export type RarityType = keyof typeof RarityEnum;

export const RARITY_VALUES: RarityType[] = Object.values(RarityEnum);