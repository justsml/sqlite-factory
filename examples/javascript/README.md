

### Folder structure

```
- src/index.js
- src/models/logs.js
```

#### `src/index.js`

**Important notes:**

* Remember to close the database when done.
  * In this example we listen for exit events on the `process`.

```js
import Logs from "./models/logs.js";

Logs.insert({action: "script_started"});

// Cleanup & Final Save handler!
process.on('SIGTERM', async () => await Logs.close());
process.on('SIGINT', async () => await Logs.close());
```

#### `src/models/logs.js`

**Important notes:**

* The Model exported here is effectively a singleton.
* It includes the SQL `CREATE TABLE` script.

```js
import modelFactory from "./index";

const logService = modelFactory({
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

