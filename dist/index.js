const routes = new Map();
function methodDecoratorFactory(method) {
    return function (path) {
        return function (fn, _context) {
            routes.set(fn, { path, method });
        };
    };
}
export const Get = methodDecoratorFactory("get");
export const Post = methodDecoratorFactory("post");
export const Put = methodDecoratorFactory("put");
export const Patch = methodDecoratorFactory("patch");
export const Delete = methodDecoratorFactory("delete");
async function sendResult(res, result) {
    if (res.headersSent)
        return;
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
    if (typeof result === "object" && result !== null && "__status" in result) {
        const { __status, ...data } = result;
        res.status(__status).json(data);
        return;
    }
    res.json(result);
}
function isReadableStream(value) {
    return (typeof value === "object" &&
        value !== null &&
        typeof value.pipe === "function");
}
export function registerController(router, Controller) {
    const instance = new Controller();
    const prototype = Object.getPrototypeOf(instance);
    const methodNames = Object.getOwnPropertyNames(prototype).filter((name) => name !== "constructor" && typeof instance[name] === "function");
    methodNames.forEach((name) => {
        const method = instance[name];
        const route = routes.get(method);
        if (route) {
            const handler = async (req, res, next) => {
                try {
                    const result = await method.call(instance, req, res, next);
                    await sendResult(res, result);
                }
                catch (error) {
                    if (!res.headersSent) {
                        console.error(`❌ Error in ${req.path}:`, error);
                        return res.status(500).json({
                            error: error instanceof Error
                                ? error.message
                                : "Internal server error",
                        });
                        return;
                    }
                    next(error);
                }
            };
            switch (route.method) {
                case "get":
                    router.get(route.path, handler);
                    break;
                case "post":
                    router.post(route.path, handler);
                    break;
                case "put":
                    router.put(route.path, handler);
                    break;
                case "patch":
                    router.patch(route.path, handler);
                    break;
                case "delete":
                    router.delete(route.path, handler);
                    break;
            }
        }
    });
}
//# sourceMappingURL=index.js.map