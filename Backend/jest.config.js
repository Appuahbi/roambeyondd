module.exports = {
    testEnvironment: "node",
    setupFiles: ["./src/__tests__/setup.js"],
    testMatch: ["**/__tests__/**/*.test.js"],
    collectCoverageFrom: [
        "src/**/*.js",
        "!src/server.js",
        "!src/docs/**",
        "!src/config/swagger.js"
    ],
    coverageDirectory: "coverage",
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
    testTimeout: 30000
};
