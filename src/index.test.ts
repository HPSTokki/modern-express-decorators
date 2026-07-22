import { describe, it, expect, beforeAll } from "vitest";
import express, { type Request, type Response, type NextFunction } from "express";
import request from "supertest";
import { Readable } from "stream";

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  UseMiddleware,
  registerController,
  createControllerRouter,
} from "./index.js";

let app: express.Express;

@Controller("/api")
class ApiController {
  @Get("/hello")
  hello(_req: Request, res: Response) {
    res.json({ message: "Hello!" });
  }

  @Get("/return-value")
  returnValue() {
    return { foo: "bar" };
  }

  @Get("/return-undefined")
  returnUndefined() {}

  @Get("/return-null")
  returnNull() {
    return null;
  }

  @Post("/echo")
  echo(req: Request) {
    return req.body;
  }

  @Put("/put-test")
  putTest(req: Request) {
    return { method: "PUT", body: req.body };
  }

  @Patch("/patch-test")
  patchTest(req: Request) {
    return { method: "PATCH", body: req.body };
  }

  @Delete("/delete-test/:id")
  deleteTest(req: Request) {
    return { deleted: req.params.id };
  }

  @Get("/error-instance")
  returnError() {
    return new Error("oops");
  }

  @Get("/throw-error")
  throwError() {
    throw new Error("handler crashed");
  }

  @Get("/buffer")
  returnBuffer() {
    return Buffer.from("hello buffer");
  }

  @Get("/uint8array")
  returnUint8Array() {
    return new Uint8Array([72, 73]);
  }

  @Get("/arraybuffer")
  returnArrayBuffer() {
    const buf = new Uint8Array([65, 66, 67]);
    return buf.buffer as ArrayBuffer;
  }

  @Get("/string")
  returnString() {
    return "plain string";
  }

  @Get("/status-object")
  returnStatusObject() {
    return { __status: 201, message: "created" };
  }

  @Get("/url")
  returnURL() {
    return new URL("https://example.com/path");
  }

  @Get("/bigint")
  returnBigInt() {
    return BigInt(42);
  }

  @Get("/map")
  returnMap() {
    const map = new Map<string, string>([["a", "1"], ["b", "2"]]);
    return map;
  }

  @Get("/set")
  returnSet() {
    const set = new Set([1, 2, 3]);
    return set;
  }

  @Get("/readable-stream")
  returnReadableStream() {
    const stream = new Readable({
      read() {
        this.push("chunk1");
        this.push("chunk2");
        this.push(null);
      },
    });
    return stream;
  }

  @Get("/async-iterable")
  returnAsyncIterable() {
    return {
      [Symbol.asyncIterator]: async function* () {
        yield "async";
        yield "iterable";
      },
    };
  }

  @Get("/web-response")
  returnWebResponse() {
    return new Response('{"web":"response"}', {
      status: 202,
      headers: { "content-type": "application/json" },
    });
  }

  @Get("/blob")
  returnBlob() {
    return new Blob(["blob-content"], { type: "text/plain" });
  }

  @Get("/headers-sent")
  headersSent(_req: Request, res: Response) {
    res.json({ already: "sent" });
    return { should: "not-be-used" };
  }
}

@Controller("")
class NoPrefixController {
  @Get("/no-prefix")
  noPrefix() {
    return { ok: true };
  }
}

@Controller("/middleware")
class MiddlewareController {
  static methodMiddlewareLog: string[] = [];

  @UseMiddleware((_req: Request, _res: Response, next: NextFunction) => {
    MiddlewareController.methodMiddlewareLog.push("method-middleware");
    next();
  })
  @Get("/method")
  methodMiddleware() {
    return { from: "method" };
  }

  @UseMiddleware(
    (_req: Request, _res: Response, next: NextFunction) => {
      MiddlewareController.methodMiddlewareLog.push("multi-a");
      next();
    },
    (_req: Request, _res: Response, next: NextFunction) => {
      MiddlewareController.methodMiddlewareLog.push("multi-b");
      next();
    },
  )
  @Get("/multi")
  multiMiddleware() {
    return { from: "multi" };
  }

  @UseMiddleware((_req: Request, _res: Response, next: NextFunction) => {
    next(new Error("middleware error"));
  })
  @Get("/error-middleware")
  errorMiddlewareRoute() {
    return { should: "not-reach" };
  }

  static errorMiddlewareHandled: boolean = false;

