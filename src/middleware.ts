import {
  AnyMiddleware,
  routeMetadata,
  Handler,
  Constructor,
  controllerMetadata,
} from "./types.js";

export function UseMiddleware(...middlewares: AnyMiddleware[]) {
  return function (
    target: any,
    context: ClassMethodDecoratorContext | ClassDecoratorContext,
  ): void {
    if (context.kind === "method") {
      const fn = target as Handler;
      const existing = routeMetadata.get(fn);

      if (existing) {
        routeMetadata.set(fn, {
          ...existing,
          middlewares: [...existing.middlewares, ...middlewares],
        });
      } else {
        routeMetadata.set(fn, {
          path: "",
          method: "get",
          middlewares: [...middlewares],
        });
      }
    } else if (context.kind === "class") {
      const constructor = target as Constructor;
      const existing = controllerMetadata.get(constructor);
      if (existing) {
        controllerMetadata.set(constructor, {
          ...existing,
          middlewares: [...existing.middlewares, ...middlewares],
        });
      } else {
        controllerMetadata.set(constructor, {
          basePath: "",
          middlewares: [...middlewares],
        });
      }
    }
  };
}
