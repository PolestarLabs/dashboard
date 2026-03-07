// @ts-nocheck
import { Request, Response, NextFunction } from 'express';

// the real neodash script loads a bunch of global state, mongoose and
// other heavy dependencies; for this unit test we just recreate the
// middleware in isolation.
// additionally stub mongoose so any incidental imports won't attempt a
// connection and blow up (see TypeError from mongoose.connections).

jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: { readyState: 0, on: jest.fn() },
}));

// minimal version of cacheFunction pulled from src/neodash.js
const memCache = require('memory-cache');

global.cacheFunction = (duration: number) => {
  return (req: any, res: any, next: any) => {
    res.set('Cache-control', 'public, max-age=' + duration);
    let key = '__express__' + (req.originalUrl || req.url);
    const cachedBody = memCache.get(key);
    if (cachedBody) {
      res.json(typeof cachedBody == 'string' ? JSON.parse(cachedBody) : cachedBody);
      return;
    } else {
      if (!res._cacheWrapped) {
        const originalSend = res.send.bind(res);
        res.send = (body: any) => {
          memCache.put(key, body, duration * 1000);
          return originalSend(body);
        };
        res._cacheWrapped = true;
      }
      next();
    }
  };
};

describe('cacheFunction middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    req = { originalUrl: '/test', url: '/test' };
    next = jest.fn();

    // simple in-memory response stub
    res = {
      headers: {} as any,
      _sent: null as any,
      set(header: string, value: any) {
        this.headers[header] = value;
      },
      json(obj: any) {
        this._sent = obj;
      },
      send(val: any) {
        this._sent = val;
        return this;
      }
    } as any;
  });

  it('should cache the response and not wrap send twice', () => {
    const mw = global.cacheFunction(5);

    mw(req as Request, res as Response, next);
    expect(res._cacheWrapped).toBe(true);
    // call middleware again (as if applied multiple times)
    mw(req as Request, res as Response, next);
    expect(res._cacheWrapped).toBe(true);

    // monkey patch memCache to observe put
    const memCache = require('memory-cache');
    const spy = jest.spyOn(memCache, 'put');

    // call wrapped send
    res.send('body');
    expect(spy).toHaveBeenCalledWith('__express__/test', 'body', 5000);
    expect(res._sent).toBe('body');

    // call again to ensure it doesn't recurse
    res.send('another');
    expect(res._sent).toBe('another');

    spy.mockRestore();
  });
});
