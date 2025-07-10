import { jwtVerify, type JWTPayload } from "jose";
import type { AuthMiddleware } from "../types/hono";

interface CustomJWTPayload extends JWTPayload {
  userId: string;
  academyId: string;
  role: "admin" | "teacher" | "student";
}

function isCustomPayload(payload: JWTPayload): payload is CustomJWTPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "userId" in payload &&
    "academyId" in payload &&
    "role" in payload
  );
}

export const verifyJWT: AuthMiddleware = async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Token de autorización requerido" }, 401);
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    if (!isCustomPayload(payload)) {
      throw new Error("Estructura del token inválida");
    }

    const { userId, academyId, role } = payload;

    const user = await c.env.DB.prepare(
      "SELECT id, email, role, academy_id FROM users WHERE id = ?"
    )
      .bind(userId)
      .first<{
        id: string;
        email: string;
        role: string;
        academy_id: string;
      }>();

    if (!user) {
      return c.json({ error: "Usuario no encontrado" }, 401);
    }

    c.set("user", {
      id: user.id,
      email: user.email,
      role: user.role as "admin" | "teacher" | "student",
      academyId: user.academy_id,
    });

    await next();
  } catch (error) {
    console.error("Error en verificación JWT:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Token inválido" },
      401
    );
  }
};

export const authorize = (
  roles: Array<"admin" | "teacher" | "student">
): AuthMiddleware => {
  return async (c, next) => {
    const user = c.get("user");
    if (!roles.includes(user.role)) {
      return c.json(
        { error: "No tienes permisos para acceder a este recurso" },
        403
      );
    }
    await next();
  };
};

export const requireSameAcademy: AuthMiddleware = async (c, next) => {
  const user = c.get("user");
  const academyIdFromHeader = c.req.header("X-Academy-ID");

  if (academyIdFromHeader && academyIdFromHeader !== user.academyId) {
    return c.json({ error: "Acceso denegado a esta academia" }, 403);
  }

  await next();
};
