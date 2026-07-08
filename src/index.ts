import { Router, Request, Response, NextFunction } from "express";
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
} from "./types.js";

export { UseMiddleware } from "./middleware.js";

function methodDecoratorFactory(method: Methods) {
  return function (path: string) {
    return function (fn: Handler, _context: ClassMethodDecoratorContext): void {
      const existing = routeMetadata.get(fn);
      if (existing) {
        routeMetadata.set(fn, {
          ...existing,
          path,
          method,
        });
      } else {
        routeMetadata.set(fn, {
          path,
          method,
          middlewares: [],
        });
      }
    };
  };
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

  if (Buffer.isBuffer(result)) {
    res.send(result);
    return;
  }

  if (isReadableStream(result)) {
    result.pipe(res);
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

  if (typeof result === "object" && result !== null && "__status" in result) {
    const { __status, ...data } = result as { __status: number };
    res.status(__status).json(data);
    return;
  }

  res.json(result);
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
