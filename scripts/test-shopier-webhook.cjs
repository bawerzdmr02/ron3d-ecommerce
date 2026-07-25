#!/usr/bin/env node
/**
 * Local Shopier webhook smoke test.
 * Usage: node scripts/test-shopier-webhook.mjs [baseUrl]
 */
const { createHmac } = require("crypto");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const i = trimmed.indexOf("=");
    env[trimmed.slice(0, i)] = trimmed.slice(i + 1);
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const token = env.SHOPIER_WEBHOOK_TOKEN || env.SHOPIER_API_SECRET;
  if (!token) {
    console.error("Missing SHOPIER_WEBHOOK_TOKEN in .env.local");
    process.exit(1);
  }

  const base = process.argv[2] || "http://localhost:3000";
  const userId = process.argv[3] || "7410fad4-8fef-4148-b05a-282b442c8f62";

  const payload = {
    id: `test-order-${Date.now()}`,
    email: "tiproj002@gmail.com",
    price: "199.90",
    customerNote: JSON.stringify({
      user_id: userId,
      custom_text: "Ron3D test siparisi",
    }),
  };

  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", token).update(body).digest("hex");

  console.log("POST", `${base}/api/webhook/shopier`);
  console.log("event: order.created");

  // 1) invalid signature should 401
  const bad = await fetch(`${base}/api/webhook/shopier`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "shopier-event": "order.created",
      "shopier-signature": "deadbeef",
      "shopier-webhook-id": "test-bad",
    },
    body,
  });
  console.log("invalid signature ->", bad.status, await bad.text());

  // 2) valid signature should insert
  const ok = await fetch(`${base}/api/webhook/shopier`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "shopier-event": "order.created",
      "shopier-signature": signature,
      "shopier-webhook-id": `test-${Date.now()}`,
      "shopier-timestamp": new Date().toISOString(),
    },
    body,
  });
  console.log("valid signature ->", ok.status, await ok.text());

  // 3) duplicate should skip
  const dup = await fetch(`${base}/api/webhook/shopier`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "shopier-event": "order.created",
      "shopier-signature": signature,
      "shopier-webhook-id": `test-dup-${Date.now()}`,
    },
    body,
  });
  console.log("duplicate ->", dup.status, await dup.text());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
