const { setupLogger } = require("./index");

let logger;
beforeAll(async () => {
  // logger = await setupLogger(); // in-memory
  logger = await setupLogger({filePath: './db.sqlite'}); // on file-system
});

afterAll(async () => await logger.close());

test("can add logs", async () => {
  const result = await logger.insert({
    action: "test",
    error: null,
    sourceFile: "test.json",
    lineNumber: 24,
    data: { row: [1, 2, 3, "fake data!"] },
  });
  expect(result).toBeDefined();
});

test("can query multiple rows", async () => {
  const [result] = await logger.getAll({query: `SELECT COUNT(*) as count FROM logs WHERE action = ?`, params: ["test"]});
  expect(result.count).toBeGreaterThanOrEqual(1);
});

test("can query single rows", async () => {
  const {count} = await logger.get({query: `SELECT COUNT(*) as count FROM logs WHERE action = ?`, params: ["test"]});
  expect(count).toBeGreaterThanOrEqual(1);
});
