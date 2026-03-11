/**
 * Global type declarations for the Pollux dashboard.
 *
 * When migrating a .js file to .ts, move its types here or into a
 * co-located .d.ts / inline interface. This file covers the globals
 * that are injected at startup by neodash.js and available everywhere.
 */

import type { Client as ErisClient, Permission } from 'eris';
import type { Request, Response, NextFunction } from 'express';
import type { Model, Document } from 'mongoose';

// ── Gearbox extensions on Eris.Client ─────────────────────────────────────────
export interface GearboxClientMethods {
  resolveUser(idOrTag: string): Promise<ErisClient['users'] extends Map<string, infer U> ? U : unknown>;
  resolveMember(guildId: string, idOrTag: string): Promise<unknown>;
  getTarget(guildId: string, idOrTag: string): Promise<unknown>;
  getTargetLegacy(guildId: string, idOrTag: string): Promise<unknown>;
  getChannelImg(channel: unknown): Promise<string>;
  modPass(guildId: string, userId: string): boolean;
  gamechange(userId: string, game: string): void;
  getPreviousMessage(channelId: string, messageId: string): Promise<unknown>;
  autoHelper(guildId: string): unknown;
  usage(cmd: string): unknown;
  /** Injected by neodash at startup */
  redis: import('redis').RedisClient;
}

export type PLXClient = ErisClient & GearboxClientMethods & {
  id: string;
  category?: string;
  friendly_name?: string;
  internal_name?: string;
};

// ── DB shape ──────────────────────────────────────────────────────────────────
// Each collection exposes Mongoose methods plus the custom helpers added by
// @schema (get, set, new, etc.).
type MongooseModel = Model<Document> & {
  get(idOrQuery: string | Record<string, unknown>, projection?: Record<string, unknown>): Promise<Document & Record<string, unknown>>;
  set(idOrQuery: string | Record<string, unknown>, update: Record<string, unknown>): Promise<unknown>;
  new(data: Record<string, unknown>): Promise<unknown>;
};

export interface DBConnection {
  servers: MongooseModel;
  users: MongooseModel;
  usercols: MongooseModel;
  globals: MongooseModel & {
    findOneAndUpdate(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<unknown>;
    updateOne(filter: Record<string, unknown>, update: Record<string, unknown>): Promise<unknown>;
  };
  reactRoles: MongooseModel;
  feed: MongooseModel;
  localranks: MongooseModel;
  temproles: MongooseModel;
  paidroles: MongooseModel;
  cosmetics: MongooseModel;
  items: MongooseModel;
  svMetaDB: MongooseModel;
  serverDB: MongooseModel;
  userDB: MongooseModel;
  /** Any other dynamically-accessed collection */
  [key: string]: unknown;
}

// ── polluxClients Map entry ───────────────────────────────────────────────────
export interface PolluxClientEntry {
  client: PLXClient;
  user: Record<string, unknown>;
  meta?: {
    name: string;
    fname: string;
    id: string;
    category: string;
  };
}

// ── userCache ─────────────────────────────────────────────────────────────────
export interface UserCache {
  set(id: string, val: unknown): void;
  get(id: string): Promise<unknown>;
}

// ── Global augmentations ──────────────────────────────────────────────────────
declare global {
  // Core bot client (always the "main" or "polaris" client for this env)
  var PLX: PLXClient;

  // All initialised Discord sub-clients, keyed by bot ID
  var polluxClients: Map<string, PolluxClientEntry>;

  // Mongoose + custom helpers
  var DB: DBConnection;

  // Request-scoped active client resolver (respects session on staging)
  var getActivePLX: (req: Request) => PLXClient;

  // Middleware helpers
  var checkAuth: (req: Request, res: Response, next: NextFunction) => void;
  var compulsoryAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  // Permission helpers
  var isAdmin: (req: Request, svID: string) => Promise<boolean>;
  var hasPolluxRole: (req: Request, roleID: string) => boolean;

  // Cache middleware factory
  var cacheFunction: (duration: number) => (req: Request, res: Response, next: NextFunction) => void;

  // Route helpers
  var simplepages: (location?: string | false) => Record<string, (req: Request, res: Response, next?: NextFunction) => void>;
  var complexpages: (location?: string | false) => Record<string, (req: Request, res: Response, next?: NextFunction) => void>;

  // Misc globals
  var HOST: string;
  var appRoot: string;
  var MARKET_TOKEN: string;
  var Sentry: typeof import('@sentry/node');
  var userCache: UserCache;

  // Injected by Gearbox.Global (includes wait, and other utilities)
  // Not exhaustively typed here — add as you migrate each module.
  var wait: (seconds: number) => Promise<void>;
  var GLOBALINSTANCES: Array<{
    ip: string;
    prefix: string | number;
    clusters: number;
    readonly ports: string[];
  }>;
}

// ── Express Request augmentation ─────────────────────────────────────────────
declare module 'express-serve-static-core' {
  interface Request {
    /** Active PLX client for this request (session-aware on staging) */
    PLX: PLXClient;
    user: {
      id: string;
      username: string;
      discriminator: string;
      avatar: string | null;
      guilds: Array<{
        id: string;
        name: string;
        icon: string | null;
        owner: boolean;
        permissions: number;
        features: string[];
        // Computed by dashboard route
        rank?: string;
        hasPollux?: boolean;
        hasPolluxDetail?: unknown;
        rankSort?: number;
        faved?: boolean;
        ava?: string;
      }>;
      // Injected per-request
      validator?: string;
      valFail?: number;
      handled?: boolean;
    };
  }
}

export {};
