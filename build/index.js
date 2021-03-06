"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var sqlite3_1 = __importDefault(require("sqlite3"));
var sqlite_1 = require("sqlite");
sqlite3_1.default.verbose();
/**
 * sqliteFactory creates a CRUD derived sqlite wrapper.
 *
 * It accepts a SQL create table expression (e.g. 'CREATE TABLE...').
 *
 * ```js
 * const logService = sqliteFactory({
 *   tableName: "logs",
 *   filePath: "./db.sqlite",
 *   createTableSql: `CREATE TABLE IF NOT EXISTS logs (
 *     id INTEGER PRIMARY KEY AUTOINCREMENT,
 *     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     action VARCHAR(50),
 *     error_message TEXT,
 *     error_stack TEXT,
 *     source_file_name VARCHAR(100),
 *     source_line_number INTEGER,
 *     data TEXT
 *   );`,
 * });
 * ```
 *
 * @param options.filePath {string}
 * @param options.createTableSql {string}
 * @returns
 */
function sqliteFactory(_a) {
    var _b = _a === void 0 ? {
        createTableSql: "",
        tableName: "",
    } : _a, filePath = _b.filePath, tableName = _b.tableName, createTableSql = _b.createTableSql;
    if (!/CREATE\s+TABLE/gi.test(createTableSql))
        throw new Error("The createTableCommand parameter must include 'CREATE TABLE'.");
    var db = sqlite_1.open({
        filename: filePath || ":memory:",
        driver: sqlite3_1.default.Database,
    }).then(function (db) {
        db.on("error", console.error);
        return autoCreateTable({ db: db, createTableSql: createTableSql }).then(function (db) { return db; });
    });
    return SqlWrapper({ db: db, tableName: tableName });
}
exports.default = sqliteFactory;
function autoCreateTable(_a) {
    var db = _a.db, createTableSql = _a.createTableSql;
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, db.exec(createTableSql)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, db];
            }
        });
    });
}
function SqlWrapper(_a) {
    var db = _a.db, tableName = _a.tableName;
    return {
        /**
         * CRITICAL: Do not forget to call `[model].close()`!
         *
         * @returns {void}
         */
        close: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, db];
                        case 1: return [2 /*return*/, (_a.sent()).close()];
                    }
                });
            });
        },
        getAll: function (_a) {
            var query = _a.query, params = _a.params;
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db];
                        case 1: return [2 /*return*/, (_b.sent()).all(query, params)];
                    }
                });
            });
        },
        get: function (_a) {
            var query = _a.query, params = _a.params;
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, db];
                        case 1: return [2 /*return*/, (_b.sent()).get(query, params)];
                    }
                });
            });
        },
        insert: function (params) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, keys, keysWithPrefix, paramsWithPrefix;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = parseParams(params), keys = _a.keys, keysWithPrefix = _a.keysWithPrefix, paramsWithPrefix = _a.paramsWithPrefix;
                            return [4 /*yield*/, db];
                        case 1: return [2 /*return*/, (_b.sent()).run("\n      INSERT INTO " + tableName + " (\n        " + keys.join(", ") + "\n      ) VALUES (" + keysWithPrefix.join(", ") + ")", paramsWithPrefix)];
                    }
                });
            });
        },
        update: function (params, whereParams, whereExpression) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, keyBindingList, paramsWithPrefix, where;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = parseParams(params), keyBindingList = _a.keyBindingList, paramsWithPrefix = _a.paramsWithPrefix;
                            where = whereParams ? parseParams(whereParams) : null;
                            return [4 /*yield*/, db];
                        case 1: 
                        /* istanbul ignore next */
                        return [2 /*return*/, (_b.sent()).run("UPDATE " + tableName + " SET\n        " + keyBindingList.join(", ") + "\n        " + (whereExpression
                                ? "WHERE " + whereExpression
                                : (where === null || where === void 0 ? void 0 : where.keyBindingList)
                                    ? "WHERE " + where.keyBindingList.join(", ")
                                    : "") + "\n      ", __assign(__assign({}, paramsWithPrefix), where === null || where === void 0 ? void 0 : where.paramsWithPrefix))];
                    }
                });
            });
        },
        remove: function (whereParams, whereExpression) {
            return __awaiter(this, void 0, void 0, function () {
                var paramsWithPrefix;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            paramsWithPrefix = parseParams(whereParams).paramsWithPrefix;
                            return [4 /*yield*/, db];
                        case 1: 
                        /* istanbul ignore next */
                        return [2 /*return*/, (_a.sent()).run("DELETE FROM " + tableName + " WHERE " + whereExpression, paramsWithPrefix)];
                    }
                });
            });
        },
    };
}
function parseParams(params) {
    var keys = Object.keys(params);
    var keysWithPrefix = keys.map(function (k) { return ":" + k; });
    var keyBindingList = keys.map(function (key) { return key + " = :" + key; });
    var paramsWithPrefix = keys.reduce(function (obj, key) {
        // @ts-ignore
        obj[":" + key] = params[key];
        return obj;
    }, {});
    return { keys: keys, keysWithPrefix: keysWithPrefix, paramsWithPrefix: paramsWithPrefix, keyBindingList: keyBindingList };
}
//# sourceMappingURL=index.js.map