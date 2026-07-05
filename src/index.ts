import { Router, Request, Response, NextFunction } from "express";

type Methods = "get" | "post" | "put" | "delete" | "patch";
type Handler = (req: Request, res: Response, next: NextFunction) => unknown;
type Constructor<T = any> = new (...args: any[]) => T;
type ControllerClass = Constructor<Object>;

const routeMetadata = new Map<Handler, { path: string; method: Methods }>();
const controllerMetadata = new Map<Constructor, { basePath: string }>();

function methodDecoratorFactory(method: Methods) {
  return function (path: string) {
    return function (fn: Handler, _context: ClassMethodDecoratorContext): void {
      routeMetadata.set(fn, { path, method });
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
    controllerMetadata.set(target, { basePath });
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
            return;
          } else {
            next(error);
          }
        }
      };

      switch (route.method) {
        case "get":
          router.get(fullPath, handler);
          break;
        case "post":
          router.post(fullPath, handler);
          break;
        case "put":
          router.put(fullPath, handler);
          break;
        case "patch":
          router.patch(fullPath, handler);
          break;
        case "delete":
          router.delete(fullPath, handler);
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
