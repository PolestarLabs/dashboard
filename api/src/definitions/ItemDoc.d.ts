/** Lightweight item document shape — partial projection from the items collection. */
import type { ObjectId } from "mongoose";
import type { ItemType } from "@schema/types";
import type { Rarity } from "@schema/types";

export interface ItemDoc {
  _id:        ObjectId;
  id:         string;
  type:       ItemType;
  code?:      string;
  icon?:      string;
  name?:      string;
  rarity?:    Rarity;
  tradeable?: boolean;
  droppable?: boolean;
}
