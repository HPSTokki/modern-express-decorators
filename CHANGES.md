# Changelog

## v1.2.2 → current

### Expanded `sendResult` type coverage

**Problem:** `sendResult` only handled `undefined`, `null`, `Buffer`, `ReadableStream`, `string`, `{ __status }` objects, and plain objects. Missing types like `Uint8Array`, `Blob`, `Error`, `BigInt`, `Map`/`Set`, async iterables, Web `Response`, etc. would either fall through to `res.json` (risking serialization errors) or go unhandled.

**Change:** Added explicit handling for all missing edge cases in `src/index.ts:sendResult`:

- `Error` → 500 response with `.message`
- `Uint8Array` → sent as `Buffer`
- `ArrayBuffer` → sent as `Buffer`
- `Blob` → converted via `arrayBuffer()` then sent
- Async iterables → collected and concatenated as `Buffer`
- Web `Response` → status + content-type + body forwarded
- `URL` → `.toString()` sent as string
- `BigInt` → `.toString()` sent as string
- `Map` → converted to object via `Object.fromEntries`
- `Set` → converted to array via `Array.from`

Also removed a dead duplicate `__status` check and fixed an `import type` conflict with the global Web `Response` constructor.

### Vitest test suite

Added 33 tests using Vitest 3 + supertest covering all HTTP method decorators, `sendResult` edge cases, middleware chains, error middleware, path normalization, and standalone routers. Run with `npm test`.

**Note:** Pinned to vitest 3.x — vitest 4+ uses oxc which doesn't support TC39 Stage 3 decorators yet.

### TypeScript version

Locked to `^6.0.3` (stable). The setup is verified clean on TS 6 and designed to work with TS 7+ when upgrading (just update the version — no config changes needed).

---

## v1.2.1

### Restructured source into single-file bundle

**Problem:** Three separate TS source files (`index.ts`, `types.ts`, `middleware.ts`) compiled to three separate JS files in `dist/`, plus separate declaration files.

**Change:** Replaced `tsc` with `tsup` as the build tool. It bundles all source into a single `dist/index.js` (6.8 KB ESM) while keeping the TS source files organized separately.

- Installed `tsup` as a dev dependency
- Updated build script from `tsc` to `tsup src/index.ts --format esm --clean`
- DTS generated separately via `tsc --emitDeclarationOnly --outDir dist` (avoids tsup's internal DTS worker which had compatibility issues)

**`dist/` output:**
```
index.js          ← single bundled ESM file (all source inlined)
index.d.ts        ← declarations
middleware.d.ts
types.d.ts
*.d.ts.map        ← declaration source maps
```

### Removed `ignoreDeprecations` workaround

**Problem:** The original tsconfig had `"ignoreDeprecations": "6.0"` to suppress a TS 6 deprecation warning about `baseUrl`. This was a bandaid — no `baseUrl` existed in the project's tsconfig; the warning came from tsup's internal DTS worker.

**Change:** Removed `ignoreDeprecations` and split the build to avoid the tsup DTS worker entirely. The project now uses standard `tsc --emitDeclarationOnly` for declarations, which has no `baseUrl` deprecation issue.

### Paths use `./` prefix (no `baseUrl` / `paths`)

All internal imports already use `./` relative prefixes (`./types.js`, `./middleware.js`). No `baseUrl` or `paths` in tsconfig. This is forward-compatible with TS 7, which removes `baseUrl`.

### Excluded `src/test` from declarations

Added `"src/test"` to tsconfig `exclude` to prevent test files from generating `.d.ts` files in `dist/`.
