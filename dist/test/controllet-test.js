var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { Get, Post, Put, Delete, Patch } from "../index.js";
let TestController = (() => {
    let _instanceExtraInitializers = [];
    let _getTest_decorators;
    let _getUser_decorators;
    let _createUser_decorators;
    let _updateUser_decorators;
    let _deleteUser_decorators;
    let _patchUser_decorators;
    let _emptyResponse_decorators;
    let _nullResponse_decorators;
    let _emptyString_decorators;
    let _numberResponse_decorators;
    let _booleanResponse_decorators;
    let _arrayResponse_decorators;
    let _nestedResponse_decorators;
    let _manual201_decorators;
    let _manual400_decorators;
    let _manual404_decorators;
    let _syncError_decorators;
    let _asyncError_decorators;
    let _headersTest_decorators;
    let _largeResponse_decorators;
    let _querySpecial_decorators;
    let _multipleParams_decorators;
    let _optionalParams_decorators;
    let _rawBody_decorators;
    let _multipleSend_decorators;
    let _noContentCustom_decorators;
    let _redirectTest_decorators;
    let _downloadTest_decorators;
    let _slowResponse_decorators;
    return class TestController {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getTest_decorators = [Get("/test")];
            _getUser_decorators = [Get("/users/:id")];
            _createUser_decorators = [Post("/users")];
            _updateUser_decorators = [Put("/users/:id")];
            _deleteUser_decorators = [Delete("/users/:id")];
            _patchUser_decorators = [Patch("/users/:id")];
            _emptyResponse_decorators = [Get("/empty")];
            _nullResponse_decorators = [Get("/null")];
            _emptyString_decorators = [Get("/empty-string")];
            _numberResponse_decorators = [Get("/number")];
            _booleanResponse_decorators = [Get("/boolean")];
            _arrayResponse_decorators = [Get("/array")];
            _nestedResponse_decorators = [Get("/nested")];
            _manual201_decorators = [Get("/manual-201")];
            _manual400_decorators = [Get("/manual-400")];
            _manual404_decorators = [Get("/manual-404")];
            _syncError_decorators = [Get("/sync-error")];
            _asyncError_decorators = [Get("/async-error")];
            _headersTest_decorators = [Get("/headers")];
            _largeResponse_decorators = [Get("/large")];
            _querySpecial_decorators = [Get("/query-special")];
            _multipleParams_decorators = [Get("/users/:userId/posts/:postId")];
            _optionalParams_decorators = [Get("/optional")];
            _rawBody_decorators = [Post("/raw-body")];
            _multipleSend_decorators = [Get("/multiple-send")];
            _noContentCustom_decorators = [Get("/no-content-custom")];
            _redirectTest_decorators = [Get("/redirect")];
            _downloadTest_decorators = [Get("/download")];
            _slowResponse_decorators = [Get("/slow")];
            __esDecorate(this, null, _getTest_decorators, { kind: "method", name: "getTest", static: false, private: false, access: { has: obj => "getTest" in obj, get: obj => obj.getTest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getUser_decorators, { kind: "method", name: "getUser", static: false, private: false, access: { has: obj => "getUser" in obj, get: obj => obj.getUser }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _createUser_decorators, { kind: "method", name: "createUser", static: false, private: false, access: { has: obj => "createUser" in obj, get: obj => obj.createUser }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateUser_decorators, { kind: "method", name: "updateUser", static: false, private: false, access: { has: obj => "updateUser" in obj, get: obj => obj.updateUser }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteUser_decorators, { kind: "method", name: "deleteUser", static: false, private: false, access: { has: obj => "deleteUser" in obj, get: obj => obj.deleteUser }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _patchUser_decorators, { kind: "method", name: "patchUser", static: false, private: false, access: { has: obj => "patchUser" in obj, get: obj => obj.patchUser }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _emptyResponse_decorators, { kind: "method", name: "emptyResponse", static: false, private: false, access: { has: obj => "emptyResponse" in obj, get: obj => obj.emptyResponse }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _nullResponse_decorators, { kind: "method", name: "nullResponse", static: false, private: false, access: { has: obj => "nullResponse" in obj, get: obj => obj.nullResponse }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _emptyString_decorators, { kind: "method", name: "emptyString", static: false, private: false, access: { has: obj => "emptyString" in obj, get: obj => obj.emptyString }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _numberResponse_decorators, { kind: "method", name: "numberResponse", static: false, private: false, access: { has: obj => "numberResponse" in obj, get: obj => obj.numberResponse }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _booleanResponse_decorators, { kind: "method", name: "booleanResponse", static: false, private: false, access: { has: obj => "booleanResponse" in obj, get: obj => obj.booleanResponse }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _arrayResponse_decorators, { kind: "method", name: "arrayResponse", static: false, private: false, access: { has: obj => "arrayResponse" in obj, get: obj => obj.arrayResponse }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _nestedResponse_decorators, { kind: "method", name: "nestedResponse", static: false, private: false, access: { has: obj => "nestedResponse" in obj, get: obj => obj.nestedResponse }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _manual201_decorators, { kind: "method", name: "manual201", static: false, private: false, access: { has: obj => "manual201" in obj, get: obj => obj.manual201 }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _manual400_decorators, { kind: "method", name: "manual400", static: false, private: false, access: { has: obj => "manual400" in obj, get: obj => obj.manual400 }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _manual404_decorators, { kind: "method", name: "manual404", static: false, private: false, access: { has: obj => "manual404" in obj, get: obj => obj.manual404 }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _syncError_decorators, { kind: "method", name: "syncError", static: false, private: false, access: { has: obj => "syncError" in obj, get: obj => obj.syncError }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _asyncError_decorators, { kind: "method", name: "asyncError", static: false, private: false, access: { has: obj => "asyncError" in obj, get: obj => obj.asyncError }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _headersTest_decorators, { kind: "method", name: "headersTest", static: false, private: false, access: { has: obj => "headersTest" in obj, get: obj => obj.headersTest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _largeResponse_decorators, { kind: "method", name: "largeResponse", static: false, private: false, access: { has: obj => "largeResponse" in obj, get: obj => obj.largeResponse }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _querySpecial_decorators, { kind: "method", name: "querySpecial", static: false, private: false, access: { has: obj => "querySpecial" in obj, get: obj => obj.querySpecial }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _multipleParams_decorators, { kind: "method", name: "multipleParams", static: false, private: false, access: { has: obj => "multipleParams" in obj, get: obj => obj.multipleParams }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _optionalParams_decorators, { kind: "method", name: "optionalParams", static: false, private: false, access: { has: obj => "optionalParams" in obj, get: obj => obj.optionalParams }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _rawBody_decorators, { kind: "method", name: "rawBody", static: false, private: false, access: { has: obj => "rawBody" in obj, get: obj => obj.rawBody }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _multipleSend_decorators, { kind: "method", name: "multipleSend", static: false, private: false, access: { has: obj => "multipleSend" in obj, get: obj => obj.multipleSend }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _noContentCustom_decorators, { kind: "method", name: "noContentCustom", static: false, private: false, access: { has: obj => "noContentCustom" in obj, get: obj => obj.noContentCustom }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _redirectTest_decorators, { kind: "method", name: "redirectTest", static: false, private: false, access: { has: obj => "redirectTest" in obj, get: obj => obj.redirectTest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _downloadTest_decorators, { kind: "method", name: "downloadTest", static: false, private: false, access: { has: obj => "downloadTest" in obj, get: obj => obj.downloadTest }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _slowResponse_decorators, { kind: "method", name: "slowResponse", static: false, private: false, access: { has: obj => "slowResponse" in obj, get: obj => obj.slowResponse }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        // ========== BASIC TESTS ==========
        async getTest(req, res) {
            return { message: "GET works!", query: req.query };
        }
        async getUser(req, res) {
            const { id } = req.params;
            return { id, name: "Test User", method: "GET" };
        }
        async createUser(req, res) {
            res.status(201);
            return {
                id: 1,
                ...req.body,
                method: "POST",
            };
        }
        async updateUser(req, res) {
            const { id } = req.params;
            return { id, ...req.body, method: "PUT" };
        }
        async deleteUser(req, res) {
            const { id } = req.params;
            console.log(`🗑️ Deleting user ${id}`);
            res.status(204).send();
            return;
        }
        async patchUser(req, res) {
            const { id } = req.params;
            return { id, ...req.body, method: "PATCH" };
        }
        // ========== EDGE CASES ==========
        // ✅ FIXED: Return undefined explicitly (handler will send 204)
        async emptyResponse(req, res) {
            console.log("✅ GET /empty - returning undefined");
            // Don't return anything - handler will send 204
            return;
        }
        // ✅ FIXED: Return null
        async nullResponse(req, res) {
            console.log("✅ GET /null - returning null");
            return null; // Handler will send null as JSON
        }
        // Empty string
        async emptyString(req, res) {
            console.log("✅ GET /empty-string - returning empty string");
            return ""; // Handler will send empty string as JSON
        }
        // Number
        async numberResponse(req, res) {
            console.log("✅ GET /number - returning number");
            return 42;
        }
        // Boolean
        async booleanResponse(req, res) {
            console.log("✅ GET /boolean - returning boolean");
            return true;
        }
        // Array
        async arrayResponse(req, res) {
            console.log("✅ GET /array - returning array");
            return [1, 2, 3, 4, 5];
        }
        // Nested object
        async nestedResponse(req, res) {
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
        // Manual responses
        async manual201(req, res) {
            console.log("✅ GET /manual-201");
            res.status(201).json({ created: true });
            return;
        }
        async manual400(req, res) {
            console.log("✅ GET /manual-400");
            res.status(400).json({ error: "Bad request" });
            return;
        }
        async manual404(req, res) {
            console.log("✅ GET /manual-404");
            res.status(404).json({ error: "Not found" });
            return;
        }
        // Error handling
        async syncError(req, res) {
            console.log("❌ GET /sync-error - throwing sync error");
            throw new Error("Synchronous error");
        }
        async asyncError(req, res) {
            console.log("❌ GET /async-error - throwing async error");
            throw new Error("Asynchronous error");
        }
        // Headers
        async headersTest(req, res) {
            console.log("✅ GET /headers");
            res.setHeader("X-Custom-Header", "test-value");
            return { headers: req.headers };
        }
        // Large response
        async largeResponse(req, res) {
            console.log("✅ GET /large - returning large array");
            const largeArray = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                name: `Item ${i}`,
            }));
            return { items: largeArray };
        }
        // Query parameters
        async querySpecial(req, res) {
            console.log("✅ GET /query-special");
            return {
                search: req.query.search,
                filter: req.query.filter,
                page: req.query.page,
            };
        }
        // Multiple params
        async multipleParams(req, res) {
            console.log("✅ GET /users/:userId/posts/:postId");
            const { userId, postId } = req.params;
            return { userId, postId, message: "Multiple params work!" };
        }
        // Optional parameters
        async optionalParams(req, res) {
            console.log("✅ GET /optional");
            const { page = 1, limit = 10 } = req.query;
            return { page, limit };
        }
        // Raw body
        async rawBody(req, res) {
            console.log("✅ POST /raw-body");
            return {
                received: req.body,
            };
        }
        // Multiple send test
        async multipleSend(req, res) {
            console.log("✅ GET /multiple-send");
            res.status(200).json({ first: "response" });
            return;
        }
        // No content with custom status
        async noContentCustom(req, res) {
            console.log("✅ GET /no-content-custom");
            res.status(202).send();
            return;
        }
        // Redirect
        async redirectTest(req, res) {
            console.log("✅ GET /redirect");
            res.redirect(302, "/api/test");
            return;
        }
        // Download
        async downloadTest(req, res) {
            console.log("✅ GET /download");
            res.setHeader("Content-Disposition", 'attachment; filename="test.txt"');
            res.setHeader("Content-Type", "text/plain");
            res.send("This is a test file");
            return;
        }
        // Slow response
        async slowResponse(req, res) {
            console.log("⏳ GET /slow - waiting 2 seconds");
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return { message: "Slow response completed!" };
        }
        constructor() {
            __runInitializers(this, _instanceExtraInitializers);
        }
    };
})();
export { TestController };
//# sourceMappingURL=controllet-test.js.map