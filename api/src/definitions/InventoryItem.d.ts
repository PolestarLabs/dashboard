export type {
  InventoryItem,
  ItemType,
  ItemSeries,
  ItemFilter,
  UserItem,
} from "/api/schema/types";

import type { UserItem, ItemType } from "/api/schema/types";

/** @deprecated Use `UserItem` from the schema package instead. */
export type UserInventoryItem = UserItem;

/** @deprecated Use `ItemType` from the schema package instead. */
export type InventoryItemType = ItemType;