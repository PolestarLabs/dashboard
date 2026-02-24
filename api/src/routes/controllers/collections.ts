import Elysia from "elysia";
import { itemsRoutes } from "./collections/items";
import { craftingRoutes } from "./collections/crafting";

// glue together the two sub-route sets under a single app instance
export const collectionsRoutes = new Elysia({ tags: ["collections"] })
  .use(itemsRoutes)
  .use(craftingRoutes);
