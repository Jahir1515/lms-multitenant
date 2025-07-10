import { hashPassword } from "../utils/password";

export async function generateSeedData() {
  const adminPassword = await hashPassword("Admin123!");
  const teacherPassword = await hashPassword("Teacher123!");
  const studentPassword = await hashPassword("Student123!");

  const sql = `
-- Insertar academias
INSERT INTO academies (id, name) VALUES 
  ('academy-1', 'Academia de Tecnología'),
  ('academy-2', 'Instituto de Idiomas');

-- Insertar usuarios
INSERT INTO users (id, email, password_hash, role, academy_id) VALUES 
  ('user-admin-1', 'admin@academia-tech.com', '${adminPassword}', 'admin', 'academy-1'),
  ('user-teacher-1', 'profesor@academia-tech.com', '${teacherPassword}', 'teacher', 'academy-1'),
  ('user-student-1', 'estudiante@academia-tech.com', '${studentPassword}', 'student', 'academy-1'),
  ('user-admin-2', 'admin@instituto-idiomas.com', '${adminPassword}', 'admin', 'academy-2'),
  ('user-teacher-2', 'profesor@instituto-idiomas.com', '${teacherPassword}', 'teacher', 'academy-2'),
  ('user-student-2', 'estudiante@instituto-idiomas.com', '${studentPassword}', 'student', 'academy-2');

-- Insertar cursos
INSERT INTO courses (id, title, academy_id, instructor_user_id) VALUES 
  ('course-1', 'Introducción a JavaScript', 'academy-1', 'user-teacher-1'),
  ('course-2', 'React Avanzado', 'academy-1', 'user-teacher-1'),
  ('course-3', 'Inglés Básico', 'academy-2', 'user-teacher-2'),
  ('course-4', 'Francés Intermedio', 'academy-2', 'user-teacher-2');

-- Insertar lecciones
INSERT INTO lessons (id, title, status, course_id, author_user_id) VALUES 
  ('lesson-1', 'Variables y Tipos de Datos', 'published', 'course-1', 'user-teacher-1'),
  ('lesson-2', 'Funciones en JavaScript', 'published', 'course-1', 'user-teacher-1'),
  ('lesson-3', 'Componentes React', 'draft', 'course-2', 'user-teacher-1'),
  ('lesson-4', 'Presente Simple', 'published', 'course-3', 'user-teacher-2'),
  ('lesson-5', 'Pasado Simple', 'published', 'course-3', 'user-teacher-2'),
  ('lesson-6', 'Verbos Irregulares', 'draft', 'course-4', 'user-teacher-2');

-- Insertar materiales
INSERT INTO materiales (id, filename, url_r2, lesson_id) VALUES 
  ('material-1', 'variables.pdf', 'https://r2.example.com/variables.pdf', 'lesson-1'),
  ('material-2', 'ejercicios-variables.zip', 'https://r2.example.com/ejercicios-variables.zip', 'lesson-1'),
  ('material-3', 'funciones.pdf', 'https://r2.example.com/funciones.pdf', 'lesson-2'),
  ('material-4', 'present-simple.pdf', 'https://r2.example.com/present-simple.pdf', 'lesson-4'),
  ('material-5', 'audio-present.mp3', 'https://r2.example.com/audio-present.mp3', 'lesson-4');
  `;

  return sql;
}

export async function createSeedFile() {
  const sql = await generateSeedData();
  console.log("Contenido del archivo seed.sql:");
  console.log(sql);
  console.log("\n--- Instrucciones ---");
  console.log(
    '1. Guarda el contenido de arriba en un archivo llamado "seed.sql"'
  );
  console.log(
    "2. Ejecuta: npx wrangler d1 execute lms-db --local --file=./seed.sql"
  );
  console.log(
    "3. Para producción usa: npx wrangler d1 execute lms-db --file=./seed.sql"
  );
}

if (require.main === module) {
  createSeedFile().catch(console.error);
}
