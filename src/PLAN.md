# PLAN — modern-express-decorators

## Current State

A minimal but functional decorator-based Express 5 router library. Three source files (~370 LOC total), published as an ESM-only npm package.

### Core Architecture

```
@Controller("/path")      → stores basePath + middlewares in controllerMetadata (Map<Constructor, ...>)
@Get("/"), @Post("/")...  → stores path + method + middlewares in routeMetadata (Map<Handler, ...>)
@UseMiddleware(...)       → appends middleware(s) to either routeMetadata or controllerMetadata

registerController(router, Class)
  → reads metadata maps
  → chains controller-level + route-level middlewares
  → registers handler on the Express Router
```

### Metadata Maps (src/types.ts)

- `routeMetadata: Map<Handler, { path, method, middlewares }>`
- `controllerMetadata: Map<Constructor, { basePath, middlewares }>`

### Key Design Decisions

- Uses **TC39 Stage 3 decorators** (`experimentalDecorators: false`) — no legacy `@Reflect.metadata`
- **ESM-only** (`"type": "module"`, node module resolution)
- Middlewares are chained via `buildMiddlewareChain` (recursive `nextMiddleware` pattern)
- Response is automatically sent via `sendResult()` unless `res.headersSent` is already true
- **No dependency injection** — controllers are `new`'d internally with no constructor args
- **No validation/DTO layer** yet
- **No OpenAPI generation** yet

## Roadmap / Planned Features

From README and code gaps:

1. **DTO / Validation Schema on decorators**  
   - e.g. `@Post("/", { schema: z.object({...}) })` with Zod or similar  
   - Auto-validate `req.body` / `req.query` / `req.params` before handler runs

2. **Middleware Improvements**  
   - `@UseMiddleware` works but needs more ergonomic patterns for middleware reuse  
   - Consider supporting middleware at the `@Controller` level (already partially done)

3. **Performance**  
   - Metadata lookups happen once at registration (fine), but `buildMiddlewareChain` creates a new closure per handler — could be optimized

4. **OpenAPI / Swagger documentation**  
   - Automatically generate OpenAPI spec from decorator metadata  
   - Needs path, method, response shape, and parameter info on each decorator

5. **Testing**  
   - Vitest 3.x test suite in `src/index.test.ts` using supertest  
   - 33 tests covering all HTTP methods, sendResult edge cases, middleware, path normalization, and standalone routers  
   - Run with `npm test` (vitest run)  
   - **Note:** vitest 4+ (oxc) does not support TC39 Stage 3 decorators — must use vitest 3.x (esbuild) for now

## Known Issues / Edge Cases

- `@UseMiddleware` on a method without a route decorator will register with empty path + "get" (fallback behavior)
- Controllers cannot receive constructor arguments (pure DI not supported)
- No support for `app.route()` chaining or regex paths
- Error middleware detection relies on `fn.length === 4` (standard but brittle if defaults are used)
- **`sendResult` now handles all common types:** `undefined` (204), `null`, `Error` (500), `Buffer`, `Uint8Array`, `ArrayBuffer`, `Blob`, `ReadableStream`, async iterables, Web `Response`, `string`, `{ __status }` objects, `URL`, `BigInt`, `Map`, `Set`, and plain objects (fallback `res.json`).

## Development

```bash
npm run build    # tsc → outputs to dist/
npm test         # (not configured — run tsx src/test/test-runner.ts manually)
```

### Working Notes for AI

- **Always run `tsc --noEmit`** after changes to check types before committing  
- `dist/` is gitignored but published to npm — verify build before release  
- Keep `experimentalDecorators: false` — do not reintroduce legacy decorators  
- All imports use `.js` extensions (ESM convention)  
- When adding a new decorator, update both `src/index.ts` exports and `details.md`
