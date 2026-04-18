import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// ── Cloudflare R2 Client (S3-compatible) ──

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? "ulab-notes";
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, ""); // strip trailing slash

// Use R2_ENDPOINT directly if available, otherwise construct from R2_ACCOUNT_ID
const R2_ENDPOINT = process.env.R2_ENDPOINT
	?? (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "");

// Validate on import — log warning if not configured (won't crash the server)
if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PUBLIC_URL) {
	console.warn(
		"[R2] ⚠ Cloudflare R2 is NOT configured. Note uploads will fail.\n" +
		"    Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL in .env"
	);
} else {
	console.log(`[R2] ✓ Configured — endpoint: ${R2_ENDPOINT}, bucket: ${R2_BUCKET_NAME}`);
}

const r2Client = new S3Client({
	region: "auto",
	endpoint: R2_ENDPOINT,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_ACCESS_KEY,
	},
});

/**
 * Upload a PDF buffer to Cloudflare R2.
 * Returns the full public URL of the uploaded file.
 */
export async function uploadToR2(
	buffer: Buffer,
	originalFilename: string
): Promise<{ url: string; key: string; size: number }> {
	const uniqueId = crypto.randomBytes(16).toString("hex");
	const ext = originalFilename.toLowerCase().endsWith(".pdf") ? ".pdf" : ".pdf";
	const key = `notes/${uniqueId}${ext}`;

	await r2Client.send(
		new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key,
			Body: buffer,
			ContentType: "application/pdf",
			// Make publicly readable via the R2 public URL
		})
	);

	const url = `${R2_PUBLIC_URL}/${key}`;
	console.log(`[R2] Uploaded: ${key} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) → ${url}`);

	return { url, key, size: buffer.length };
}

/**
 * Delete a file from R2 by its key (e.g. "notes/abc123.pdf").
 * Non-fatal — logs a warning if deletion fails.
 */
export async function deleteFromR2(fileUrl: string): Promise<void> {
	try {
		// Extract the key from the full URL
		// e.g. "https://pub-xxx.r2.dev/notes/abc123.pdf" → "notes/abc123.pdf"
		let key = fileUrl;
		if (fileUrl.startsWith("http")) {
			const urlObj = new URL(fileUrl);
			key = urlObj.pathname.replace(/^\/+/, ""); // strip leading slashes
		}

		await r2Client.send(
			new DeleteObjectCommand({
				Bucket: R2_BUCKET_NAME,
				Key: key,
			})
		);
		console.log(`[R2] Deleted: ${key}`);
	} catch (err) {
		console.warn(`[R2] Could not delete: ${fileUrl}`, err);
	}
}

export { R2_PUBLIC_URL };
