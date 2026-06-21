// Global Jest setup — runs before every test file (setupFilesAfterEnv).
// Spins up an in-memory MongoDB, sets the env vars the app reads at runtime,
// and stubs external services (Brevo email, Cloudflare R2) so no network calls fire.

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// ── Env vars the production code reads via process.env ──
// Set BEFORE any app module is imported by a test.
process.env.JWT_SECRET = "test-access-secret-do-not-use-in-prod";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-do-not-use-in-prod";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.CLIENT_URL = "https://app.test,https://second.test";
process.env.NODE_ENV = "test";
// R2 is mocked below, but the module logs a warning if these are unset.
process.env.R2_ACCESS_KEY_ID = "test";
process.env.R2_SECRET_ACCESS_KEY = "test";
process.env.R2_PUBLIC_URL = "https://r2.test";
process.env.R2_ENDPOINT = "https://r2.test";
process.env.R2_BUCKET_NAME = "test-bucket";

// ── Mock the email service: never hit Brevo ──
jest.mock("../src/utils/emailService", () => ({
	sendOtpEmail: jest.fn().mockResolvedValue(undefined),
}));

// ── Mock R2: never hit Cloudflare ──
jest.mock("../src/utils/r2", () => ({
	uploadToR2: jest.fn().mockResolvedValue({
		url: "https://r2.test/notes/mockedkey.pdf",
		key: "notes/mockedkey.pdf",
		size: 1234,
	}),
	deleteFromR2: jest.fn().mockResolvedValue(undefined),
	R2_PUBLIC_URL: "https://r2.test",
}));

let mongo: MongoMemoryServer;

beforeAll(async () => {
	mongo = await MongoMemoryServer.create();
	const uri = mongo.getUri();
	process.env.MONGO_URI = uri;
	await mongoose.connect(uri);
});

afterEach(async () => {
	// Wipe all collections between tests for isolation.
	const collections = mongoose.connection.collections;
	for (const key of Object.keys(collections)) {
		await collections[key].deleteMany({});
	}
	jest.clearAllMocks();
});

afterAll(async () => {
	await mongoose.disconnect();
	if (mongo) await mongo.stop();
});
