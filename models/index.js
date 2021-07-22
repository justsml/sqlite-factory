const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

const setupLogger = async ({ filePath } = {}) => {
  db = await open({
    filename: filePath || ":memory:",
    driver: sqlite3.Database,
  });
  db.on("error", console.error);
  await autoCreateTable(db);
  return LogService(db);
};

async function autoCreateTable(db) {
  await db.exec(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(50),
    error_message TEXT,
    error_stack TEXT,
    source_file_name VARCHAR(100),
    source_line_number INTEGER,
    data TEXT
  );`);
}

function LogService(db) {
  return {
    close: () => db.close(),
    getAll: ({query, params}) => db.all(query, params),
    get: ({query, params}) => db.get(query, params),
    insert: ({ action, error, sourceFile, lineNumber, data }) => {
      return db.run(
        `
      INSERT INTO logs (
        action, error_message, error_stack, source_file_name, source_line_number, data
      ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          action,
          error ? error.message : null,
          error ? error.stack : null,
          sourceFile,
          lineNumber,
          JSON.stringify(data),
        ]
      );
    },
  };
};

module.exports = { setupLogger };
