import type { MiddlewareHandler } from "hono";
import type { Env } from "../types/hono";

export const ipRateLimit: MiddlewareHandler<{ Bindings: Env }> = async (
  c,
  next
) => {
  const ip =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("x-forwarded-for") ||
    "unknown";

  const key = `rate-limit-ip:${ip}`;
  const current = await c.env.KV_SESSIONS.get(key);
  const count = current ? parseInt(current) : 0;

  if (count >= 60) {
    return c.json({ error: "Too many requests (IP rate limit)" }, 429);
  }

  if (!current) {
    await c.env.KV_SESSIONS.put(key, "1", { expirationTtl: 60 });
  } else {
    await c.env.KV_SESSIONS.put(key, (count + 1).toString());
  }

  await next();
};

export const apiKeyRateLimit: MiddlewareHandler<{ Bindings: Env }> = async (
  c,
  next
) => {
  const apiKey = c.req.header("X-API-Key");
  if (!apiKey) {
    return c.json({ error: "API key required" }, 401);
  }

  const key = `rate-limit-apikey:${apiKey}`;
  const current = await c.env.KV_SESSIONS.get(key);
  const count = current ? parseInt(current) : 0;

  if (count >= 1000) {
    return c.json({ error: "API key request limit exceeded" }, 429);
  }

  if (!current) {
    await c.env.KV_SESSIONS.put(key, "1", { expirationTtl: 86400 }); // 24h in seconds
  } else {
    await c.env.KV_SESSIONS.put(key, (count + 1).toString());
  }

  await next();
};