  @UseMiddleware(
    (_req: Request, _res: Response, next: NextFunction) => {
      next(new Error("triggered"));
    },
    ((err: any, _req: Request, _res: Response, next: NextFunction) => {
      MiddlewareController.errorMiddlewareHandled = true;
      next(err);
    }) as any,
  )
  @Get("/error-handler")
  errorHandlerRoute() {
    return { should: "not-reach" };
  }
}

@Controller("/controller-middleware")
@UseMiddleware((_req: Request, _res: Response, next: NextFunction) => {
  ControllerMiddlewareController.controllerLog.push("controller-middleware");
  next();
})
class ControllerMiddlewareController {
  static controllerLog: string[] = [];

  @Get("/test")
  test() {
    return { ok: true };
  }

  @Get("/other")
  other() {
    return { ok: "also" };
  }
}

beforeAll(() => {
  app = express();
  app.use(express.json());

  registerController(app, ApiController);
  registerController(app, NoPrefixController);
  registerController(app, MiddlewareController);
  registerController(app, ControllerMiddlewareController);
});

describe("HTTP method decorators", () => {
  it("GET /api/hello returns JSON", async () => {
    const res = await request(app).get("/api/hello");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Hello!" });
  });

  it("POST /api/echo echoes body", async () => {
    const res = await request(app).post("/api/echo").send({ x: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ x: 1 });
  });

  it("PUT /api/put-test works", async () => {
    const res = await request(app).put("/api/put-test").send({ y: 2 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ method: "PUT", body: { y: 2 } });
  });

  it("PATCH /api/patch-test works", async () => {
    const res = await request(app).patch("/api/patch-test").send({ z: 3 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ method: "PATCH", body: { z: 3 } });
  });

  it("DELETE /api/delete-test/:id works", async () => {
    const res = await request(app).delete("/api/delete-test/42");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: "42" });
  });

  it("GET /no-prefix works with empty base path", async () => {
    const res = await request(app).get("/no-prefix");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe("sendResult edge cases", () => {
  it("204 for undefined", async () => {
    const res = await request(app).get("/api/return-undefined");
    expect(res.status).toBe(204);
  });

  it("200 with null body for null", async () => {
    const res = await request(app).get("/api/return-null");
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it("500 for returned Error instance", async () => {
    const res = await request(app).get("/api/error-instance");
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "oops");
  });

  it("500 for thrown Error", async () => {
    const res = await request(app).get("/api/throw-error");
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "handler crashed");
  });

  it("sends Buffer", async () => {
    const res = await request(app).get("/api/buffer");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(Buffer.from("hello buffer"));
  });

  it("sends Uint8Array", async () => {
    const res = await request(app).get("/api/uint8array");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(Buffer.from("HI"));
  });

  it("sends ArrayBuffer", async () => {
    const res = await request(app).get("/api/arraybuffer");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(Buffer.from("ABC"));
  });

  it("sends string", async () => {
    const res = await request(app).get("/api/string");
    expect(res.status).toBe(200);
    expect(res.text).toBe("plain string");
  });

  it("respects __status in returned object", async () => {
    const res = await request(app).get("/api/status-object");
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "created" });
  });

  it("sends URL as string", async () => {
    const res = await request(app).get("/api/url");
    expect(res.status).toBe(200);
    expect(res.text).toBe("https://example.com/path");
  });

  it("sends BigInt as string", async () => {
    const res = await request(app).get("/api/bigint");
    expect(res.status).toBe(200);
    expect(res.text).toBe("42");
  });

  it("sends Map as object", async () => {
    const res = await request(app).get("/api/map");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ a: "1", b: "2" });
  });

  it("sends Set as array", async () => {
    const res = await request(app).get("/api/set");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([1, 2, 3]);
  });

  it("sends ReadableStream", async () => {
    const res = await request(app).get("/api/readable-stream");
    expect(res.status).toBe(200);
    expect(res.text).toBe("chunk1chunk2");
  });

  it("sends async iterable", async () => {
    const res = await request(app).get("/api/async-iterable");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(Buffer.from("asynciterable"));
  });

  it("sends Web Response", async () => {
    const res = await request(app).get("/api/web-response");
    expect(res.status).toBe(202);
    expect(res.body).toEqual({ web: "response" });
  });

  it("sends Blob", async () => {
    const res = await request(app).get("/api/blob");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(Buffer.from("blob-content"));
  });

  it("uses already-sent response and ignores return value", async () => {
    const res = await request(app).get("/api/headers-sent");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ already: "sent" });
  });
});

