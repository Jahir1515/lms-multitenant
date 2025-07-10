import { Hono } from "hono";
import { cors } from "hono/cors";
import { HonoContext } from "./types/hono";
import { AuthController } from "./controllers/auth";
import { verifyJWT, authorize } from "./middlware/auth";

const app = new Hono<HonoContext>();

// Middleware global
app.use("*", cors());

// Rutas de autenticación (públicas)
app.post("/auth/login", AuthController.login);
app.post("/auth/refresh", AuthController.refresh);
app.post("/auth/logout", AuthController.logout);

// Rutas protegidas
app.get("/auth/me", verifyJWT, AuthController.me);

// Ejemplos de rutas con autorización
app.get("/admin/*", verifyJWT, authorize(["admin"]));
app.get("/teacher/*", verifyJWT, authorize(["admin", "teacher"]));
app.get("/student/*", verifyJWT, authorize(["admin", "teacher", "student"]));

export default app;
