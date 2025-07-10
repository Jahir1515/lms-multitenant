import { Hono } from "hono";
import { cors } from "hono/cors";
import { AuthController } from "./controllers/auth";
import { verifyJWT, authorize } from "./middleware/auth";
import type { Env, AuthenticatedUser } from "./types/hono";
import courses from "./routes/courses";
import { ipRateLimit, apiKeyRateLimit } from "./middleware/rate-limit";

const app = new Hono<{
  Bindings: Env;
  Variables: {
    user: AuthenticatedUser;
  };
}>();

const allowedOrigins = [
  "http://localhost:5173",
  "https://your-production-domain.com",
];

// CORS con whitelist de origen
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return ""; // sin origin (ej. curl) no permite CORS
      return allowedOrigins.includes(origin) ? origin : "";
    },
  })
);

// Rate limiting global
app.use("*", ipRateLimit);
app.use("*", apiKeyRateLimit);

// Ruta base
app.get("/", (c) => c.text("✅ LMS API funcionando"));

// Subrouter API
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

api.route("/courses", courses);

export default app;
