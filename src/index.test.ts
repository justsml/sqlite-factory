import sqliteFactory from "./index";

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

let logger: ReturnType<typeof sqliteFactory>;

beforeAll(async () => {
  logger = sqliteFactory<LogRecord>({
    tableName: "logs",
    filePath: "./db.sqlite",
    createTableSql: `
CREATE TABLE IF NOT EXISTS logs (
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
  const result = await logger.get<{ count: number }>({
    query: `SELECT COUNT(*) as count FROM logs WHERE action = ?`,
    params: ["test"],
  });
  const { count } = result || {};
  expect(count).toBeGreaterThanOrEqual(1);
});

test("invalid CREATE TABLE argument", async () => {
  expect(() =>
    sqliteFactory<LogRecord>({
      tableName: "logs",
      filePath: "./db.sqlite",
      createTableSql: `(bad script)`,
    })
  ).toThrow();
});

test("can handle invalid arguments", () => {
  expect(async () => sqliteFactory<LogRecord>()).rejects.toThrowError();
});

test("can use in-memory mode", async () => {
  const customers = sqliteFactory<{ name: string }>({
    tableName: "customers",
    createTableSql: `CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )`,
  });
  expect(customers.insert({ name: "test" })).resolves.toHaveProperty(
    "changes",
    1
  );
});

test("can update", async () => {
  const customers = sqliteFactory<{ name: string }>({
    tableName: "customers",
    createTableSql: `CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )`,
  });
  expect(customers.insert({ name: "test" })).resolves.toHaveProperty(
    "changes",
    1
  );
  expect(
    customers.update({ name: "dan" }, { name: "test" })
  ).resolves.toHaveProperty("changes", 1);
});

test("can update with custom WHERE clause", async () => {
  const customers = sqliteFactory<{ name: string }>({
    tableName: "customers",
    createTableSql: `CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )`,
  });
  expect(customers.insert({ name: "test" })).resolves.toBeDefined();
  expect(
    customers.update(
      { name: "dan" },
      { name: "test" },
      "NAME = :name AND NAME != 'admin'"
    )
  ).resolves.toBeDefined();
});

test("can update entire table", async () => {
  const customers = sqliteFactory<{ name: string }>({
    tableName: "customers",
    createTableSql: `CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )`,
  });
  expect(customers.insert({ name: "test" })).resolves.toBeDefined();
  expect(customers.update({ name: "dan" })).resolves.toBeDefined();
});

test("can remove with custom WHERE clause", async () => {
  const customers = sqliteFactory<{ name: string }>({
    tableName: "customers",
    createTableSql: `CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )`,
  });
  expect(customers.insert({ name: "test" })).resolves.toBeDefined();
  expect(
    customers.remove({ name: "dan" }, "name = :name AND name != 'admin'")
  ).resolves.toBeDefined();
});

test("can remove entire table", async () => {
  const customers = sqliteFactory<{ name: string }>({
    tableName: "customers",
    createTableSql: `CREATE TABLE IF NOT EXISTS customers ( name VARCHAR(50) )`,
  });
  expect(customers.insert({ name: "test" })).resolves.toHaveProperty("changes");
  expect(
    customers.remove({ name: "dan" }, "name = :name")
  ).resolves.toBeDefined();
});
