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

// Schemas Zod
const courseSchema = z.object({
  title: z.string().min(3),
});

const lessonSchema = z.object({
  title: z.string().min(3),
  status: z.enum(["draft", "published"]),
});

// Params schema para IDs (UUID o strings genéricos)
const idParamSchema = z.object({
  id: z.string(),
});

const lessonIdParamSchema = z.object({
  lessonId: z.string(),
});

// Obtener cursos (filtrar por academy_id)
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

// Crear curso (body validado)
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

// Listar lecciones (según rol y validando params)
courses.get(
  "/:id/lessons",
  verifyJWT,
  authorize(["admin", "teacher", "student"]),
  async (c) => {
    const user = c.get("user");
    const paramsValidation = idParamSchema.safeParse(c.req.param());
    if (!paramsValidation.success) {
      return c.json({ error: "Invalid course ID" }, 400);
    }
    const courseId = paramsValidation.data.id;

    let query = "";
    let bindParams: any[] = [];

    if (user.role === "student") {
      // Los estudiantes solo ven lecciones publicadas de su curso
      query =
        "SELECT * FROM lessons WHERE course_id = ? AND status = 'published'";
      bindParams = [courseId];
    } else {
      // Admin y teacher ven todas las lecciones de ese curso
      query = "SELECT * FROM lessons WHERE course_id = ?";
      bindParams = [courseId];
    }

    const result = await c.env.DB.prepare(query)
      .bind(...bindParams)
      .all();

    return c.json(result.results);
  }
);

// Crear lección
courses.post(
  "/:id/lessons",
  verifyJWT,
  authorize(["admin", "teacher"]),
  async (c) => {
    const user = c.get("user");

    // Validar params
    const paramsValidation = idParamSchema.safeParse(c.req.param());
    if (!paramsValidation.success) {
      return c.json({ error: "Invalid course ID" }, 400);
    }
    const courseId = paramsValidation.data.id;

    // Validar body
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

    // Validar params
    const paramsValidation = z
      .object({
        id: z.string(),
        lessonId: z.string(),
      })
      .safeParse(c.req.param());

    if (!paramsValidation.success) {
      return c.json({ error: "Invalid parameters" }, 400);
    }

    const { id: courseId, lessonId } = paramsValidation.data;

    const result = await c.env.DB.prepare(
      "DELETE FROM lessons WHERE id = ? AND course_id = ? AND author_user_id = ? RETURNING *"
    )
      .bind(lessonId, courseId, user.id)
      .run();

    if (!result.results[0]) {
      return c.json({ message: "Not found or unauthorized" }, 404);
    }

    return c.json(result.results[0]);
  }
);

export default courses;
