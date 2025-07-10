import { Hono } from "hono";
import { AuthController } from "../controllers/auth";
import { verifyJWT } from "../middlware/auth";

interface Env {
  DB: D1Database;
  KV_SESSIONS: KVNamespace;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
}

const authRoutes = new Hono<{ Bindings: Env }>();

authRoutes.post("/login", AuthController.login);
authRoutes.post("/refresh", AuthController.refresh);
authRoutes.post("/logout", AuthController.logout);

authRoutes.get("/me", verifyJWT, AuthController.me);

export { authRoutes };
