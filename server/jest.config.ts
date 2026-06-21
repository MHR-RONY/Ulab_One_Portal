import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
	setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
	// In-memory Mongo spin-up can be slow on first download
	testTimeout: 30000,
	// Run serially — all suites share one in-memory Mongo instance
	maxWorkers: 1,
	clearMocks: true,
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				// Tests live outside src/ rootDir; isolatedModules avoids
				// project-wide type-checking friction and speeds runs up.
				isolatedModules: true,
			},
		],
	},
};

export default config;
