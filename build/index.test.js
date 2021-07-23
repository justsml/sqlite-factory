"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = __importDefault(require("./index"));
var logger;
beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        logger = index_1.default({
            tableName: "logs",
            filePath: "./db.sqlite",
            createTableSql: "\nCREATE TABLE IF NOT EXISTS logs (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  action VARCHAR(50),\n  error_message TEXT,\n  error_stack TEXT,\n  source_file_name VARCHAR(100),\n  source_line_number INTEGER,\n  data TEXT\n);",
        }); // on file-system
        return [2 /*return*/];
    });
}); });
afterAll(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, logger.close()];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); });
test("can add logs", function () { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, logger.insert({
                    action: "test",
                    source_file_name: "test.json",
                    source_line_number: 24,
                    data: JSON.stringify({ row: [1, 2, 3, "fake data!"] }),
                })];
            case 1:
                result = _a.sent();
                expect(result).toBeDefined();
                return [2 /*return*/];
        }
    });
}); });
test("can query multiple rows", function () { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, logger.getAll({
                    query: "SELECT COUNT(*) as count FROM logs WHERE action = ?",
                    params: ["test"],
                })];
            case 1:
                result = (_a.sent())[0];
                expect(result.count).toBeGreaterThanOrEqual(1);
                return [2 /*return*/];
        }
    });
}); });
test("can query single rows", function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, count;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, logger.get({
                    query: "SELECT COUNT(*) as count FROM logs WHERE action = ?",
                    params: ["test"],
                })];
            case 1:
                result = _a.sent();
                count = (result || {}).count;
                expect(count).toBeGreaterThanOrEqual(1);
                return [2 /*return*/];
        }
    });
}); });
test("invalid CREATE TABLE argument", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        expect(function () {
            return index_1.default({
                tableName: "logs",
                filePath: "./db.sqlite",
                createTableSql: "(bad script)",
            });
        }).toThrow();
        return [2 /*return*/];
    });
}); });
test("can handle invalid arguments", function () {
    expect(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, index_1.default()];
    }); }); }).rejects.toThrowError();
});
test("can use in-memory mode", function () { return __awaiter(void 0, void 0, void 0, function () {
    var customers;
    return __generator(this, function (_a) {
        customers = index_1.default({
            tableName: "customers",
            createTableSql: "CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )",
        });
        expect(customers.insert({ name: "test" })).resolves.toHaveProperty("changes", 1);
        return [2 /*return*/];
    });
}); });
test("can update", function () { return __awaiter(void 0, void 0, void 0, function () {
    var customers;
    return __generator(this, function (_a) {
        customers = index_1.default({
            tableName: "customers",
            createTableSql: "CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )",
        });
        expect(customers.insert({ name: "test" })).resolves.toHaveProperty("changes", 1);
        expect(customers.update({ name: "dan" }, { name: "test" })).resolves.toHaveProperty("changes", 1);
        return [2 /*return*/];
    });
}); });
test("can update with custom WHERE clause", function () { return __awaiter(void 0, void 0, void 0, function () {
    var customers;
    return __generator(this, function (_a) {
        customers = index_1.default({
            tableName: "customers",
            createTableSql: "CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )",
        });
        expect(customers.insert({ name: "test" })).resolves.toBeDefined();
        expect(customers.update({ name: "dan" }, { name: "test" }, "NAME = :name AND NAME != 'admin'")).resolves.toBeDefined();
        return [2 /*return*/];
    });
}); });
test("can update entire table", function () { return __awaiter(void 0, void 0, void 0, function () {
    var customers;
    return __generator(this, function (_a) {
        customers = index_1.default({
            tableName: "customers",
            createTableSql: "CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )",
        });
        expect(customers.insert({ name: "test" })).resolves.toBeDefined();
        expect(customers.update({ name: "dan" })).resolves.toBeDefined();
        return [2 /*return*/];
    });
}); });
test("can remove with custom WHERE clause", function () { return __awaiter(void 0, void 0, void 0, function () {
    var customers;
    return __generator(this, function (_a) {
        customers = index_1.default({
            tableName: "customers",
            createTableSql: "CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )",
        });
        expect(customers.insert({ name: "test" })).resolves.toBeDefined();
        expect(customers.remove({ name: "dan" }, "name = :name AND name != 'admin'")).resolves.toBeDefined();
        return [2 /*return*/];
    });
}); });
test("can remove entire table", function () { return __awaiter(void 0, void 0, void 0, function () {
    var customers;
    return __generator(this, function (_a) {
        customers = index_1.default({
            tableName: "customers",
            createTableSql: "CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )",
        });
        expect(customers.insert({ name: "test" })).resolves.toHaveProperty("changes");
        expect(customers.remove({ name: "dan" }, "name = :name")).resolves.toBeDefined();
        return [2 /*return*/];
    });
}); });
//# sourceMappingURL=index.test.js.map