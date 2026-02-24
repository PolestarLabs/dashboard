declare module "elysia" {
  // minimal ambient declarations to satisfy the compiler
  export class Elysia {
    [x: string]: any;
    constructor(opts?: any);
    use(plugin: any): this;
    get(path: string, handler: any, opts?: any): this;
    post(path: string, handler: any, opts?: any): this;
    listen(opts: any, cb?: any): any;
  }
  // allow default import syntax as seen throughout the codebase
  export default Elysia;

  export const t: any;
}

declare module "@elysiajs/cors" { const cors: any; export { cors }; }
declare module "@elysiajs/swagger" { const swagger: any; export { swagger }; }
declare module "@elysiajs/server-timing" { const serverTiming: any; export { serverTiming }; }