import modelFactory from "./index";
type ThenArgRecursive<T> = T extends PromiseLike<infer U>
  ? ThenArgRecursive<U>
  : T;

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

let logger: ThenArgRecursive<ReturnType<typeof modelFactory>>;

beforeAll(async () => {
  // logger = await setupLogger(); // in-memory
  logger = await modelFactory<LogRecord>({
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
  }); // on file-system
});

afterAll(async () => await logger.close());

test("can add logs", async () => {
  const result = await logger.insert({
    action: "test",
    // error: null,
    source_file_name: "test.json",
    source_line_number: 24,
    data: JSON.stringify({ row: [1, 2, 3, "fake data!"] }),
  });
  expect(result).toBeDefined();
});

test("can query multiple rows", async () => {
  const [result] = await logger.getAll<any[]>({
    query: `SELECT COUNT(*) as count FROM logs WHERE action = ?`,
    params: ["test"],
  });
  expect(result.count).toBeGreaterThanOrEqual(1);
});

test("can query single rows", async () => {
  // @ts-ignore
  const { count } = await logger.get<{ count: number }>({
    query: `SELECT COUNT(*) as count FROM logs WHERE action = ?`,
    params: ["test"],
  });
  expect(count).toBeGreaterThanOrEqual(1);
});