describe("middleware", () => {
  beforeEach(() => {
    MiddlewareController.methodMiddlewareLog = [];
    MiddlewareController.errorMiddlewareHandled = false;
    ControllerMiddlewareController.controllerLog = [];
  });

  it("runs method-level middleware", async () => {
    const res = await request(app).get("/middleware/method");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ from: "method" });
    expect(MiddlewareController.methodMiddlewareLog).toContain("method-middleware");
  });

  it("runs multiple middlewares in order", async () => {
    const res = await request(app).get("/middleware/multi");
    expect(res.status).toBe(200);
    expect(MiddlewareController.methodMiddlewareLog).toEqual(["multi-a", "multi-b"]);
  });

  it("forwards error from middleware", async () => {
    const res = await request(app).get("/middleware/error-middleware");
    expect(res.status).toBe(500);
  });

  it("routes through 4-arg error middleware", async () => {
    MiddlewareController.errorMiddlewareHandled = false;
    const res = await request(app).get("/middleware/error-handler");
    expect(res.status).toBe(500);
    expect(MiddlewareController.errorMiddlewareHandled).toBe(true);
  });

  it("runs controller-level middleware", async () => {
    const res1 = await request(app).get("/controller-middleware/test");
    expect(res1.status).toBe(200);
    expect(res1.body).toEqual({ ok: true });

    const res2 = await request(app).get("/controller-middleware/other");
    expect(res2.status).toBe(200);
    expect(res2.body).toEqual({ ok: "also" });

    expect(ControllerMiddlewareController.controllerLog).toEqual([
      "controller-middleware",
      "controller-middleware",
    ]);
  });
});

describe("createControllerRouter", () => {
  it("creates a standalone router", async () => {
    const routerApp = express();
    @Controller("/standalone")
    class StandaloneController {
      @Get("/ping")
      ping() {
        return { pong: true };
      }
    }
    const router = createControllerRouter(StandaloneController);
    routerApp.use(router);

    const res = await request(routerApp).get("/standalone/ping");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ pong: true });
  });
});

