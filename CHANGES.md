# Changelog

## v1.2.1 → current

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

### TypeScript version

Locked to `^6.0.3` (stable). The setup is verified clean on TS 6 and designed to work with TS 7+ when upgrading (just update the version — no config changes needed).
