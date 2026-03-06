// database-related factory helpers for tests

import { Schemas } from "@polestar/database_schema";

const MONGODB_DB_COLLECTION = {
    get: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    remove: jest.fn(),
    set: jest.fn(),
    aggregate: jest.fn(),
}

export function cursor<T>(data: T) {
  return {
    lean: async () => data,
  };
}

export function makeFakeDb(overrides: Partial<any> = {}) {
  const db = {
    users: { ...MONGODB_DB_COLLECTION, findOne: jest.fn() },
    userInventory: { ...MONGODB_DB_COLLECTION },
    items: MONGODB_DB_COLLECTION,
    cosmetics: MONGODB_DB_COLLECTION,
    commends: MONGODB_DB_COLLECTION,
    usercols: MONGODB_DB_COLLECTION,
    fanart: MONGODB_DB_COLLECTION,
    relationships: MONGODB_DB_COLLECTION,
    collections: { fanart: MONGODB_DB_COLLECTION },
  } as unknown as Schemas;
  return Object.assign(db, overrides);
}
