/// <reference types="./vendor-typings/sqlite3" />
import sqlite3 from "sqlite3";
declare type SqlParams<TRow> = Partial<TRow> | Partial<TRow>[] | any[];
interface ISqlFactoryParams {
    /** Valid values are filenames, `":memory:"` for an anonymous in-memory database and an empty string for an anonymous disk-based database. Anonymous databases are not persisted and when closing the database handle, their contents are lost. */
    filePath?: string;
    /** The table name to use for insert, update and delete commands. */
    tableName: string;
    /** Must be a complete SQL DML Statement. Should start with `CREATE TABLE IF NOT EXISTS table_name ...` */
    createTableSql: string;
}
interface IQueryParams<TParamRow = any> {
    query: string;
    params: Array<string | number | boolean | Date | TParamRow | any> | Record<string, any> | TParamRow;
}
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
export default function sqliteFactory<TRow>({ filePath, tableName, createTableSql }?: ISqlFactoryParams): {
    /**
     * CRITICAL: Do not forget to call `[model].close()`!
     *
     * @returns {void}
     */
    close(): Promise<void>;
    getAll<TResults = TRow[]>({ query, params, }: IQueryParams<any>): Promise<TResults>;
    get<TResult = TRow>({ query, params, }: IQueryParams<any>): Promise<TResult | undefined>;
    insert<TInput = TRow>(params: SqlParams<TInput>): Promise<import("sqlite").ISqlite.RunResult<sqlite3.Statement>>;
    update<TInput_1 = TRow>(params: SqlParams<TInput_1>, whereParams?: SqlParams<TRow> | null | undefined, whereExpression?: string | null | undefined): Promise<import("sqlite").ISqlite.RunResult<sqlite3.Statement>>;
    remove(whereParams: SqlParams<TRow>, whereExpression: string): Promise<import("sqlite").ISqlite.RunResult<sqlite3.Statement>>;
};
export {};
//# sourceMappingURL=index.d.ts.map