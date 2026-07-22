import { Router, Request, type Response, NextFunction } from "express";
import {
  Handler,
  Methods,
  routeMetadata,
  controllerMetadata,
  ControllerClass,
  Constructor,
  Middleware,
  ErrorMiddleware,
  AnyMiddleware,
  type RouteOptions,
  type ValidationSchema,
} from "./types.js";

export type {
  Handler,
  Methods,
  routeMetadata,
  controllerMetadata,
  ControllerClass,
  Constructor,
  Middleware,
  ErrorMiddleware,
  AnyMiddleware,
  RouteOptions,
  ValidationSchema,
} from "./types.js";

export { UseMiddleware } from "./middleware.js";

type RouteArg = RouteOptions | ValidationSchema | ((data: unknown) => unknown);

function methodDecoratorFactory(method: Methods) {
  return function (path: string, arg?: RouteArg) {
    return function (fn: Handler, _context: ClassMethodDecoratorContext): void {
      const options = normalizeArg(arg);
      const existing = routeMetadata.get(fn);
      if (existing) {
        routeMetadata.set(fn, {
          ...existing,
          path,
          method,
          ...(options ? { options } : {}),
        });
      } else {
        routeMetadata.set(fn, {
          path,
          method,
          middlewares: [],
          ...(options ? { options } : {}),
        });
      }
    };
  };
}

function normalizeArg(arg?: RouteArg): RouteOptions | undefined {
  if (!arg) return undefined;
  if (typeof arg === "function") return { body: arg };
  if ("parse" in arg) return { body: arg as ValidationSchema };
  return arg as RouteOptions;
}

export const Get = methodDecoratorFactory("get");
export const Post = methodDecoratorFactory("post");
export const Put = methodDecoratorFactory("put");
export const Patch = methodDecoratorFactory("patch");
export const Delete = methodDecoratorFactory("delete");

export function Controller(basePath: string) {
  return function <T extends Constructor>(
    target: T,
    _context: ClassDecoratorContext,
  ): T {
    const existing = controllerMetadata.get(target);
    if (existing) {
      controllerMetadata.set(target, {
        ...existing,
        basePath,
      });
    } else {
      controllerMetadata.set(target, { basePath, middlewares: [] });
    }
    return target;
  };
}

export function registerController(
  router: Router,
  ControllerClass: ControllerClass,
) {
  const instance = new ControllerClass();

  const controllerMeta = controllerMetadata.get(ControllerClass);
  const basePath = controllerMeta?.basePath ?? "";
  const controllerMiddlewares = controllerMeta?.middlewares ?? [];

  const prototype = Object.getPrototypeOf(instance);
  const methodNames = Object.getOwnPropertyNames(prototype).filter(
    (name) =>
      name !== "constructor" &&
      typeof instance[name as keyof typeof instance] === "function",
  );

  methodNames.forEach((name) => {
    const method = instance[name as keyof typeof instance] as Handler;
    const route = routeMetadata.get(method);

    if (route) {
      const fullPath = normalizePath(basePath, route.path);

      const middlewares = [...controllerMiddlewares, ...route.middlewares];

      const handler = async (
        req: Request,
        res: Response,
        next: NextFunction,
      ) => {
        try {
          if (route.options) {
            const validationError = runValidation(req, route.options);
            if (validationError) {
              return res.status(400).json(validationError);
            }
          }
          const result = await method.call(instance, req, res, next);
          await sendResult(res, result);
        } catch (error) {
          if (!res.headersSent) {
            console.error(`❌ Error in ${req.path}:`, error);
            return res.status(500).json({
              error:
                error instanceof Error
                  ? error.message
                  : "Internal server error",
            });
          } else {
            next(error);
          }
        }
      };

      const routeHandler = buildMiddlewareChain(middlewares, handler);

      switch (route.method) {
        case "get":
          router.get(fullPath, routeHandler);
          break;
        case "post":
          router.post(fullPath, routeHandler);
          break;
        case "put":
          router.put(fullPath, routeHandler);
          break;
        case "patch":
          router.patch(fullPath, routeHandler);
          break;
        case "delete":
          router.delete(fullPath, routeHandler);
          break;
      }
    }
  });
}

export function createControllerRouter(
  ControllerClass: ControllerClass,
): Router {
  const router = Router();
  registerController(router, ControllerClass);
  return router;
}

