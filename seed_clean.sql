-- Insertar academias
INSERT INTO academies (id, name) VALUES
  ('academy-1', 'Academia de Tecnologia'),
  ('academy-2', 'Instituto de Idiomas');

-- Insertar usuarios
INSERT INTO users (id, email, password_hash, role, academy_id) VALUES
  ('user-admin-1', 'admin@academia-tech.com', '$2a$12$dOlllCIUhzpfUCkuBH0q8uWjkqStMiEW9RjCx/ZnKE3/uR6SD6L.G', 'admin', 'academy-1'),
  ('user-teacher-1', 'profesor@academia-tech.com', '$2a$12$6ukism5R06c0UdgIbQWQiuOlGJuJCp157NmAKypfTo29QnJ/G327a', 'teacher', 'academy-1'),
  ('user-student-1', 'estudiante@academia-tech.com', '$2a$12$HSLsbFPgcE.r3Sxx9wDGDeUWdepz.HSJgMDt67ZJcHL7pG0SJ2FPK', 'student', 'academy-1'),
  ('user-admin-2', 'admin@instituto-idiomas.com', '$2a$12$dOlllCIUhzpfUCkuBH0q8uWjkqStMiEW9RjCx/ZnKE3/uR6SD6L.G', 'admin', 'academy-2'),
  ('user-teacher-2', 'profesor@instituto-idiomas.com', '$2a$12$6ukism5R06c0UdgIbQWQiuOlGJuJCp157NmAKypfTo29QnJ/G327a', 'teacher', 'academy-2'),
  ('user-student-2', 'estudiante@instituto-idiomas.com', '$2a$12$HSLsbFPgcE.r3Sxx9wDGDeUWdepz.HSJgMDt67ZJcHL7pG0SJ2FPK', 'student', 'academy-2');

-- Insertar cursos
INSERT INTO courses (id, title, academy_id, instructor_user_id) VALUES
  ('course-1', 'Introduccion a JavaScript', 'academy-1', 'user-teacher-1'),
  ('course-2', 'React Avanzado', 'academy-1', 'user-teacher-1'),
  ('course-3', 'Ingles Basico', 'academy-2', 'user-teacher-2'),
  ('course-4', 'Frances Intermedio', 'academy-2', 'user-teacher-2');

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