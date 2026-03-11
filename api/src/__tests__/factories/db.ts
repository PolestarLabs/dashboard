// database-related factory helpers for tests

import { Schemas } from "@schema";

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
  const cur: any = {
    lean: async () => data,
    skip: () => cur,
    limit: () => cur,
    sort: () => cur,
    populate: () => cur,
    noCache: () => cur,
  };
  return cur;
}

export function makeFakeDb(overrides: Partial<any> = {}) {
  // wrap a default collection so that .find() and .findOne() return cursor objects
  function makeCollection() {
    const col: any = { ...MONGODB_DB_COLLECTION };
    col.find = jest.fn().mockImplementation(() => cursor([]));
    col.findOne = jest.fn().mockImplementation(() => cursor(null));
    return col;
  }

  const db = {
    users: makeCollection(),
    userInventory: makeCollection(),
    items: makeCollection(),
    cosmetics: makeCollection(),
    commends: makeCollection(),
    usercols: makeCollection(),
    fanart: makeCollection(),
    relationships: makeCollection(),
    collections: { fanart: makeCollection() },
  } as unknown as Schemas;
  return Object.assign(db, overrides);
}
