import { createHmac } from "node:crypto";

function getCoreUrl(): string {
  const value = process.env.DANVA_CORE_URL?.trim().replace(/\/$/, "");
  if (!value) throw new Error("DANVA_CORE_URL_NOT_CONFIGURED");
  return value;
}

function getSecret(): string {
  const value = process.env.DANVA_CORE_SHARED_SECRET?.trim();
  if (!value) throw new Error("DANVA_CORE_SHARED_SECRET_NOT_CONFIGURED");
  return value;
}

export type CoreUser = {
  id: string;
  email: string;
  role?: "user" | "admin";
};

export async function callDanvaCore(
  user: CoreUser,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const body = typeof init.body === "string" ? init.body : "";
  const timestamp = String(Date.now());
  const url = new URL(path, `${getCoreUrl()}/`);
  const canonical = [method, url.pathname, timestamp, body].join("\n");
  const signature = createHmac("sha256", getSecret()).update(canonical).digest("hex");

  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("x-danva-core-timestamp", timestamp);
  headers.set("x-danva-core-signature", signature);
  headers.set("x-danva-core-user-id", user.id);
  headers.set("x-danva-core-email", user.email);
  headers.set("x-danva-core-role", user.role ?? "user");

  return fetch(url, { ...init, method, headers, cache: "no-store" });
}
