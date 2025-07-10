"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSeedData = generateSeedData;
exports.createSeedFile = createSeedFile;
var password_1 = require("../utils/password");
function generateSeedData() {
    return __awaiter(this, void 0, void 0, function () {
        var adminPassword, teacherPassword, studentPassword, sql;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, password_1.hashPassword)("Admin123!")];
                case 1:
                    adminPassword = _a.sent();
                    return [4 /*yield*/, (0, password_1.hashPassword)("Teacher123!")];
                case 2:
                    teacherPassword = _a.sent();
                    return [4 /*yield*/, (0, password_1.hashPassword)("Student123!")];
                case 3:
                    studentPassword = _a.sent();
                    sql = "\n-- Insertar academias\nINSERT INTO academies (id, name) VALUES \n  ('academy-1', 'Academia de Tecnolog\u00EDa'),\n  ('academy-2', 'Instituto de Idiomas');\n\n-- Insertar usuarios\nINSERT INTO users (id, email, password_hash, role, academy_id) VALUES \n  ('user-admin-1', 'admin@academia-tech.com', '".concat(adminPassword, "', 'admin', 'academy-1'),\n  ('user-teacher-1', 'profesor@academia-tech.com', '").concat(teacherPassword, "', 'teacher', 'academy-1'),\n  ('user-student-1', 'estudiante@academia-tech.com', '").concat(studentPassword, "', 'student', 'academy-1'),\n  ('user-admin-2', 'admin@instituto-idiomas.com', '").concat(adminPassword, "', 'admin', 'academy-2'),\n  ('user-teacher-2', 'profesor@instituto-idiomas.com', '").concat(teacherPassword, "', 'teacher', 'academy-2'),\n  ('user-student-2', 'estudiante@instituto-idiomas.com', '").concat(studentPassword, "', 'student', 'academy-2');\n\n-- Insertar cursos\nINSERT INTO courses (id, title, academy_id, instructor_user_id) VALUES \n  ('course-1', 'Introducci\u00F3n a JavaScript', 'academy-1', 'user-teacher-1'),\n  ('course-2', 'React Avanzado', 'academy-1', 'user-teacher-1'),\n  ('course-3', 'Ingl\u00E9s B\u00E1sico', 'academy-2', 'user-teacher-2'),\n  ('course-4', 'Franc\u00E9s Intermedio', 'academy-2', 'user-teacher-2');\n\n-- Insertar lecciones\nINSERT INTO lessons (id, title, status, course_id, author_user_id) VALUES \n  ('lesson-1', 'Variables y Tipos de Datos', 'published', 'course-1', 'user-teacher-1'),\n  ('lesson-2', 'Funciones en JavaScript', 'published', 'course-1', 'user-teacher-1'),\n  ('lesson-3', 'Componentes React', 'draft', 'course-2', 'user-teacher-1'),\n  ('lesson-4', 'Presente Simple', 'published', 'course-3', 'user-teacher-2'),\n  ('lesson-5', 'Pasado Simple', 'published', 'course-3', 'user-teacher-2'),\n  ('lesson-6', 'Verbos Irregulares', 'draft', 'course-4', 'user-teacher-2');\n\n-- Insertar materiales\nINSERT INTO materiales (id, filename, url_r2, lesson_id) VALUES \n  ('material-1', 'variables.pdf', 'https://r2.example.com/variables.pdf', 'lesson-1'),\n  ('material-2', 'ejercicios-variables.zip', 'https://r2.example.com/ejercicios-variables.zip', 'lesson-1'),\n  ('material-3', 'funciones.pdf', 'https://r2.example.com/funciones.pdf', 'lesson-2'),\n  ('material-4', 'present-simple.pdf', 'https://r2.example.com/present-simple.pdf', 'lesson-4'),\n  ('material-5', 'audio-present.mp3', 'https://r2.example.com/audio-present.mp3', 'lesson-4');\n  ");
                    return [2 /*return*/, sql];
            }
        });
    });
}
function createSeedFile() {
    return __awaiter(this, void 0, void 0, function () {
        var sql;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, generateSeedData()];
                case 1:
                    sql = _a.sent();
                    console.log("Contenido del archivo seed.sql:");
                    console.log(sql);
                    console.log("\n--- Instrucciones ---");
                    console.log('1. Guarda el contenido de arriba en un archivo llamado "seed.sql"');
                    console.log("2. Ejecuta: npx wrangler d1 execute lms-db --local --file=./seed.sql");
                    console.log("3. Para producción usa: npx wrangler d1 execute lms-db --file=./seed.sql");
                    return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    createSeedFile().catch(console.error);
}
