import express from "express";
import { TestController, testRouter } from "./controllet-test.js";

export function createTestApp() {
  const app = express();
  app.use(express.json());

  app.use(testRouter);

  // Error handler
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("❌ Error caught:", err.message);
      res.status(500).json({
        error: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    },
  );

  return app;
}