describe("path normalization", () => {
  it("handles controller with trailing slash", async () => {
    @Controller("/trail/")
    class TrailingController {
      @Get("/path")
      trail() {
        return { ok: true };
      }
    }
    const routerApp = express();
    const router = createControllerRouter(TrailingController);
    routerApp.use(router);

    const res = await request(routerApp).get("/trail/path");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("handles route without leading slash", async () => {
    @Controller("/noslash")
    class NoSlashController {
      @Get("route")
      noSlash() {
        return { ok: true };
      }
    }
    const routerApp = express();
    const router = createControllerRouter(NoSlashController);
    routerApp.use(router);

    const res = await request(routerApp).get("/noslash/route");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe("plain object fallback", () => {
  it("serializes plain objects via res.json", async () => {
    @Controller("/fallback")
    class FallbackController {
      @Get("/obj")
      obj() {
        return { a: 1, b: [2, 3] };
      }
    }
    const routerApp = express();
    const router = createControllerRouter(FallbackController);
    routerApp.use(router);

    const res = await request(routerApp).get("/fallback/obj");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ a: 1, b: [2, 3] });
  });
});

describe("validation", () => {
  describe("custom validate function", () => {
    @Controller("/validate/fn")
    class FnValidationController {
      @Post("/body", {
        body: (data: unknown) => {
          if (typeof data !== "object" || data === null) throw new Error("Body must be an object");
          if (!("name" in (data as Record<string, unknown>))) throw new Error("name is required");
          return data;
        },
      })
      bodyValid(req: Request) {
        return { received: req.body };
      }

      @Post("/body-fail", {
        body: () => { throw new Error("always fails"); },
      })
      bodyFail() {
        return { should: "not-reach" };
      }

      @Get("/query", {
        query: (data: unknown) => {
          const q = data as Record<string, unknown>;
          if (typeof q.page !== "string") throw new Error("page is required");
          return { ...q, page: parseInt(q.page, 10) };
        },
      })
      queryValid(req: Request) {
        return { page: (req as any).validatedQuery.page };
      }

      @Get("/query-fail", {
        query: () => { throw new Error("query failed"); },
      })
      queryFail() {
        return { should: "not-reach" };
      }

      @Get("/params/:id", {
        params: (data: unknown) => {
          const p = data as Record<string, unknown>;
          if (!p.id) throw new Error("id param required");
          return p;
        },
      })
      paramsValid(req: Request) {
        return { id: (req as any).validatedParams.id };
      }
    }

    const fnApp = (() => {
      const a = express();
      a.use(express.json());
      registerController(a, FnValidationController);
      return a;
    })();

    it("passes validated body", async () => {
      const res = await request(fnApp).post("/validate/fn/body").send({ name: "Alice" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ received: { name: "Alice" } });
    });

    it("returns 400 when body validation fails", async () => {
      const res = await request(fnApp).post("/validate/fn/body-fail").send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Validation failed");
    });

    it("passes validated query", async () => {
      const res = await request(fnApp).get("/validate/fn/query?page=5");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ page: 5 });
    });

    it("returns 400 when query validation fails", async () => {
      const res = await request(fnApp).get("/validate/fn/query-fail");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Validation failed");
    });

    it("passes validated params", async () => {
      const res = await request(fnApp).get("/validate/fn/params/42");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: "42" });
    });
  });

  describe("Zod-compatible schema (object with .parse)", () => {
    const schema = {
      parse: (data: unknown) => {
        if (typeof data !== "object" || data === null) throw new Error("not an object");
        const d = data as Record<string, string>;
        if (!d.name) throw new Error("name required");
        return { ...d, name: d.name.toUpperCase() };
      },
    };

    @Controller("/validate/schema")
    class SchemaValidationController {
      @Post("/body", { body: schema })
      bodyValid(req: Request) {
        return { name: req.body.name };
      }

      @Post("/fail", { body: schema })
      bodyFail() {
        return { should: "not-reach" };
      }
    }

    const sApp = (() => {
      const a = express();
      a.use(express.json());
      registerController(a, SchemaValidationController);
      return a;
    })();

    it("transforms and passes validated data", async () => {
      const res = await request(sApp).post("/validate/schema/body").send({ name: "alice" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ name: "ALICE" });
    });

    it("returns 400 when schema.parse throws", async () => {
      const res = await request(sApp).post("/validate/schema/fail").send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Validation failed");
    });
  });

  describe("ZodError-like detection (object with .issues)", () => {
    const zodLikeError = Object.assign(new Error("zod error"), {
      issues: [
        { path: ["name"], message: "Required", code: "invalid_type" },
      ],
    });

    @Controller("/validate/zod")
    class ZodLikeController {
      @Post("/fail", {
        body: () => { throw zodLikeError; },
      })
      fail() {
        return { should: "not-reach" };
      }
    }

    const zApp = (() => {
      const a = express();
      a.use(express.json());
      registerController(a, ZodLikeController);
      return a;
    })();

    it("includes .issues in 400 response for Zod-like errors", async () => {
      const res = await request(zApp).post("/validate/zod/fail").send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Validation failed");
      expect(res.body).toHaveProperty("issues");
      expect(res.body.issues).toEqual([
        { path: ["name"], message: "Required", code: "invalid_type" },
      ]);
    });
  });

  describe("bare schema (without { body: ... } wrapper)", () => {
    const bareSchema = {
      parse: (data: unknown) => {
        if (typeof data !== "object" || data === null) throw new Error("not object");
        const d = data as Record<string, unknown>;
        if (!d.name) throw new Error("name required");
        return { ...d, name: String(d.name).toUpperCase() };
      },
    };
    const bareFn = (data: unknown) => {
      if (typeof data !== "object" || data === null) throw new Error("not object");
      return data;
    };

    @Controller("/validate/bare")
    class BareValidationController {
      @Post("/schema", bareSchema)
      bareSchema(req: Request) {
        return { name: req.body.name };
      }

      @Post("/schema-fail", bareSchema)
      bareSchemaFail() {
        return { should: "not-reach" };
      }

      @Post("/fn", bareFn)
      bareFn(req: Request) {
        return { received: req.body };
      }

      @Post("/fn-fail", bareFn)
      bareFnFail() {
        return { should: "not-reach" };
      }
    }

    const bApp = (() => {
      const a = express();
      a.use(express.json());
      registerController(a, BareValidationController);
      return a;
    })();

    it("passes a bare ValidationSchema as body validator", async () => {
      const res = await request(bApp).post("/validate/bare/schema").send({ name: "alice" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ name: "ALICE" });
    });

    it("rejects when bare schema validation fails", async () => {
      const res = await request(bApp).post("/validate/bare/schema-fail").send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Validation failed");
    });

    it("passes a bare function as body validator", async () => {
      const res = await request(bApp).post("/validate/bare/fn").send({ x: 1 });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ received: { x: 1 } });
    });

    it("rejects when bare function validation fails", async () => {
      const res = await request(bApp).post("/validate/bare/fn-fail").send("oops");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Validation failed");
    });
  });
});
