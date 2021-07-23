# Sqlite Factory

`sqlite-factory` is an easy way to add Sqlite based storage to most NodeJS apps. 

Designed for command line and terminal-style apps!

## Use Cases

* Restartable tasks!
* Logging progress or stats of long running processes.
* Other stuff with structured data.

## Notes

The library could be extended to support web based sqlite libraries. PRs welcome :).

It's not intended for use in multi-threaded apps (express server, cluster/worker module, PM2, etc.)

## Examples

### [JavaScript Example](examples/javascript/README.md)

### [TypeScript Example](examples/typescript/README.md)

**Folder structure**

```
- src/index.ts
- src/models/logs.ts
```

#### `src/index.ts`

**Important notes:**

* Remember to close the database when done.
  * In this example we listen for exit events on the `process`.

```ts
import Logs from "./models/logs";

Logs.insert({action: "script_started"});

// Cleanup & Final Save handler!
process.on('SIGTERM', async () => await Logs.close());
process.on('SIGINT', async () => await Logs.close());
```

#### `src/models/logs.ts`

**Important notes:**

* The Model exported here is effectively a singleton.
* It includes the typescript type & SQL `CREATE TABLE` script.

```ts
import modelFactory from "./index";

interface LogRecord {
  id: number; // INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp: number; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  action: string; // VARCHAR(50),
  error_message: string; // TEXT,
  error_stack: string; // TEXT,
  source_file_name: string; // VARCHAR(100),
  source_line_number: number; // INTEGER,
  data: string; // TEXT
}

logService = modelFactory<LogRecord>({
  tableName: "logs",
  filePath: "./db.sqlite",
  createTableSql: `CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(50),
    error_message TEXT,
    error_stack TEXT,
    source_file_name VARCHAR(100),
    source_line_number INTEGER,
    data TEXT
  );`,
});

export default logService;
```


## API

For the following API examples, most use this example interface:

```ts
const customerModel = modelFactory<{ name: string }>({
  tableName: "customers",
  createTableSql: `CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )`,
});
```

- [`**modelFactory()**`](#modelfactoryoptions)

- [`Model#close()`](#close)
- [`Model#get(query, params)`](#getquery-params)
- [`Model#getAll(query, params)`](#getallquery-params)
- [`Model#insert(sql, params)`](#insertquery-params)*
- [`Model#update(sql, params)`](#update-sql-params)*
- [`Model#remove(sql, params)`](#update-sql-params)*
  <!--
  - [ ] TODO: [Model#configure(option, value)](#configureoption-value)
  - [ ] TODO: [Model#run(sql, [param, ...])](#runsql-param)
  - [ ] TODO: [Model#each(sql, [param, ...], [complete])](#eachsql-param-complete) -->

### `modelFactory(options)`

**`options`**

**filePath?: string**
Valid values are filenames, `":memory:"` for an anonymous in-memory database and an empty string for an anonymous disk-based database. Anonymous databases are not persisted and when closing the database handle, their contents are lost.

**tableName: string**
The table name to use for insert, update and delete commands.

**createTableSql: string**
Must be a complete SQL DML Statement. Should start with `CREATE TABLE IF NOT EXISTS table_name ...`

#### In-memory example

```ts
const customers = modelFactory({
  tableName: "customers",
  createTableSql: `CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )`,
});
```

#### Disk-based example

```js
const customers = modelFactory({
  tableName: "customers",
  createTableSql: `CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )`,
  filePath: "./customers.sqlite"
});
```

### `.close()`

Closes the database.
Data could be lost if you forget to call this!

### `.get(query, params)`

Runs the SQL query with the specified parameters and resolves with the first result row afterwards. If the result set is empty, returns undefined.

The property names correspond to the column names of the result set.

It is impossible to access them by column index; the only supported way is by column name.

* @param {string} query The SQL query to run.

* @param {any} [params, ...] When the SQL statement contains placeholders, you can pass them in here. They will be bound to the statement before it is executed. There are three ways of passing bind parameters: directly in the function's arguments, as an array, and as an object for named parameters. This automatically sanitizes inputs.

[See related method from node-sqlite3](https://github.com/mapbox/node-sqlite3/wiki/API#databasegetsql-param--callback)


### `.getAll(query, params)`

Runs the SQL query with the specified parameters. The parameters are the same as the Model#run function, with the following differences:

If the result set is empty, it will be an empty array, otherwise it will have an object for each result row which in turn contains the values of that row, like the Model#get function.

> Note: `getAll` first retrieves all result rows and stores them in memory.

* @param {string} `query` The SQL query to run.
* @param {array | object} params When the SQL statement contains placeholders, you can pass them in here. They will be bound to the statement before it is executed. 

There are three ways of passing bind parameters:

1. directly in the function's arguments,
2. as an array, 
3. and as an object for named parameters.

Input is automatically sanitized.

```ts
const customerModel = modelFactory<{ name: string }>({
  tableName: "customers",
  createTableSql: `CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )`,
});
await customerModel.insert({ name: "Dan" });
await customerModel.insert({ name: "Rosie" });
await customerModel.insert({ name: "Sunflower" });

// 1 match found:
customerModel.getAll("SELECT * FROM customers WHERE name = :name",{ name: "Dan" });
// no matches found:
customerModel.getAll("SELECT * FROM customers WHERE name = :name",{ name: "not in the table!" });

```
