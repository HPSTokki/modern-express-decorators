// test-runner.ts
// test/test-runner.ts
import { createTestApp } from "./app-test.js";
import { rateLimiterState } from "./controllet-test.js";

async function runTests() {
  console.log("🧪 Starting comprehensive tests...\n");

  // Reset rate limiter at the start
  rateLimiterState.reset();
  const app = createTestApp();
  const server = app.listen(3001);

  const baseUrl = "http://localhost:3001/api";
  let passed = 0;
  let failed = 0;
  const results: string[] = [];

  async function testEndpoint(
    name: string,
    url: string,
    options?: RequestInit,
    expectedStatus?: number,
  ) {
    try {
      const response = await fetch(baseUrl + url, options);
      let data = null;
      try {
        data =
          response.status !== 204 && response.status !== 304
            ? await response.json()
            : null;
      } catch (e) {
        // Some responses might not be JSON
      }

      if (expectedStatus !== undefined) {
        if (response.status === expectedStatus) {
          results.push(`✅ ${name}: PASS (${response.status})`);
          passed++;
          return { response, data, success: true };
        } else {
          results.push(
            `❌ ${name}: FAIL (expected ${expectedStatus}, got ${response.status})`,
          );
          failed++;
          return { response, data, success: false };
        }
      }

      const success = response.status >= 200 && response.status < 300;
      if (success) {
        results.push(`✅ ${name}: PASS (${response.status})`);
        passed++;
      } else {
        results.push(`❌ ${name}: FAIL (${response.status})`);
        failed++;
      }
      return { response, data, success };
    } catch (error: any) {
      results.push(`❌ ${name}: ERROR - ${error.message}`);
      failed++;
      return { success: false, error };
    }
  }

  console.log("Running test suite...\n");

  // ========== BASIC TESTS ==========
  await testEndpoint("GET /test", "/test", undefined, 200);
  await testEndpoint("GET /users/:id", "/users/123", undefined, 200);
  await testEndpoint(
    "POST /users",
    "/users",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "John", email: "john@test.com" }),
    },
    201,
  );
  await testEndpoint(
    "PUT /users/:id",
    "/users/456",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated" }),
    },
    200,
  );
  await testEndpoint(
    "DELETE /users/:id",
    "/users/999",
    {
      method: "DELETE",
    },
    204,
  );
  await testEndpoint(
    "PATCH /users/:id",
    "/users/789",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "new@test.com" }),
    },
    200,
  );

  // ========== MIDDLEWARE TESTS ==========

  // Test auth middleware - should fail without token
  await testEndpoint("GET /protected (no auth)", "/protected", undefined, 401);

  // Test auth middleware - should pass with token
  await testEndpoint(
    "GET /protected (with auth)",
    "/protected",
    {
      headers: { Authorization: "Bearer test-token-123" },
    },
    200,
  );

  // ========== RATE LIMITING TESTS ==========
  // IMPORTANT: Reset rate limiter before rate limit tests
  // The previous POST /users test consumed the rate limit
  // We need a fresh state for these tests
  console.log("\n🔄 Resetting rate limiter for rate limit tests...");
  rateLimiterState.reset();

  // Test rate limiting - first request should pass
  await testEndpoint(
    "POST /users (rate limit 1)",
    "/users",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Jane", email: "jane@test.com" }),
    },
    201,
  );

  // Test rate limiting - second request should be rate limited
  await testEndpoint(
    "POST /users (rate limit 2 - should hit limit)",
    "/users",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bob", email: "bob@test.com" }),
    },
    429,
  );

  // Test validation middleware - invalid data
  await testEndpoint(
    "POST /users (invalid - no name)",
    "/users",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com" }),
    },
    400,
  );

  // Test validation middleware - invalid email
  await testEndpoint(
    "POST /users (invalid - bad email)",
    "/users",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", email: "invalid" }),
    },
    400,
  );

  // Test response modification middleware
  await testEndpoint(
    "GET /with-meta (should have metadata)",
    "/with-meta",
    undefined,
    200,
  );

  // Test error handler middleware
  await testEndpoint(
    "GET /error-test (should be handled)",
    "/error-test",
    undefined,
    500,
  );

  // Test secure data with auth
  await testEndpoint(
    "GET /secure-data (with auth)",
    "/secure-data",
    {
      headers: { Authorization: "Bearer secret-token" },
    },
    200,
  );

  // Test secure data without auth
  await testEndpoint(
    "GET /secure-data (no auth)",
    "/secure-data",
    undefined,
    401,
  );

  // Test conditional middleware
  await testEndpoint(
    "GET /conditional (debug=false)",
    "/conditional?debug=false",
    undefined,
    200,
  );

  await testEndpoint(
    "GET /conditional (debug=true)",
    "/conditional?debug=true",
    undefined,
    200,
  );

  // Test public info middleware
  await testEndpoint("GET /public-info", "/public-info", undefined, 200);

  // ========== EDGE CASES ==========
  await testEndpoint("GET /empty (no return)", "/empty", undefined, 204);
  await testEndpoint("GET /null", "/null", undefined, 200);
  await testEndpoint("GET /empty-string", "/empty-string", undefined, 200);
  await testEndpoint("GET /number", "/number", undefined, 200);
  await testEndpoint("GET /boolean", "/boolean", undefined, 200);
  await testEndpoint("GET /array", "/array", undefined, 200);
  await testEndpoint("GET /nested", "/nested", undefined, 200);
  await testEndpoint("GET /manual-201", "/manual-201", undefined, 201);
  await testEndpoint("GET /manual-400", "/manual-400", undefined, 400);
  await testEndpoint("GET /manual-404", "/manual-404", undefined, 404);
  await testEndpoint("GET /sync-error", "/sync-error", undefined, 500);
  await testEndpoint("GET /async-error", "/async-error", undefined, 500);
  await testEndpoint("GET /headers", "/headers", undefined, 200);
  await testEndpoint("GET /large", "/large", undefined, 200);
  await testEndpoint(
    "GET /query-special",
    "/query-special?search=hello&filter=active&page=2",
    undefined,
    200,
  );
  await testEndpoint(
    "GET /users/1/posts/2",
    "/users/1/posts/2",
    undefined,
    200,
  );
  await testEndpoint(
    "GET /optional",
    "/optional?page=5&limit=20&sort=desc",
    undefined,
    200,
  );
  await testEndpoint(
    "POST /raw-body",
    "/raw-body",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: "data", nested: { value: 123 } }),
    },
    200,
  );
  await testEndpoint("GET /multiple-send", "/multiple-send", undefined, 200);
  await testEndpoint(
    "GET /no-content-custom",
    "/no-content-custom",
    undefined,
    202,
  );
  await testEndpoint("GET /redirect", "/redirect", undefined, 200);
  await testEndpoint("GET /download", "/download", undefined, 200);
  await testEndpoint("GET /slow", "/slow", undefined, 200);

  // ========== SUMMARY ==========
  console.log("\n📊 Test Results:");
  console.log("─".repeat(50));
  results.forEach((result) => console.log(result));
  console.log("─".repeat(50));
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed! Package is stable!");
    console.log("📦 Ready to publish to npm!");
  } else {
    console.log("\n❌ Some tests failed. Please fix before publishing.");
    console.log("🔍 Check the failing tests above for details.");
  }

  server.close();
}

runTests().catch(console.error);
