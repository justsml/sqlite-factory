/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    "/node_modules/",
    "/build/",
  ],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage",

};

module.exports = config;
