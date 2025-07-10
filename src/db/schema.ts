import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const academies = sqliteTable("academies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["admin", "instructor", "student"] }).notNull(),
    academyId: text("academy_id")
      .notNull()
      .references(() => academies.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    academyEmailIdx: index("academy_email_idx").on(
      table.academyId,
      table.email
    ),
    academyRoleIdx: index("academy_role_idx").on(table.academyId, table.role),
  })
);

export const courses = sqliteTable(
  "courses",
  {
    id: text("id").primaryKey(), 
    title: text("title").notNull(),
    description: text("description"),
    academyId: text("academy_id")
      .notNull()
      .references(() => academies.id, { onDelete: "cascade" }),
    instructorUserId: text("instructor_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    academyIdx: index("courses_academy_idx").on(table.academyId),
    instructorIdx: index("courses_instructor_idx").on(table.instructorUserId),
  })
);

export const lessons = sqliteTable(
  "lessons",
  {
    id: text("id").primaryKey(), // UUID
    title: text("title").notNull(),
    content: text("content"),
    status: text("status", { enum: ["draft", "published", "archived"] })
      .notNull()
      .default("draft"),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    courseIdx: index("lessons_course_idx").on(table.courseId),
    authorIdx: index("lessons_author_idx").on(table.authorUserId),
    statusIdx: index("lessons_status_idx").on(table.courseId, table.status),
  })
);

export const materials = sqliteTable(
  "materials",
  {
    id: text("id").primaryKey(), 
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSize: integer("file_size").notNull(),
    urlR2: text("url_r2").notNull(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    uploadedAt: integer("uploaded_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    lessonIdx: index("materials_lesson_idx").on(table.lessonId),
  })
);

export const academiesRelations = relations(academies, ({ many }) => ({
  users: many(users),
  courses: many(courses),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  academy: one(academies, {
    fields: [users.academyId],
    references: [academies.id],
  }),
  instructedCourses: many(courses, { relationName: "instructor" }),
  authoredLessons: many(lessons, { relationName: "author" }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  academy: one(academies, {
    fields: [courses.academyId],
    references: [academies.id],
  }),
  instructor: one(users, {
    fields: [courses.instructorUserId],
    references: [users.id],
    relationName: "instructor",
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  author: one(users, {
    fields: [lessons.authorUserId],
    references: [users.id],
    relationName: "author",
  }),
  materials: many(materials),
}));

export const materialsRelations = relations(materials, ({ one }) => ({
  lesson: one(lessons, {
    fields: [materials.lessonId],
    references: [lessons.id],
  }),
}));

export type Academy = typeof academies.$inferSelect;
export type NewAcademy = typeof academies.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

export type Material = typeof materials.$inferSelect;
export type NewMaterial = typeof materials.$inferInsert;
