export enum CurrencyEnum {
  RBN = "Rubine",
  JDE = "Jade",
  SPH = "Sapphire",
  AMY = "Amethyst",
  EMD = "Emerald",
  TPZ = "Topaze",
  PSM = "Prism",
  EVT = "Event",
};

export type Currency = keyof typeof CurrencyEnum;