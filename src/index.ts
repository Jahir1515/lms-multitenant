import { Hono } from "hono";
import { cors } from "hono/cors";
import { AuthController } from "./controllers/auth";
import { verifyJWT, authorize } from "./middleware/auth";
import type { Env, AuthenticatedUser } from "./types/hono";

const app = new Hono<{
  Bindings: Env;
  Variables: {
    user: AuthenticatedUser;
  };
}>();

// Middleware global
app.use("*", cors());

// Ruta base
app.get("/", (c) => c.text("✅ LMS API funcionando"));

// Subrouter de API
const api = new Hono<{
  Bindings: Env;
  Variables: {
    user: AuthenticatedUser;
  };
}>();

// Rutas públicas
api.post("/auth/login", AuthController.login);
api.post("/auth/refresh", AuthController.refresh);
api.post("/auth/logout", AuthController.logout);

// Rutas protegidas
api.get("/auth/me", verifyJWT, AuthController.me);

// Rutas con roles
api.get("/admin/*", verifyJWT, authorize(["admin"]));
api.get("/teacher/*", verifyJWT, authorize(["admin", "teacher"]));
api.get("/student/*", verifyJWT, authorize(["admin", "teacher", "student"]));

// Montar rutas en /api/v1
app.route("/api/v1", api);

export default app;
