// src/middleware/auth.ts
import { Next } from "hono";
import { type JWTPayload, jwtVerify } from "jose";
import { AppContext, AuthenticatedUser } from "../types/hono";

interface CustomJWTPayload extends JWTPayload {
  userId: string;
  academyId: string;
  role: "admin" | "teacher" | "student";
}

export async function verifyJWT(c: AppContext, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Token de autorización requerido" }, 401);
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token con jose
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(c.env.JWT_SECRET)
    ).catch(() => {
      throw new Error("Token inválido");
    });

    const customPayload = payload as CustomJWTPayload;

    // Buscar usuario en la base de datos
    const user = await c.env.DB.prepare(
      "SELECT id, email, role, academy_id FROM users WHERE id = ?"
    )
      .bind(customPayload.userId)
      .first();

    if (!user) {
      return c.json({ error: "Usuario no encontrado" }, 401);
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id as string,
      email: user.email as string,
      role: user.role as "admin" | "teacher" | "student",
      academyId: user.academy_id as string,
    };

    c.set("user", authenticatedUser);
    await next();
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Token inválido",
      },
      401
    );
  }
}

// El resto de middlewares permanecen igual (solo cambia el tipo de user)
export function authorize(allowedRoles: ("admin" | "teacher" | "student")[]) {
  return async (c: AppContext, next: Next) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Usuario no autenticado" }, 401);
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          error: "Acceso denegado",
          required_roles: allowedRoles,
          user_role: user.role,
        },
        403
      );
    }

    await next();
  };
}

export function verifyTeacherCourseAccess() {
  return async (c: AppContext, next: Next) => {
    const user = c.get("user");
    const courseId = c.req.param("courseId");

    if (!courseId) {
      return c.json({ error: "Course ID requerido" }, 400);
    }

    if (user.role === "admin") {
      await next();
      return;
    }

    if (user.role === "teacher") {
      const course = await c.env.DB.prepare(
        "SELECT id FROM courses WHERE id = ? AND instructor_user_id = ? AND academy_id = ?"
      )
        .bind(courseId, user.id, user.academyId)
        .first();

      if (!course) {
        return c.json({ error: "Acceso denegado al curso" }, 403);
      }
    }

    await next();
  };
}

export function requireSameAcademy() {
  return async (c: AppContext, next: Next) => {
    const user = c.get("user");
    const academy_id = c.req.param("academy_id") || c.req.query("academy_id");

    if (user.academyId !== academy_id) {
      return c.json(
        {
          error: "Acceso denegado a esta academia",
          user_academy: user.academyId,
          requested_academy: academy_id,
        },
        403
      );
    }

    await next();
  };
}
