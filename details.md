# modern-express-decorators

**Version:** 1.2.1  
**License:** MIT  
**Author:** Amechi  

A lightweight TypeScript library that provides class-based decorators for Express.js route definition. Uses modern TC39 Stage 3 decorators (no `experimentalDecorators` needed). Built for Express 5.

## Why?

Standard Express apps scatter route definitions across files and require repetitive boilerplate. This library lets you group related routes into controller classes using decorators like `@Get`, `@Post`, `@Controller`, and `@UseMiddleware`.

## Features

- **Class-based controllers** — group routes under a `@Controller("/prefix")`
- **HTTP method decorators** — `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`
- **Request validation** — validate `body`, `query`, and `params` via Zod-compatible schemas or custom functions (zero extra deps required)
- **Middleware support** — attach middleswares at the method or controller level via `@UseMiddleware`
- **Error handling** — built-in async error catching, supports 4-arg error middleswares
- **Auto-response handling** — returns 204 for `undefined`, pipes streams, respects `__status` for custom status codes
- **Zero experimental flags** — uses native TC39 decorators (`experimentalDecorators: false`)
- **ESM only** — `"type": "module"` in package.json

## Usage

```ts
import { Router } from "express";
import { Controller, Get, Post, registerController } from "modern-express-decorators";

@Controller("/users")
export class UserController {
  @Get("/")
  list(req, res) {
    res.json([{ id: 1, name: "Alice" }]);
  }

  @Post("/")
  async create(req, res) {
    return { __status: 201, id: 2, name: req.body.name };
  }
}

// In your app setup
const router = Router();
registerController(router, UserController);
app.use("/api", router);
```

### Validation

Pass a validator as the second argument to any HTTP method decorator. Three styles are supported:

**1. Options object** — validates `body`, `query`, and/or `params` independently:

```ts
import { z } from "zod";
import { Post } from "modern-express-decorators";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

@Post("/users", { body: createUserSchema })
createUser(req) {
  // req.body is validated & typed by Zod
  return { ok: true, user: req.body };
}
```

**2. Bare Zod-compatible schema** — pass a schema object directly (auto-detects body validation):

```ts
const createUserSchema = z.object({ name: z.string() });

@Post("/users", createUserSchema)
createUser(req) {
  // req.body is validated
}
```

**3. Bare function** — pass a custom validate function directly:

```ts
@Post("/users", (data) => {
  if (!data.name) throw new Error("name required");
  return data;
})
createUser(req) {
  // req.body is validated
}
```

For the options object style, you can validate `body`, `query`, and/or `params` independently. The validator can be:

- **A Zod-compatible schema** — any object with a `.parse()` method (Zod, ArkType, Valibot, etc.)
- **A custom function** — receives the raw value, returns transformed value or throws

```ts
// Custom function with query
@Get("/search", {
  query: (data) => {
    const q = data as Record<string, string | undefined>;
    if (!q.q) throw new Error("Search query 'q' is required");
    return { q: q.q.trim() };
  }
})
search(req) {
  // (req as any).validatedQuery.q is available
}
```

On validation failure, the route returns a **400** response with error details. If the thrown error has an `.issues` array (like `ZodError`), it's included in the response body.

## Source Structure

| File | Purpose |
|------|---------|
| `src/index.ts` | Core exports: decorators, `registerController`, `createControllerRouter`, response helpers, validation |
| `src/types.ts` | Type definitions and metadata maps (`routeMetadata`, `controllerMetadata`) |
| `src/middleware.ts` | `@UseMiddleware` decorator (method + class level) |

## Exports

- **Decorators:** `@Controller`, `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@UseMiddleware`
- **Functions:** `registerController`, `createControllerRouter`
- **Types:** `Handler`, `Methods`, `Middleware`, `ErrorMiddleware`, `AnyMiddleware`, `RouteOptions`, `ValidationSchema`, `routeMetadata`, `controllerMetadata`, `ControllerClass`, `Constructor`
