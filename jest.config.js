module.exports = {
  // Env settings
  testMatch: [
    "**/?(*.)+(spec|test).ts"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testTimeout: 30000,
  testEnvironment: "node",
  preset: "ts-jest",
  verbose: true,
  // Ignoring directories
  modulePathIgnorePatterns: [
    /* integration testing */
    // "./__tests__/integration/v1.1/*",
    "./__tests__/integration/v1.1/index.test.ts",
    // "./__tests__/integration/v1.1/auth.test.ts",

    /* service testing */
    // "./__tests__/services/v1.1/*",
    "./__tests__/services/v1.1/auth.service.test.ts",
    "./__tests__/services/v1.1/users.service.test.ts",
  ],

  // Triggered before all test cases start
  globalSetup: "./__tests__/configs/globalSetup.js",

  // Triggered when all test cases end
  // globalTeardown: "./__tests__/configs/globalTeardown.js",
}; 