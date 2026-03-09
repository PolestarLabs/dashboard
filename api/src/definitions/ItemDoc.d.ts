/** Lightweight item document shape — partial projection from the items collection. */
import type { ObjectId } from "mongoose";
import type { InventoryItemType } from "./InventoryItem";
import type { Rarity } from "./Rarity";

export interface ItemDoc {
  _id:        ObjectId;
  id:         string;
  type:       InventoryItemType;
  code?:      string;
  icon?:      string;
  name?:      string;
  rarity?:    Rarity;
  tradeable?: boolean;
  droppable?: boolean;
}
