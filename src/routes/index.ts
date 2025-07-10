import { Hono } from "hono";
import { authRoutes } from "./auth";
import apiRoutes from "./api";
import type { Env, AuthenticatedUser } from "../types/hono";

const app = new Hono<{
  Bindings: Env;
  Variables: {
    user: AuthenticatedUser;
  };
}>();

// Middleware de registro de solicitudes
app.use("*", async (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`);
  await next();
});

// Rutas
app.route("/auth", authRoutes);
app.route("/api", apiRoutes);

// Manejo de rutas no encontradas
app.notFound((c) => {
  return c.json({ error: "Endpoint no encontrado" }, 404);
});

// Health check básico
app.get("/", (c) => c.json({ status: "ok", version: c.env.API_VERSION }));

export default app;
