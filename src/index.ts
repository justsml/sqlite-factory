import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
sqlite3.verbose();

type SqlParams<TRow> = Partial<TRow> | Partial<TRow>[] | any[];

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
  params:
    | Array<string | number | boolean | Date | TParamRow | any>
    | Record<string, any>
    | TParamRow;
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
export default function sqliteFactory<TRow>(
  { filePath, tableName, createTableSql }: ISqlFactoryParams = {
    createTableSql: "",
    tableName: "",
  }
) {
  if (!/CREATE\s+TABLE/gi.test(createTableSql))
    throw new Error(
      `The createTableCommand parameter must include 'CREATE TABLE'.`
    );

  const db = open({
    filename: filePath || ":memory:",
    driver: sqlite3.Database,
  }).then((db) => {
    db.on("error", console.error);
    return autoCreateTable({ db, createTableSql }).then((db) => db);
  });
  return SqlWrapper<TRow>({ db, tableName });
}

async function autoCreateTable({
  db,
  createTableSql,
}: {
  db: Database;
  createTableSql: string;
}) {
  await db.exec(createTableSql);
  return db;
}

function SqlWrapper<TRow>({
  db,
  tableName,
}: {
  db: Promise<Database>;
  tableName: string;
}) {
  return {
    /**
     * CRITICAL: Do not forget to call `[model].close()`!
     *
     * @returns {void}
     */
    async close() {
      return (await db).close();
    },
    async getAll<TResults = TRow[]>({
      query,
      params,
    }: IQueryParams): Promise<TResults> {
      return (await db).all<TResults>(query, params);
    },
    async get<TResult = TRow>({
      query,
      params,
    }: IQueryParams): Promise<TResult | undefined> {
      return (await db).get<TResult | undefined>(query, params);
    },
    async insert<TInput = TRow>(params: SqlParams<TInput>) {
      const { keys, keysWithPrefix, paramsWithPrefix } = parseParams(params);
      return (await db).run(
        `
      INSERT INTO ${tableName} (
        ${keys.join(", ")}
      ) VALUES (${keysWithPrefix.join(", ")})`,
        paramsWithPrefix
      );
    },
    async update<TInput = TRow>(
      params: SqlParams<TInput>,
      whereParams?: SqlParams<TRow> | null,
      whereExpression?: string | null
    ) {
      const { keyBindingList, paramsWithPrefix } = parseParams(params);
      const where = whereParams ? parseParams(whereParams) : null;
      /* istanbul ignore next */
      return (await db).run(
        `UPDATE ${tableName} SET
        ${keyBindingList.join(", ")}
        ${
          whereExpression
            ? `WHERE ${whereExpression}`
            : where?.keyBindingList
            ? `WHERE ${where!.keyBindingList.join(", ")}`
            : ""
        }
      `,
        { ...paramsWithPrefix, ...where?.paramsWithPrefix }
      );
    },
    async remove(whereParams: SqlParams<TRow>, whereExpression: string) {
      const { paramsWithPrefix } = parseParams(whereParams);
      /* istanbul ignore next */
      return (await db).run(
        `DELETE FROM ${tableName} WHERE ${whereExpression}`,
        paramsWithPrefix
      );
    },
  };
}

function parseParams<TRow>(params: SqlParams<TRow>) {
  const keys = Object.keys(params);
  const keysWithPrefix = keys.map((k) => `:${k}`);
  const keyBindingList = keys.map((key) => `${key} = :${key}`);
  const paramsWithPrefix = keys.reduce((obj, key) => {
    // @ts-ignore
    obj[`:${key}`] = params[key];
    return obj;
  }, {} as Record<string, any>);
  return { keys, keysWithPrefix, paramsWithPrefix, keyBindingList };
}
