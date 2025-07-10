import { Hono } from "hono";
import { z } from "zod";
import { verifyJWT, authorize } from "../middleware/auth";
import type { Env, AuthenticatedUser } from "../types/hono";

const courses = new Hono<{
  Bindings: Env;
  Variables: {
    user: AuthenticatedUser;
  };
}>();

// Validadores
const courseSchema = z.object({
  title: z.string().min(3),
});

const lessonSchema = z.object({
  title: z.string().min(3),
  status: z.enum(["draft", "published"]),
});

// Obtener cursos
courses.get(
  "/",
  verifyJWT,
  authorize(["admin", "teacher", "student"]),
  async (c) => {
    const user = c.get("user");
    const result = await c.env.DB.prepare(
      "SELECT * FROM courses WHERE academy_id = ?"
    )
      .bind(user.academyId)
      .all();

    return c.json(result.results);
  }
);

// Crear curso
courses.post("/", verifyJWT, authorize(["admin", "teacher"]), async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const result = await c.env.DB.prepare(
    "INSERT INTO courses (title, academy_id, instructor_user_id) VALUES (?, ?, ?) RETURNING *"
  )
    .bind(parsed.data.title, user.academyId, user.id)
    .run();

  return c.json(result.results[0], 201);
});

// CRUD de lecciones
courses.get(
  "/:id/lessons",
  verifyJWT,
  authorize(["admin", "teacher", "student"]),
  async (c) => {
    const courseId = c.req.param("id");
    const user = c.get("user");

    const result = await c.env.DB.prepare(
      "SELECT * FROM lessons WHERE course_id = ? AND author_user_id = ?"
    )
      .bind(courseId, user.id)
      .all();

    return c.json(result.results);
  }
);

courses.post(
  "/:id/lessons",
  verifyJWT,
  authorize(["admin", "teacher"]),
  async (c) => {
    const courseId = c.req.param("id");
    const user = c.get("user");
    const body = await c.req.json();

    const parsed = lessonSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }

    const result = await c.env.DB.prepare(
      "INSERT INTO lessons (title, status, course_id, author_user_id) VALUES (?, ?, ?, ?) RETURNING *"
    )
      .bind(parsed.data.title, parsed.data.status, courseId, user.id)
      .run();

    return c.json(result.results[0], 201);
  }
);

// Eliminar lección
courses.delete(
  "/:id/lessons/:lessonId",
  verifyJWT,
  authorize(["admin", "teacher"]),
  async (c) => {
    const user = c.get("user");
    const { id: courseId, lessonId } = c.req.param();

    const result = await c.env.DB.prepare(
      "DELETE FROM lessons WHERE id = ? AND course_id = ? AND author_user_id = ? RETURNING *"
    )
      .bind(lessonId, courseId, user.id)
      .run();

    return c.json(
      result.results[0] ?? { message: "No se encontró o no autorizado" }
    );
  }
);

export default courses;
