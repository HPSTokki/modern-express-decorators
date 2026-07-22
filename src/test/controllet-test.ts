import { Request, Response, NextFunction } from "express";
import {
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Controller,
  createControllerRouter,
} from "../index.js";

import { UseMiddleware } from "../middleware.js";

// ========== MIDDLEWARE DEFINITIONS ==========

// Simple logging middleware
const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`📝 [LOGGER] ${req.method} ${req.path}`);
  next();
};

// Authentication middleware
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ error: "Unauthorized - No token provided" });
    return;
  }
  (req as any).user = { id: 1, name: "Authenticated User", token };
  next();
};

// Validation middleware for POST requests
const validateUserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, email } = req.body;
  if (!name || name.length < 2) {
    res
      .status(400)
      .json({ error: "Name is required and must be at least 2 characters" });
    return;
  }
  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }
  (req as any).validatedData = { name, email };
  next();
};

// controllet-test.ts - Make the rate limiter exportable
export const rateLimiterState = {
  requests: new Map<string, Map<string, number[]>>(),
  reset: function () {
    this.requests.clear();
  },
};

// Update rateLimitMiddleware to use the exported state
const rateLimitMiddleware = (() => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      req.ip ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      "unknown";
    const path = req.path;

    const now = Date.now();
    const windowMs = 60000;
    const maxRequests = 1;

    const { requests } = rateLimiterState;

    if (!requests.has(path)) {
      requests.set(path, new Map());
    }
    const pathRequests = requests.get(path)!;

    if (!pathRequests.has(ip)) {
      pathRequests.set(ip, []);
    }

    const timestamps = pathRequests.get(ip)!;
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);

    if (validTimestamps.length >= maxRequests) {
      res.status(429).json({
        error: "Too many requests to this endpoint. Please try again later.",
      });
      return;
    }

    validTimestamps.push(now);
    pathRequests.set(ip, validTimestamps);
    next();
  };
})();

// Performance timing middleware
const timingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`⏱️ [TIMING] ${req.method} ${req.path} - ${duration}ms`);
  });
  next();
};

// Response modification middleware
const modifyResponseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    const modifiedData = {
      ...data,
      _meta: {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
    };
    return originalJson(modifiedData);
  };
  next();
};

// Error handling middleware
const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(`🔥 [ERROR HANDLER] ${err.message}`);
  res.status(500).json({
    error: err.message,
    code: err.code || "INTERNAL_ERROR",
  });
};

// Conditional middleware
const devOnlyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "development") {
    console.log("🐛 [DEV] Running in development mode");
  }
  next();
};

// ========== CONTROLLER WITH MIDDLEWARE ==========

@Controller("/api")
@UseMiddleware(loggerMiddleware, timingMiddleware, devOnlyMiddleware)
export class TestController {
  @Get("/test")
  async getTest(req: Request, res: Response) {
    return { message: "GET works!", query: req.query };
  }

  @Get("/users/:id")
  async getUser(req: Request, res: Response) {
    const { id } = req.params;
    return { id, name: "Test User", method: "GET" };
  }

  @Get("/protected")
  @UseMiddleware(authMiddleware)
  async getProtected(req: Request, res: Response) {
    const user = (req as any).user;
    return {
      message: "Protected endpoint accessed!",
      user,
      timestamp: new Date().toISOString(),
    };
  }

  @Post("/users")
  @UseMiddleware(validateUserMiddleware, rateLimitMiddleware)
  async createUser(req: Request, res: Response) {
    const validatedData = (req as any).validatedData;
    return {
      __status: 201,
      id: Math.floor(Math.random() * 1000),
      ...validatedData,
      method: "POST",
      created: new Date().toISOString(),
    };
  }

  @Get("/with-meta")
  @UseMiddleware(modifyResponseMiddleware)
  async getWithMeta(req: Request, res: Response) {
    return {
      data: {
        id: 1,
        name: "Test with metadata",
      },
    };
  }

  @Get("/error-test")
  @UseMiddleware(errorHandlerMiddleware)
  async errorTest(req: Request, res: Response) {
    throw new Error("This is a test error!");
  }

  @Get("/secure-data")
  @UseMiddleware(authMiddleware) // No rate limiting here
  async getSecureData(req: Request, res: Response) {
    const user = (req as any).user;
    return {
      data: {
        id: 1,
        name: "Secure Data",
        sensitive: "This is protected information",
      },
      user,
    };
  }

  @Get("/conditional")
  @UseMiddleware((req: Request, res: Response, next: NextFunction) => {
    if (req.query.debug === "true") {
      console.log("🐞 Debug mode enabled for this request");
      (req as any).debug = true;
    }
    next();
  })
  async conditionalTest(req: Request, res: Response) {
    return {
      message: "Conditional middleware test",
      debug: (req as any).debug || false,
    };
  }

  @Get("/public-info")
  @UseMiddleware((req: Request, res: Response, next: NextFunction) => {
    (req as any).publicInfo = {
      allowed: true,
      timestamp: new Date().toISOString(),
    };
    next();
  })
  async getPublicInfo(req: Request, res: Response) {
    return {
      message: "Public information",
      info: (req as any).publicInfo,
    };
  }

