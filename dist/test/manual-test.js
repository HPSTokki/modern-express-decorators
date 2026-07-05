import { createTestApp } from "./app-test.js";
// Start the server for manual testing
const app = createTestApp();
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`
🧪 Manual test server running at http://localhost:${PORT}
  
Test these endpoints:
  GET  http://localhost:${PORT}/api/test
  GET  http://localhost:${PORT}/api/test?page=1&limit=10
  GET  http://localhost:${PORT}/api/users/123
  POST http://localhost:${PORT}/api/users
  PUT  http://localhost:${PORT}/api/users/456
  PATCH http://localhost:${PORT}/api/users/789
  DELETE http://localhost:${PORT}/api/users/999
  GET  http://localhost:${PORT}/api/manual
  GET  http://localhost:${PORT}/api/error (tests error handling)
  GET  http://localhost:${PORT}/api/no-return (should be 204)

Press Ctrl+C to stop
  `);
});
// Keep the process alive
process.on("SIGINT", () => {
    console.log("\n👋 Server stopped");
    process.exit();
});
//# sourceMappingURL=manual-test.js.map