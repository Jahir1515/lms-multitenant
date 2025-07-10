import { Hono } from "hono";
import { verifyJWT, authorize, requireSameAcademy } from "../middleware/auth";
import type { Env, AuthenticatedUser } from "../types/hono";

const api = new Hono<{
  Bindings: Env;
  Variables: {
    user: AuthenticatedUser;
  };
}>();

// Middlewares globales
api.use("*", verifyJWT);
api.use("*", requireSameAcademy);

// Endpoint para subir materiales
api.post(
  "/lessons/:lessonId/materials",
  authorize(["admin", "teacher"]),
  async (c) => {
    try {
      const lessonId = c.req.param("lessonId");
      if (!lessonId) {
        return c.json({ error: "ID de lección requerido" }, 400);
      }

      const user = c.get("user");

      const allowedTypes = c.env.ALLOWED_FILE_TYPES.split(",");
      const maxSize = parseInt(c.env.MAX_FILE_SIZE);

      const formData = await c.req.formData();
      const file = formData.get("file");

      if (!file || !(file instanceof File)) {
        return c.json({ error: "Archivo no válido" }, 400);
      }

      if (!allowedTypes.includes(file.type)) {
        return c.json(
          {
            error: "Tipo de archivo no permitido",
            allowed_types: allowedTypes,
            received_type: file.type,
          },
          400
        );
      }

      if (file.size > maxSize) {
        return c.json(
          {
            error: "Archivo demasiado grande",
            max_size: maxSize,
            file_size: file.size,
          },
          400
        );
      }

      const fileKey = `materials/${crypto.randomUUID()}-${file.name}`;
      const buffer = await file.arrayBuffer();
      await c.env.R2_MATERIALS.put(fileKey, buffer);

      const result = await c.env.DB.prepare(
        `INSERT INTO materials 
       (filename, url_r2, lesson_id, academy_id) 
       VALUES (?, ?, ?, ?) 
       RETURNING *`
      )
        .bind(file.name, fileKey, lessonId, user.academyId)
        .run();

      return c.json(result.results[0], 201);
    } catch (error) {
      console.error("Error al subir archivo:", error);
      return c.json(
        {
          error: error instanceof Error ? error.message : "Error interno",
        },
        500
      );
    }
  }
);

export default api;
