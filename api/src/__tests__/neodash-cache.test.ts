import { Request, Response, NextFunction } from 'express';

// require neodash to populate global.cacheFunction
require('../../../neodash');

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
