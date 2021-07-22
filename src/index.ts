import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
sqlite3.verbose();

interface ISqlFactoryParams {
  filePath?: string;
  tableName: string;
  createTableSql: string;
}
interface IQueryParams<TParamRow = any> {
  query: string;
  params:
    | Array<string | number | boolean | Date | any>
    | Record<string, any>
    | TParamRow;
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
export default async function modelFactory<TRow>(
  { filePath, tableName, createTableSql }: ISqlFactoryParams = {
    createTableSql: "",
    tableName: "[TABLE_NAME]"
  }
) {
  const db = await open({
    filename: filePath || ":memory:",
    driver: sqlite3.Database,
  });
  db.on("error", console.error);
  await autoCreateTable({ db, createTableSql });
  return SqlWrapper<TRow>({db, tableName});
}

async function autoCreateTable({
  db,
  createTableSql,
}: {
  db: Database;
  createTableSql: string;
}) {
  if (!/CREATE\s+TABLE/gi.test(createTableSql))
    throw new Error(
      `The createTableCommand parameter must include 'CREATE TABLE'.`
    );
  return await db.exec(createTableSql);
}

type SqlParams<TRow> = Partial<TRow> | any[];

function SqlWrapper<TRow>({db, tableName}: {db: Database, tableName: string}) {
  return {
    /**
     * CRITICAL: Do not forget to call `[model].close()`!
     * 
     * @returns {void}
     */
    close: () => db.close(),
    getAll<TResults = TRow[]>({ query, params }: IQueryParams): Promise<TResults> {return db.all<TResults>(query, params)},
    get<TResult = TRow>({ query, params }: IQueryParams): Promise<TResult | undefined> {return db.get<TResult | undefined>(query, params)},
    insert: (params: SqlParams<TRow>) => {
      const {keys, keysWithPrefix, paramsWithPrefix} = generateParams(params);
      return db.run(
        `
      INSERT INTO ${tableName} (
        ${keys.join(', ')}
      ) VALUES (${keysWithPrefix.join(', ')})`,
        paramsWithPrefix
      );
    },
    update: (params: SqlParams<TRow>, whereParams?: SqlParams<TRow> | null, whereExpression?: string | null) => {
      const {keyBindingList, paramsWithPrefix} = generateParams(params);
      const where = whereParams ? generateParams(whereParams) : null;
      return db.run(
        `UPDATE ${tableName} SET
        ${keyBindingList.join(', ')}
        ${where ? `WHERE ${whereExpression}` : ''}
      `,
        {...paramsWithPrefix, ...where?.paramsWithPrefix}
      );
    },
    remove: (whereParams: SqlParams<TRow>, whereExpression: string) => {
      const {paramsWithPrefix} = generateParams(whereParams);
      return db.run(
        `DELETE FROM ${tableName} WHERE ${whereExpression}`,
        paramsWithPrefix
      );
    },
  };
}

function generateParams<TRow>(params: SqlParams<TRow>) {
  const keys = Object.keys(params);
  const keysWithPrefix = keys.map(k => `:${k}`);
  const keyBindingList = keys.map(key => `${key} = :${key}`)
  const paramsWithPrefix = keys.reduce((obj, key) => {
    // @ts-ignore
    obj[`:${key}`] = params[key];
    return obj;
  }, {} as Record<string, any>)
  return {keys, keysWithPrefix, paramsWithPrefix, keyBindingList}
}