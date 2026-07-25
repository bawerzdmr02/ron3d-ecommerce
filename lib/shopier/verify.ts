import { createHmac, timingSafeEqual } from "crypto";

export function getShopierWebhookToken(): string | null {
  const token =
    process.env.SHOPIER_WEBHOOK_TOKEN?.trim() ||
    process.env.SHOPIER_API_SECRET?.trim() ||
    null;
  return token || null;
}

function timingSafeCompare(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** HMAC-SHA256 over raw body; accepts hex or base64 Shopier-Signature. */
export function verifyShopierSignature(
  token: string,
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature?.trim()) return false;

  const expectedHex = createHmac("sha256", token)
    .update(rawBody, "utf8")
    .digest("hex");
  const expectedBase64 = createHmac("sha256", token)
    .update(rawBody, "utf8")
    .digest("base64");

  const received = signature.trim();
  return (
    timingSafeCompare(expectedHex, received) ||
    timingSafeCompare(expectedBase64, received)
  );
}

export function getHeader(
  headers: Headers,
  name: string
): string | null {
  return headers.get(name) ?? headers.get(name.toLowerCase());
}

export function createTestSignature(token: string, rawBody: string): string {
  return createHmac("sha256", token).update(rawBody, "utf8").digest("hex");
}