function buildMiddlewareChain(
  middlewares: AnyMiddleware[],
  finalHandler: Handler,
): Handler {
  return async (req: Request, res: Response, next: NextFunction) => {
    let index = 0;
    const nextMiddleware = async (err?: any) => {
      if (err) {
        if (index < middlewares.length) {
          const middleware = middlewares[index];
          index++;
          try {
            if (middleware && isErrorHandler(middleware)) {
              await (middleware as ErrorMiddleware)(
                err,
                req,
                res,
                nextMiddleware,
              );
            } else {
              nextMiddleware(err);
            }
          } catch (error) {
            nextMiddleware(error);
          }
        } else {
          next(err);
        }
        return;
      }
      if (index >= middlewares.length) {
        try {
          await finalHandler(req, res, next);
        } catch (error) {
          nextMiddleware(error);
        }
        return;
      }

      const middleware = middlewares[index];
      index++;
      try {
        if (middleware) {
          if (isErrorHandler(middleware)) {
            nextMiddleware();
          } else {
            await (middleware as Middleware)(req, res, nextMiddleware);
          }
        } else {
          nextMiddleware();
        }
      } catch (error) {
        nextMiddleware(error);
      }
    };
    nextMiddleware();
  };
}

function isErrorHandler(middleware: AnyMiddleware): boolean {
  return middleware.length === 4;
}

function normalizePath(basePath: string, routePath: string): string {
  const normalizedBase = basePath.replace(/\/$/, "");
  const normalizedRoute = routePath.startsWith("/")
    ? routePath
    : `/${routePath}`;
  if (normalizedBase === "") {
    return normalizedRoute;
  }
  return `${normalizedBase}${normalizedRoute}`;
}

async function sendResult(res: Response, result: unknown): Promise<void> {
  if (res.headersSent) return;

  if (result === undefined) {
    res.status(204).send();
    return;
  }

  if (result === null) {
    res.json(null);
    return;
  }

  if (result instanceof Error) {
    console.error(`Error in handler:`, result);
    res.status(500).json({
      error: result.message || "Internal server error",
    });
    return;
  }

  if (Buffer.isBuffer(result)) {
    res.send(result);
    return;
  }

  if (result instanceof Uint8Array) {
    res.send(Buffer.from(result));
    return;
  }

  if (result instanceof ArrayBuffer) {
    res.send(Buffer.from(result));
    return;
  }

  if (typeof Blob !== "undefined" && result instanceof Blob) {
    const buffer = Buffer.from(await result.arrayBuffer());
    res.send(buffer);
    return;
  }

  if (isReadableStream(result)) {
    result.pipe(res);
    return;
  }

  if (isAsyncIterable(result)) {
    const chunks: Buffer[] = [];
    for await (const chunk of result) {
      chunks.push(
        typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk),
      );
    }
    res.send(Buffer.concat(chunks));
    return;
  }

  if (typeof Response !== "undefined" && result instanceof Response) {
    const body = await result.text();
    res
      .status(result.status)
      .type(result.headers.get("content-type") ?? "text/plain")
      .send(body);
    return;
  }

  if (typeof result === "string") {
    res.send(result);
    return;
  }

  if (isStatusResult(result)) {
    const { __status, ...data } = result;
    res.status(__status).json(data);
    return;
  }

  if (result instanceof URL) {
    res.send(result.toString());
    return;
  }

  if (typeof result === "bigint") {
    res.send(result.toString());
    return;
  }

  if (result instanceof Map) {
    res.json(Object.fromEntries(result));
    return;
  }

  if (result instanceof Set) {
    res.json(Array.from(result));
    return;
  }

  res.json(result);
}

function runValidation(
  req: Request,
  options: RouteOptions,
): Record<string, unknown> | undefined {
  try {
    if (options.body) {
      req.body = validateValue(req.body, options.body);
    }
    if (options.query) {
      (req as any).validatedQuery = validateValue(req.query, options.query);
    }
    if (options.params) {
      (req as any).validatedParams = validateValue(req.params, options.params);
    }
  } catch (err: unknown) {
    if (err && typeof err === "object" && "issues" in err) {
      return { error: "Validation failed", issues: (err as any).issues };
    }
    return {
      error: "Validation failed",
      details: err instanceof Error ? err.message : String(err),
    };
  }
}

function validateValue(
  data: unknown,
  schema: ValidationSchema | ((data: unknown) => unknown),
): unknown {
  if (typeof schema === "function") {
    return schema(data);
  }
  return schema.parse(data);
}

function isStatusResult(
  value: unknown,
): value is { __status: number } & Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "__status" in value &&
    typeof (value as { __status: unknown }).__status === "number"
  );
}

function isReadableStream(value: unknown): value is NodeJS.ReadableStream {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { pipe?: unknown }).pipe === "function"
  );
}

function isAsyncIterable(
  value: unknown,
): value is AsyncIterable<string | Uint8Array> {
  return (
    typeof value === "object" &&
    value !== null &&
    Symbol.asyncIterator in value
  );
}
