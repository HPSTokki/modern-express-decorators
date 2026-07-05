import express from "express";
import { registerController } from "../index.js";
import { TestController } from "./controllet-test.js";
export function createTestApp() {
    const app = express();
    app.use(express.json());
    const router = express.Router();
    registerController(router, TestController);
    app.use("/api", router);
    // Error handler
    app.use((err, req, res, next) => {
        console.error("❌ Error caught:", err.message);
        res.status(500).json({
            error: err.message,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
    });
    return app;
}
//# sourceMappingURL=app-test.js.map