  // ========== EXISTING TEST ROUTES ==========

  @Get("/empty")
  async emptyResponse(req: Request, res: Response) {
    console.log("✅ GET /empty - returning undefined");
    return;
  }

  @Get("/null")
  async nullResponse(req: Request, res: Response) {
    console.log("✅ GET /null - returning null");
    return null;
  }

  @Get("/empty-string")
  async emptyString(req: Request, res: Response) {
    console.log("✅ GET /empty-string - returning empty string");
    return "";
  }

  @Get("/number")
  async numberResponse(req: Request, res: Response) {
    console.log("✅ GET /number - returning number");
    return 42;
  }

  @Get("/boolean")
  async booleanResponse(req: Request, res: Response) {
    console.log("✅ GET /boolean - returning boolean");
    return true;
  }

  @Get("/array")
  async arrayResponse(req: Request, res: Response) {
    console.log("✅ GET /array - returning array");
    return [1, 2, 3, 4, 5];
  }

  @Get("/nested")
  async nestedResponse(req: Request, res: Response) {
    console.log("✅ GET /nested - returning nested object");
    return {
      user: {
        id: 1,
        profile: {
          name: "John",
          address: {
            city: "NYC",
            zip: "10001",
          },
        },
      },
    };
  }

  @Get("/manual-201")
  async manual201(req: Request, res: Response) {
    console.log("✅ GET /manual-201");
    res.status(201).json({ created: true });
    return;
  }

  @Get("/manual-400")
  async manual400(req: Request, res: Response) {
    console.log("✅ GET /manual-400");
    res.status(400).json({ error: "Bad request" });
    return;
  }

  @Get("/manual-404")
  async manual404(req: Request, res: Response) {
    console.log("✅ GET /manual-404");
    res.status(404).json({ error: "Not found" });
    return;
  }

  @Get("/sync-error")
  async syncError(req: Request, res: Response) {
    console.log("❌ GET /sync-error - throwing sync error");
    throw new Error("Synchronous error");
  }

  @Get("/async-error")
  async asyncError(req: Request, res: Response) {
    console.log("❌ GET /async-error - throwing async error");
    throw new Error("Asynchronous error");
  }

  @Get("/headers")
  async headersTest(req: Request, res: Response) {
    console.log("✅ GET /headers");
    res.setHeader("X-Custom-Header", "test-value");
    return { headers: req.headers };
  }

  @Get("/large")
  async largeResponse(req: Request, res: Response) {
    console.log("✅ GET /large - returning large array");
    const largeArray = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));
    return { items: largeArray };
  }

  @Get("/query-special")
  async querySpecial(req: Request, res: Response) {
    console.log("✅ GET /query-special");
    return {
      search: req.query.search,
      filter: req.query.filter,
      page: req.query.page,
    };
  }

  @Get("/users/:userId/posts/:postId")
  async multipleParams(req: Request, res: Response) {
    console.log("✅ GET /users/:userId/posts/:postId");
    const { userId, postId } = req.params;
    return { userId, postId, message: "Multiple params work!" };
  }

  @Get("/optional")
  async optionalParams(req: Request, res: Response) {
    console.log("✅ GET /optional");
    const { page = 1, limit = 10 } = req.query;
    return { page, limit };
  }

  @Post("/raw-body")
  async rawBody(req: Request, res: Response) {
    console.log("✅ POST /raw-body");
    return {
      received: req.body,
    };
  }

  @Get("/multiple-send")
  async multipleSend(req: Request, res: Response) {
    console.log("✅ GET /multiple-send");
    res.status(200).json({ first: "response" });
    return;
  }

  @Get("/no-content-custom")
  async noContentCustom(req: Request, res: Response) {
    console.log("✅ GET /no-content-custom");
    res.status(202).send();
    return;
  }

  @Get("/redirect")
  async redirectTest(req: Request, res: Response) {
    console.log("✅ GET /redirect");
    res.redirect(302, "/api/test");
    return;
  }

  @Get("/download")
  async downloadTest(req: Request, res: Response) {
    console.log("✅ GET /download");
    res.setHeader("Content-Disposition", 'attachment; filename="test.txt"');
    res.setHeader("Content-Type", "text/plain");
    res.send("This is a test file");
    return;
  }

  @Get("/slow")
  async slowResponse(req: Request, res: Response) {
    console.log("⏳ GET /slow - waiting 2 seconds");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { message: "Slow response completed!" };
  }

  @Put("/users/:id")
  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    return { id, ...req.body, method: "PUT" };
  }

  @Delete("/users/:id")
  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    console.log(`🗑️ Deleting user ${id}`);
    res.status(204).send();
    return;
  }

  @Patch("/users/:id")
  async patchUser(req: Request, res: Response) {
    const { id } = req.params;
    return { id, ...req.body, method: "PATCH" };
  }
}

export const testRouter = createControllerRouter(TestController);
