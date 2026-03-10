export type {
  CosmeticType,
  CosmeticBaseItem,
  CosmeticBackground,
  CosmeticMedal,
  CosmeticSticker,
  CosmeticFlair,
  CosmeticSkin,
  CosmeticBoosterpack,
  CosmeticBundle,
  CosmeticItem,
} from "@polestarlabs/database_schema/types";

/** Shape of a raw cosmetic document returned from MongoDB (loose projection). */

import type { CosmeticItem } from "@polestarlabs/database_schema/types";
export default CosmeticItem;