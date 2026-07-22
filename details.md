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

## Source Structure

| File | Purpose |
|------|---------|
| `src/index.ts` | Core exports: decorators, `registerController`, `createControllerRouter`, response helpers |
| `src/types.ts` | Type definitions and metadata maps (`routeMetadata`, `controllerMetadata`) |
| `src/middleware.ts` | `@UseMiddleware` decorator (method + class level) |
| `src/test/` | Manual test files for development |

## Exports

- **Decorators:** `@Controller`, `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@UseMiddleware`
- **Functions:** `registerController`, `createControllerRouter`
- **Types:** `Handler`, `Methods`, `Middleware`, `ErrorMiddleware`, `AnyMiddleware`, `routeMetadata`, `controllerMetadata`, `ControllerClass`, `Constructor`
