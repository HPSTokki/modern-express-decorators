// test/test-runner.ts
import { createTestApp } from "./app-test.js";
async function runTests() {
    console.log("🧪 Starting comprehensive tests...\n");
    const app = createTestApp();
    const server = app.listen(3001);
    const baseUrl = "http://localhost:3001/api";
    let passed = 0;
    let failed = 0;
    const results = [];
    async function testEndpoint(name, url, options, expectedStatus, expectedBody) {
        try {
            const response = await fetch(baseUrl + url, options);
            let data = null;
            try {
                data =
                    response.status !== 204 && response.status !== 304
                        ? await response.json()
                        : null;
            }
            catch (e) {
                // Some responses might not be JSON
            }
            // FIX: Check expected status FIRST before marking as success/fail
            // This allows 400, 404, 500 to be considered "passing" if they match expectations
            if (expectedStatus !== undefined) {
                if (response.status === expectedStatus) {
                    results.push(`✅ ${name}: PASS (${response.status})`);
                    passed++;
                    return { response, data, success: true };
                }
                else {
                    results.push(`❌ ${name}: FAIL (expected ${expectedStatus}, got ${response.status})`);
                    failed++;
                    return { response, data, success: false };
                }
            }
            // Only check for success range if no expected status was provided
            const success = response.status >= 200 && response.status < 300;
            if (success) {
                results.push(`✅ ${name}: PASS (${response.status})`);
                passed++;
            }
            else {
                results.push(`❌ ${name}: FAIL (${response.status})`);
                failed++;
            }
            return { response, data, success };
        }
        catch (error) {
            results.push(`❌ ${name}: ERROR - ${error.message}`);
            failed++;
            return { success: false, error };
        }
    }
    console.log("Running test suite...\n");
    // ========== BASIC TESTS ==========
    await testEndpoint("GET /test", "/test", undefined, 200);
    await testEndpoint("GET /users/:id", "/users/123", undefined, 200);
    await testEndpoint("POST /users", "/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", email: "john@test.com" }),
    }, 201);
    await testEndpoint("PUT /users/:id", "/users/456", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated" }),
    }, 200);
    await testEndpoint("DELETE /users/:id", "/users/999", {
        method: "DELETE",
    }, 204);
    await testEndpoint("PATCH /users/:id", "/users/789", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "new@test.com" }),
    }, 200);
    // ========== EDGE CASES ==========
    // Empty response
    await testEndpoint("GET /empty (no return)", "/empty", undefined, 204);
    // Null response
    await testEndpoint("GET /null", "/null", undefined, 200);
    // Empty string
    await testEndpoint("GET /empty-string", "/empty-string", undefined, 200);
    // Number
    await testEndpoint("GET /number", "/number", undefined, 200);
    // Boolean
    await testEndpoint("GET /boolean", "/boolean", undefined, 200);
    // Array
    await testEndpoint("GET /array", "/array", undefined, 200);
    // Nested object
    await testEndpoint("GET /nested", "/nested", undefined, 200);
    // Manual status codes
    await testEndpoint("GET /manual-201", "/manual-201", undefined, 201);
    await testEndpoint("GET /manual-400", "/manual-400", undefined, 400);
    await testEndpoint("GET /manual-404", "/manual-404", undefined, 404);
    // Error handling
    await testEndpoint("GET /sync-error", "/sync-error", undefined, 500);
    await testEndpoint("GET /async-error", "/async-error", undefined, 500);
    // Headers
    await testEndpoint("GET /headers", "/headers", undefined, 200);
    // Large response
    await testEndpoint("GET /large", "/large", undefined, 200);
    // Query parameters
    await testEndpoint("GET /query-special", "/query-special?search=hello&filter=active&page=2&special-chars=!@#$", undefined, 200);
    // Multiple params
    await testEndpoint("GET /users/1/posts/2", "/users/1/posts/2", undefined, 200);
    // Optional parameters
    await testEndpoint("GET /optional", "/optional?page=5&limit=20&sort=desc", undefined, 200);
    // Raw body
    await testEndpoint("POST /raw-body", "/raw-body", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "data", nested: { value: 123 } }),
    }, 200);
    // Multiple send (should only send once)
    await testEndpoint("GET /multiple-send", "/multiple-send", undefined, 200);
    // No content with custom status
    await testEndpoint("GET /no-content-custom", "/no-content-custom", undefined, 202);
    // Redirect (should follow redirect)
    await testEndpoint("GET /redirect", "/redirect", undefined, 200);
    // Download
    await testEndpoint("GET /download", "/download", undefined, 200);
    // Slow response
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
    }
    else {
        console.log("\n❌ Some tests failed. Please fix before publishing.");
        console.log("🔍 Check the failing tests above for details.");
    }
    server.close();
}
runTests().catch(console.error);
//# sourceMappingURL=test-runner.js.map