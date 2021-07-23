

### Folder structure

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
import sqliteFactory from "sqlite-factory";

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

const logService = sqliteFactory<LogRecord>({
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

