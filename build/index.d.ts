/// <reference types="./vendor-typings/sqlite3" />
import sqlite3 from "sqlite3";
interface ISqlFactoryParams {
    filePath?: string;
    tableName: string;
    createTableSql: string;
}
interface IQueryParams<TParamRow = any> {
    query: string;
    params: Array<string | number | boolean | Date | any> | Record<string, any> | TParamRow;
}
/**
 * modelFactory creates a CRUD derived sqlite wrapper.
 *
 * It accepts a SQL create table expression (e.g. 'CREATE TABLE...').
 *
 *
 * @param options.filePath {string}
 * @param options.createTableSql {string}
 * @returns
 */
export default function modelFactory<TRow>({ filePath, tableName, createTableSql }?: ISqlFactoryParams): Promise<{
    /**
     * CRITICAL: Do not forget to call `[model].close()`!
     *
     * @returns {void}
     */
    close: () => Promise<void>;
    getAll<TResults = TRow[]>({ query, params, }: IQueryParams<any>): Promise<TResults>;
    get<TResult = TRow>({ query, params, }: IQueryParams<any>): Promise<TResult | undefined>;
    insert: (params: SqlParams<TRow>) => Promise<import("sqlite").ISqlite.RunResult<sqlite3.Statement>>;
    update: (params: SqlParams<TRow>, whereParams?: SqlParams<TRow> | null | undefined, whereExpression?: string | null | undefined) => Promise<import("sqlite").ISqlite.RunResult<sqlite3.Statement>>;
    remove: (whereParams: SqlParams<TRow>, whereExpression: string) => Promise<import("sqlite").ISqlite.RunResult<sqlite3.Statement>>;
}>;
declare type SqlParams<TRow> = Partial<TRow> | any[];
export {};
//# sourceMappingURL=index.d.ts.map